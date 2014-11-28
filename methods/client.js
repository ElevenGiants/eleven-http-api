var utils = require('../utils');
var config = require('config');
var fs = require('fs');


/*
 * client.attachErrorImage
 * Save the attached error image.
 * (error_id used here to attach image to error report).
 */
exports.attachErrorImage = function(req, pc) {
	// Saving images to the temp dir for now.
	try {
		for (var file in req.files) {
			if (req.files.hasOwnProperty(file)) {
				var errorImage = fs.readFileSync(req.files[file].path);
				fs.writeFileSync(config.tmpDir + '/' + pc + '_' + Date.now() + '.png', errorImage);
			}
		}
		return {};
	}
	catch (e) {
		throw('not_saved');
	}
};


/*
 * client.error
 * Save the generated error report.
 * (error_id is always returned. case_id is returned if the player opens a case.)
 */
exports.error = function(req, pc) {
	// Saving reports to the temp dir for now.
	try {
		fs.writeFileSync(config.tmpDir + '/' + pc + '_' + Date.now() + '.json', JSON.stringify(req.body));
		return {};
	}
	catch (e) {
		throw('not_saved');
	}
};


/*
 * client.getShortUrl
 * Shorten the url (used in share achievement buttons).
 */
exports.getShortUrl = function(req, pc) {
	// TODO: Shorten the URL
	var body = {
		url: req.query.url
	};
	return body;
};


/*
 * client.getToken
 * Provides the client with a host/port and token.
 */
exports.getToken = function(req, pc) {
	var rsp = rpcCall('gs', 'getConnectData', [pc]);
	var body = {
		host: rsp.hostPort,
		token: rsp.authToken
	};
	return body;
};

