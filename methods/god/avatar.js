var config = require('config');
var fs = require('fs');
var mkdirp = require('mkdirp');
var wait = require('wait.for');


/*
 * god.avatar.saveSpritesheets
 */
exports.saveSpritesheets = function saveSpritesheets(req, pc) {
	log.info('saving spritesheets for %s', pc);
	return saveAvatarImages(req, pc, 'sheets', 'avatar_set_sheets');
};


/*
 * god.avatar.saveSingles
 */
exports.saveSingles = function saveSingles(req, pc) {
	// TODO: this only includes the left-faced singles; it seems we need to
	// create&save the flipped versions ourselves (unless we don't need them?
	// e.g., the client seems to flip the image itself in player info dialog)
	log.info('saving singles for %s', pc);
	return saveAvatarImages(req, pc, 'singles', 'avatar_set_singles');
};


function saveAvatarImages(req, pc, type, apiFunc) {
	var dateStr = new Date().toISOString().split('T')[0];
	var timeStr = '' + Math.floor(new Date().getTime() / 1000);
	var prefix = pc + '_' + timeStr;
	var urlPath = config.assetPaths.avatars + '/' + dateStr;
	var dir = config.assetDir + urlPath;
	log.info('writing images for %s to %s', pc, dir);
	wait.for(mkdirp, dir);
	for (var key in req.files) {
		var file = req.files[key];
		var name = file.name.replace(/^image_?/, '');
		if (!name.length) name = '172';  // special case for full-size single
		var target = dir + '/' + prefix + '_' + name + '.png';
		log.debug('writing %s/%s to %s', pc, key, target);
		// copying instead of moving here because the multipart middleware wants
		// to delete the temp files afterwards
		var data = wait.forMethod(fs, 'readFile', file.path);
		wait.forMethod(fs, 'writeFile', target, data);
	}
	// save spritesheet paths to GS
	rpcObjCall(pc, apiFunc, [{url: urlPath + '/' + prefix}]);
	return {};
}
