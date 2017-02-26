var extraOutfits = require('../extras').extra_outfits;
var config = require('config');
var celery = require('node-celery');
var godAvatar = require('./god/avatar');


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


exports.saveAvatar = function saveAvatar(req, pc) {
	var itemsToGrant = {};
	for (var i in req.body.wardrobe_items) {
		itemsToGrant[req.body.wardrobe_items[i]] = {granted: true};
	}
	rpcObjCall(pc, 'clothing_admin_add_multi', [itemsToGrant]);
	rpcObjCall(pc, 'avatar_admin_set_full', [{hash: req.body.hash}]);

	if (config.spritesheetGeneration !== 'server') {
		log.debug('client-side spritesheet generation, skipping celery task');
		return {};
	}

	log.debug('sending spritesheet generation task to celery');
	var client = celery.createClient({
		CELERY_BROKER_URL: config.celeryBrokerUrl,
		// CELERY_RESULT_BACKEND: 'amqp'
	});

	client.on('error', function onError(err) {
		log.info(err);
	});

	client.on('connect', function onConnect() {
		log.info('celery connected');
		client.call('eleven.worker.tasks.generateSpritesheets',
			[pc, req.body.hash, req.body.base_hash],
			function onResult(result) {
				log.info('result');
				log.info(result);
				client.end();
			});
	});

	return {};
};


if (config.spritesheetGeneration === 'client') {
	exports.saveSpritesheets = godAvatar.saveSpritesheets;
	exports.saveSingles = godAvatar.saveSingles;
}
