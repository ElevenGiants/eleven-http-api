/*
 * skills.getInfo
 * Fetch information about a skill. Includes state information if authed.
 */
exports.getInfo = function getInfo(req, pc) {
	/* jshint -W071 */
	// For now, skill_id = skill_class because we don't know the IDs.
	if (req.query.skill_id) {
		req.query.skill_class = req.query.skill_id;
	}
	if (!req.query.skill_class) {
		throw new Error('skill_class_required');
	}
	if (!gsData.skills[req.query.skill_class]) {
		throw new Error('unknown_skill');
	}

	var skillInfo = {};
	var skillDetails = gsData.skills[req.query.skill_class];

	// If authed, get info from GSJS
	if (pc) {
		var skills = rpcObjCall(pc, 'skills_get_all', [false]);
		skillInfo = skills[req.query.skill_class];
	}
	// Not authed. Fetch basic details.
	else {
		var skillReqs = [];
		var skillPostReqs = [];
		var skillGiants = [];

		// Reqs
		for (var i = 0; i < skillDetails.req_skills.length; i++) {
			skillReqs.push({
				type: 'skill',
				skill: skillDetails.req_skills[i],
			});
		}
		for (var j = 0; j < skillDetails.req_achievements.length; j++) {
			skillReqs.push({
				type: 'achievement',
				skill: skillDetails.req_achievements[j],
			});
		}
		for (var k = 0; k < skillDetails.req_quests.length; k++) {
			skillReqs.push({
				type: 'quest',
				skill: skillDetails.req_quests[k],
			});
		}
		for (var l = 0; l < skillDetails.req_upgrades.length; l++) {
			skillReqs.push({
				type: 'upgrade',
				skill: skillDetails.req_upgrades[l],
			});
		}
		if (skillDetails.requires_level) {
			skillReqs.push({
				type: 'level',
				need: skillDetails.requires_level,
			});
		}

		// Post-reqs
		for (var m = 0; m < skillDetails.post_skills.length; m++) {
			skillPostReqs.push({
				type: 'skill',
				skill: skillDetails.post_skills[m],
			});
		}

		// Giants
		for (var n = 0; n < 3; n++) {
			var giantname = Object.keys(skillDetails.giants)[n];
			skillGiants.push({
				name: giantname,
				primary: skillDetails.giants[giantname].primary
			});
		}

		skillInfo = {
			reqs: skillReqs,
			post_reqs: skillPostReqs,
			giants: skillGiants,
			level: skillDetails.requires_level,
			total_time: skillDetails.point_cost / 60,
			can_learn: 0,
			got: 0
		};
	}

	// Fetch data for each req and post_req.
	var reqs = [];
	var postReqs = [];
	var thisReq;
	for (var o = 0; o < skillInfo.reqs.length; o++) {
		thisReq = skillInfo.reqs[o];
		var finalReq = {};
		switch (thisReq.type) {
			case 'skill':
				finalReq = {
					type: 'skill',
					name: gsData.skills[thisReq.skill].name + ' ' +
						utils.to_roman_numerals(gsData.skills[thisReq.skill].level),
					class_tsid: thisReq.skill,
					url: 'skill/' + thisReq.skill,
					got: thisReq.ok
				};
				break;
			case 'achievement':
				finalReq = {
					type: 'achievement',
					name: gsData.achievements[thisReq.achievement].name,
					url: 'achievement/' + thisReq.achievement,
					got: thisReq.ok
				};
				break;
			case 'quest':
				finalReq = {
					type: 'quest',
					name: gsData.quests[thisReq.quest].title,
					got: thisReq.ok
				};
				break;
			case 'upgrade':
				finalReq = {
					type: 'upgrade',
					name: gsData.upgrades[thisReq.upgrade].name,
					url: 'upgrade/' + thisReq.upgrade,
					got: thisReq.ok
				};
				break;
			case 'level':
				finalReq = {
					type: 'level',
					level: thisReq.need,
					got: thisReq.ok
				};
				break;
		}
		reqs.push(finalReq);
	}
	for (var p = 0; p < skillInfo.post_reqs.length; p++) {
		thisReq = skillInfo.post_reqs[p];
		postReqs.push({
			type: 'skill',
			name: gsData.skills[thisReq.skill].name + ' ' +
				utils.to_roman_numerals(gsData.skills[thisReq.skill].level),
			class_tsid: thisReq.skill,
			url: 'skill/' + thisReq.skill,
			got: thisReq.ok
		});
	}

	// Make body
	var body = {
		ok: 1,
		skill_id: gsData.skills[req.query.skill_class].id,
		class_tsid: req.query.skill_class,
		name: gsData.skills[req.query.skill_class].name + ' ' +
			utils.to_roman_numerals(gsData.skills[req.query.skill_class].level),
		url: '/skill/' + req.query.skill_class,
		description: gsData.skills[req.query.skill_class].description,
		reqs: reqs,
		post_reqs: postReqs,
		giants: skillInfo.giants,
		icon_44: gsData.skills[req.query.skill_class].icons.icon_44,
		icon_100: gsData.skills[req.query.skill_class].icons.icon_100,
		icon_460: gsData.skills[req.query.skill_class].icons.icon_460,
		seconds: skillInfo.total_time,
		level: skillInfo.level,
	};
	// Add player info if authed.
	if (pc) {
		body.can_learn = skillInfo.can_learn;
		body.can_unlearn = skillInfo.unlearnable;
		body.unlearn_seconds = skillInfo.unlearn_time;
		body.got = skillInfo.got;
		// If we are learning or have paused learning a skill, send even more info.
		if (skillInfo.queue) {
			body.learning = true;
			body.paused = skillInfo.queue.is_paused;
		}
	}
	return body;
};


/*
 * skills.learn
 * Start learning a new skill for the authenticated player.
 */
exports.learn = function learn(req, pc) {
	// For now, skill_id = skill_class because we don't know the IDs.
	if (req.query.skill_id) {
		req.query.skill_class = req.query.skill_id;
	}
	if (!req.query.skill_class) {
		throw new Error('skill_class_required');
	}
	if (!gsData.skills[req.query.skill_class]) {
		throw new Error('unknown_skill');
	}

	var ret = rpcObjCall(pc, 'skills_train', [req.query.skill_class]);
	return ret;
};


/*
 * skills.unlearn
 * Start unlearning a skill for the authenticated player.
 */
exports.unlearn = function unlearn(req, pc) {
	// For now, skill_id = skill_class because we don't know the IDs.
	if (req.query.skill_id) {
		req.query.skill_class = req.query.skill_id;
	}
	if (!req.query.skill_class) {
		throw new Error('skill_class_required');
	}
	if (!gsData.skills[req.query.skill_class]) {
		throw new Error('unknown_skill');
	}

	var ret = rpcObjCall(pc, 'skills_unlearn', [req.query.skill_class]);
	return ret;
};
