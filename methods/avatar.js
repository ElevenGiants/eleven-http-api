var mkdirp = require('mkdirp');
var wait = require('wait.for');

var tempOutfits = { // Temporary!
	0: {
		"sheets":  '/c2.glitch.bz/avatars/2012-11-06/4278d3563ac0cc7e32723ab78f01dd9e_1352230889',
		"singles": '/c2.glitch.bz/avatars/2012-11-06/4278d3563ac0cc7e32723ab78f01dd9e_1352230797'
	},
	1: {
		"sheets":  '/c2.glitch.bz/avatars/2011-09-28/bd84f87fa8316879b36b3c5199314704_1317222270',
		"singles": '/c2.glitch.bz/avatars/2011-09-28/bd84f87fa8316879b36b3c5199314704_1317222194'
	},
	2: {
		"sheets":  '/c2.glitch.bz/avatars/2011-10-13/49932e9cc22ce7547ff2536723dd1e15_1318532620',
		"singles": '/c2.glitch.bz/avatars/2011-10-13/49932e9cc22ce7547ff2536723dd1e15_1318532554',
	},
	3: {
		"sheets":  '/c2.glitch.bz/avatars/2011-10-24/e62b099c620aaed9b57b08b1e09d2fca_1319489132',
		"singles": '/c2.glitch.bz/avatars/2011-10-24/e62b099c620aaed9b57b08b1e09d2fca_1319489068',
	},
	4: {
		"sheets":  '/c2.glitch.bz/avatars/2011-07-13/0a9f08fb8c7512986af6699a67cae375_1310616660',
		"singles": '/c2.glitch.bz/avatars/2011-07-13/0a9f08fb8c7512986af6699a67cae375_1310615929',
	},
	5: {
		"sheets":  '/c2.glitch.bz/avatars/2011-12-14/9e7a8ab03b86595c3b430b445dd42ab0_1323884125',
		"singles": '/c2.glitch.bz/avatars/2011-12-14/9e7a8ab03b86595c3b430b445dd42ab0_1323884060',
	},
	6: {
		"sheets":  '/c2.glitch.bz/avatars/2012-01-12/6b2166648a494ce1f10703576b45fe1a_1326399040',
		"singles": '/c2.glitch.bz/avatars/2012-01-12/6b2166648a494ce1f10703576b45fe1a_1326398935',
	},
	7: {
		"sheets":  '/c2.glitch.bz/avatars/2012-01-17/87a87087db70bf12b4227eb3fe8ebadf_1326869566',
		"singles": '/c2.glitch.bz/avatars/2012-01-17/87a87087db70bf12b4227eb3fe8ebadf_1326869442',
	},
	8: {
		"sheets":  '/c2.glitch.bz/avatars/2012-02-15/44a749a9dc55a3bf6c56440f26a3db7f_1329355892',
		"singles": '/c2.glitch.bz/avatars/2012-02-15/44a749a9dc55a3bf6c56440f26a3db7f_1329355797',
	},
	9: {
		"sheets":  '/c2.glitch.bz/avatars/2012-05-28/77e27d7682b03fd150b6a1a049231993_1338204214',
		"singles": '/c2.glitch.bz/avatars/2012-05-28/77e27d7682b03fd150b6a1a049231993_1338204144',
	},
};


/*
 * avatar.getHistory
 * Fetch a players saved customizations.
 */
exports.getHistory = function(req, pc) {
	// TODO: Real implementation.
	var history = {};
	var total = 1;
	for (var slot in tempOutfits) {
		history[slot] = {
			outfit_id: slot,
			is_current: false,
			sheets_base: tempOutfits[slot].sheets,
			singles_base: tempOutfits[slot].singles
		};
		total++;
	}
	return { history: history, total: total };
};


/*
 * avatar.switchOutfit
 * Switches to another saved outfit.
 */
exports.switchOutfit = function(req, pc) {
	// TODO: Real implementation.
	var outfit = tempOutfits[req.query.outfit_id];
	rpcObjCall(pc, 'avatar_set_sheets', [{ url: outfit.sheets }]);
	rpcObjCall(pc, 'avatar_set_singles', [{ url: outfit.singles }]);
	return {};
};

exports.saveAvatar = function(req, pc) {
	var items_to_grant = {};
	for (var i in req.body.wardrobe_items) {
		items_to_grant[req.body.wardrobe_items[i]] = {granted: true};
	}
	rpcObjCall(pc, 'clothing_admin_add_multi', [items_to_grant]);
	rpcObjCall(pc, 'avatar_admin_set_full', [{hash: req.body.hash}]);
	return {};
};


/*
 * avatar.saveSpritesheets
 */
exports.saveSpritesheets = function(req, pc) {
	var fs = require('fs');
	var url_path = '/c2.glitch.bz/avatars/' + pc + '/sheets/';
	var dir = __dirname + '/../../eleven-assets' + url_path;
	wait.for(mkdirp, dir);
	for (var key in req.files) {
		var file = req.files[key];
		//TODO: Store in outfit directories? Store with a timestamp/date/random number like TS did?
		data = wait.forMethod(fs, 'readFile', file.path);
		wait.forMethod(fs, 'writeFile', dir + file.name + '.png', data);
	}

	//Save sprietsheet paths to GS
	rpcObjCall(pc, 'avatar_set_sheets', [{ url: url_path + 'image' }]);
	return {};
};


/*
 * avatar.saveSingles
 */
exports.saveSingles = function(req, pc) {
	var fs = require('fs');
	var url_path = '/c2.glitch.bz/avatars/' + pc + '/singles/';
	var dir = __dirname + '/../../eleven-assets' + url_path;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	for (var key in req.files) {
		var file = req.files[key];
		//TODO: Store in outfit directories? Store with a timestamp/date/random number like TS did?
		fs.writeFileSync(dir + file.name + '.png', fs.readFileSync(file.path));
	}

	//Save sprietsheet paths to GS
	rpcObjCall(pc, 'avatar_set_singles', [{ url: url_path + 'image' }]);

	return {};
};
