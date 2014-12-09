var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var wait = require('wait.for');
var bunyan = require('bunyan');
var config = require('config');
var mkdirp = require('mkdirp');
var api = require('./api');


function init() {
	console.log('Starting HTTP API...');
	mkdirp.sync(config.tmpDir);
	mkdirp.sync(config.logDir);
	global.log = bunyan.createLogger(config.bunyan);
	api.init();
	var app = express();
	var multiparty = multipart({
		uploadDir: config.tmpDir,
		maxFilesSize: '10mb'
	});
	app.use(bodyParser.urlencoded({
		extended: true,
		uploadDir: config.tmpDir,
		limit: '10mb'
	}));
	app.use('/reports', express.static(__dirname + '/reports'));
	app.all('/crossdomain.xml', function (req, res) {
		res.sendFile(__dirname + '/crossdomain.xml');
	});
	app.all('/:func', multiparty, logRequest, handleRequest, removeTempFiles);
	app.all('/simple/:func', multiparty, logRequest, handleRequest, removeTempFiles);
	app.listen(config.port);
	console.log('HTTP API ready on port ' + config.port);
}


function logRequest(req, res, next) {
	// Log the request!
	log.info('%s request from %s', req.params.func, req.connection.remoteAddress);
	return next();
}


function handleRequest(req, res, next) {
	// Handle the request.
	wait.launchFiber(api.handle, req.params.func, req, function cb(err, data) {
		if (err) {
			log.error('Error in HTTP API request "%s" (err: %s)', req.params.func, err.message);
		}
		res.statusCode = (data && data.status) ? data.status : 500;
		res.write(JSON.stringify(data ? data.body : {
			ok: 0,
			error: err ? err.message : 'unknown',
		}));
		res.end();
		return next();
	});
}


function removeTempFiles(req, res, next) {
	// If a file was uploaded, remove it from the temporary directory.
	if (req.files) {
		for (var file in req.files) {
			if (req.files.hasOwnProperty(file)) {
				fs.unlinkSync(req.files[file].path);
			}
		}
	}
	return next();
}


wait.launchFiber(init);