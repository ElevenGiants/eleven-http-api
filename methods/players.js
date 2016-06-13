/*
 * players.fullInfo
 * Fetch information about a player.
 */
exports.fullInfo = function fullInfo(req, pc) {
	if (!req.query.player_tsid) {
		throw new Error('tsid_required');
	}
	var body = rpcObjCall(req.query.player_tsid, 'adminGetFullInfo',
		[{viewer_tsid: pc}]);
	var player = rpcCall('api', 'apiGetObjectContent', [req.query.player_tsid]);
	body.player_name = player.label;
	body.player_tsid = req.query.player_tsid;
	body.avatar = {
		172: player.av_meta.singles + '_172.png',
		100: player.av_meta.singles + '_100.png',
		50: player.av_meta.singles + '_50.png',
	};
	body.relationship = {
		is_blocking_me: !body.can_contact,
		can_contact: body.can_contact
	};
	if (body.houses) {
		body.pol = {
			tsid: body.houses.street.tsid,
			street_tsid: body.houses.street.tsid
		};
	}
	// TODO: Use the players status.
	body.last_update = {
		id: 0,
		text: 'Hello world!',
		time: 123456789,
		time_ago: Date.now() - 123456789
	};
	return body;
};
