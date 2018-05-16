/*
 * god.data.extract
 * fetch the JSON data for the passed in object
 */
 exports.extract = function extract(req, pc) {
	if (!req.query.tsid) {
		throw new Error('tsid_required');
	}
	var objects = rpcCall('api', 'apiGetObjectJSON', [req.query.tsid]);
	return objects;
 };
