/*
 * players.fullInfo
 * Fetch information about a player.
 */
exports.fullInfo = function(req, pc) {
	if (!req.query.player_tsid) {
		throw new Error('tsid_required');
	}
	var body = rpcObjCall(req.query.player_tsid, 'adminGetFullInfo', [{ viewer_tsid: pc }]);
	var player = rpcCall('api', 'apiFindObject', [req.query.player_tsid]);
	body.player_name = player.label;
	body.player_tsid = req.query.player_tsid;
	// TODO: Use the players spritesheets.
	body.avatar = {
		172: '/c2.glitch.bz/avatars/2011-06-03/2765262852ce6775fa7a497259aecb39_1307145346_172.png',
		100: '/c2.glitch.bz/avatars/2011-06-03/2765262852ce6775fa7a497259aecb39_1307145346_100.png',
		50: '/c2.glitch.bz/avatars/2011-06-03/2765262852ce6775fa7a497259aecb39_1307145346_50.png',	
	};
	// TODO: Use the players status.
	body.last_update = {
		id: 0,
		text: 'Hello world!',
		time: 123456789,
		time_ago: Date.now() - 123456789
	};
	return body;
};
