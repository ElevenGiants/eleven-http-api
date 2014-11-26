var utils = require('../utils');


/*
 * items.findNearest
 * Find the nearest item.
 */
exports.findNearest = function(req, pc) {
	// TODO: Find the closest item.
	var body = {
		ok: 1,
		street: {
			street_tsid: ''
		}
	};
	return body;
};


/*
 * items.info
 * Fetch details on a single or list of item(s). Include extra info if authed.
 */
exports.info = function(req, pc) {
	if (!req.query.item_classes) {
		throw('item_class_required');
	}
	var body = {};
	var items = req.query.item_classes.split(',');
	for (var i = 0; i < items.length; i++) {
		var item_class = items[i];
		if (gsData.items[item_class]) {
			var details = gsData.items[item_class];
			// If an item is not takeable, they have no base cost/stack max.
			if (details.parent_classes.indexOf('takeable') == -1) {
				details.base_cost = null;
				details.stackmax = null;
			}
			// If an item is not tradable, then they are not SDBable.
			if (details.tags.indexOf('no_trade') == -1) {
				details.is_sdbable = true;
			}
			else {
				details.is_sdbable = false;
			}
			// Sort tips/warnings (description extras).
			var desc_extras = [];
			// If the item is found in extras.js, there are no desc extras.
			if (!details.missing_item) {
				if (pc) {
					desc_extras = rpcObjCall(pc, 'adminGetItemDescExtras', [{ class_id: item_class }]);
				}
				else {
					desc_extras = rpcCall('admin', 'adminGetItemDescExtras', { class_id: item_class });
				}
			}
			var tips = [];
			var warnings = [];
			for (var j = 0; j < desc_extras.length; j++) {
				switch (desc_extras[j][0]) {
					case 1:
						warnings.push(desc_extras[j][1]);
						break;
					case 2:
						tips.push(desc_extras[j][1]);
						break;
					default:
						console.log('Unexpected desc_extra type in items.info');
						break;
				}
			}
			// Add this item to the response body.
			body[item_class] = {
				// item_id: int,
				// iconic_url: string,
				item_class: item_class,
				info: details.description,
				max_stack: details.stackmax,
				base_cost: details.base_cost,
				tool_wear: details.classProps.points_capacity,
				required_skill: details.classProps.required_skill,
				warnings: warnings,
				tips: tips,
				has_infopage: details.has_infopage,
				grow_time: details.grow_time,
				item_url_part: item_class,
				name_single: details.name_single,
				name_plural: details.name_plural,
				info_url: '/item/' + item_class,
				is_sdbable: details.is_sdbable
			};
		}
	}
	return body;
};

