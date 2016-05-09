var fs = require('fs');
var mkdirp = require('mkdirp');
var wait = require('wait.for');


/*
 * god.avatar.saveSpritesheets
 */
exports.saveSpritesheets = function saveSpritesheets(req, pc) {
	return saveAvatarImages(req, pc, 'sheets', 'avatar_set_sheets');
};


/*
 * god.avatar.saveSingles
 */
exports.saveSingles = function saveSingles(req, pc) {
	return saveAvatarImages(req, pc, 'singles', 'avatar_set_singles');
};


function saveAvatarImages(req, pc, type, apiFunc) {
	var urlPath = '/c2.glitch.bz/avatars/' + pc + '/' + type + '/';
	var dir = __dirname + '/../eleven-assets' + urlPath;
	wait.for(mkdirp, dir);
	for (var key in req.files) {
		var file = req.files[key];
		//TODO: Store in outfit directories? Store with a timestamp/date/random number like TS did?
		data = wait.forMethod(fs, 'readFile', file.path);
		wait.forMethod(fs, 'writeFile', dir + file.name + '.png', data);
	}
	// save spritesheet paths to GS
	rpcObjCall(pc, apiFunc, [{url: urlPath + 'image'}]);
	return {};
}
