var config = require('config');
var fs = require('fs');


/*
 * client.attachErrorImage
 * Save the attached error image.
 * (error_id used here to attach image to error report).
 */
exports.attachErrorImage = function(req, pc) {
	try {
		for (var file in req.files) {
			if (req.files.hasOwnProperty(file)) {
				var errorImage = fs.readFileSync(req.files[file].path);
				fs.writeFileSync(config.reportDir + '/' + req.body.error_id + '.png', errorImage);
			}
		}
		return {};
	}
	catch (e) {
		throw new Error('not_saved');
	}
};


/*
 * client.error
 * Save the generated error report.
 * (error_id is always returned. case_id is returned if the player opens a case.)
 */
exports.error = function(req, pc) {
	try {
		var error_id = pc + '_' + Date.now();
		fs.writeFileSync(config.reportDir + '/' + error_id + '.json', JSON.stringify(req.body));
		if (config.slackbot) {
			var Slack = require('slack-node');
			var slack = new Slack();
			slack.setWebHook(config.slackbot.url);
			var errorText = req.body.flash_error.split('\n')[0];
			var errorChannel = config.slackbot.channel.client;
			if (errorText === 'USER REPORTED ERROR') {
				errorText = req.body.user_error;
				errorChannel = config.slackbot.channel.user;
			}
			slack.webhook({
				'channel': errorChannel,
				'icon_emoji': ':crab:',
				'attachments': [{
					'fallback': 'New error report received (' + config.slackbot.env + '): ' + error_id + ' (http://' + config.slackbot.reportLink + '/reports?id=' + error_id + ')',
					'pretext': 'New error report recieved from ' + config.slackbot.env,
					'title': 'Error report: ' + error_id,
					'title_link': 'http://' + config.slackbot.reportLink + '/reports?id=' + error_id,
					'text': errorText,
					'color': config.slackbot.color
				}]
			}, function (err, res) {
				if (err) {
					throw new Error('not_saved');
				}
			});
		}
		return {
			error_id: error_id
		};
	}
	catch (e) {
		throw new Error('not_saved');
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


/*
 * client.performance
 * Called to log Flash runtime/performance metrics approximately once
 * per second for non-god users.
 * see com.tinyspeck.debug.PerfLogger in the client
 */
exports.performance = function(req, pc) {
	// TODO: Implement me.
	return {};
};
