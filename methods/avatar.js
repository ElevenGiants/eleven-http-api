var extraOutfits = require('../extras').extra_outfits;


/*
 * avatar.getHistory
 * Fetch a players saved customizations.
 */
exports.getHistory = function getHistory(req, pc) {
	// TODO: Real implementation.
	var history = {};
	for (var i = 0; i < 10; i++) {
		var rand = Math.floor(Math.random() * Object.keys(extraOutfits).length);
		var md5 = Object.keys(extraOutfits)[rand];
		history[md5] = {
			outfit_id: md5,
			is_current: false,
			sheets_base: extraOutfits[md5].sheets,
			singles_base: extraOutfits[md5].singles
		};
	}
	return {history: history, total: 10};
};


/*
 * avatar.switchOutfit
 * Switches to another saved outfit.
 */
exports.switchOutfit = function switchOutfit(req, pc) {
	// TODO: Real implementation.
	var outfit = extraOutfits[req.query.outfit_id];
	rpcObjCall(pc, 'avatar_set_sheets', [{url: outfit.sheets}]);
	rpcObjCall(pc, 'avatar_set_singles', [{url: outfit.singles}]);
	return {};
};
