var avatarCommon = require('../../avatar_common');
var config = require('config');


/*
 * god.avatar.saveSpritesheets
 */
exports.saveSpritesheets = function saveSpritesheets(req, pc) {
	if (config.spritesheetGeneration !== 'server') {
		return {error: 'Not allowed'};
	}
	return avatarCommon.saveAvatarImages(req, pc, 'sheets', 'avatar_set_sheets');
};


/*
 * god.avatar.saveSingles
 */
exports.saveSingles = function saveSingles(req, pc) {
	if (config.spritesheetGeneration !== 'server') {
		return {error: 'Not allowed'};
	}
	return avatarCommon.saveAvatarImages(req, pc, 'singles', 'avatar_set_singles');
};
