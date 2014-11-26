var utils = require('../utils');


/*
 * client.attachErrorImage
 * Save the attached error image (with a report?).
 */
exports.attachErrorImage = function(req, pc) {
	// TODO: Do something with req.body (contains error) and req.files (contains error image).
	return {};
};


/*
 * client.error
 * Save the generated error report.
 */
exports.error = function(req, pc) {
	// TODO: Log error found in req.body.
	return {};
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
		'host': rsp.hostPort,
		'token': rsp.authToken
	};
	return body;
};

