/*
 * snaps.randomForCamera
 * Fetch a random snap location for the camera item.
 */
exports.randomForCamera = function randomForCamera(req, pc) {
	// TODO: Use a random snap each time.
	var body = {
		snap: {
			location_tsid: 'LLI32G3NUTD100I',
			location_x: 700,
			location_y: -100,
			owner: {
				name: 'Gordon Shumway',
				tsid: 'PDOADP8FT3V22TIXXX'
			},
			urls: {
				orig: '/c2.glitch.bz/streets/2012-05-10/' +
					'LLI32G3NUTD100I_loading_1336673389.jpg'
			}
		}
	};
	return body;
};
