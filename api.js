require('harmony-reflect');
var fs = require('fs');
var wait = require('wait.for');
var jsonrpc = require('multitransport-jsonrpc');
var config = require('config');
var requireDir = require('require-dir');

global.utils = require('./utils');
var methods = requireDir('./methods', { recurse: true });
var rpc = new jsonrpc.client(new jsonrpc.transports.client.tcp(config.rpcHost, config.rpcPort));
rpc.register(['obj', 'api', 'admin', 'gs']);

var rpcDataProxy = function(type) {
	return {
		get: function (target, property) {
			if (!target[property]) {
				// Not in cache. Get (and set) info from RPC.
				try {
					var rpcData = rpcCall('api', 'apiGetJSFileObject', [type + '/' + property + '.js']);
					gsData[type][property] = rpcData;
					log.info('Cached ' + type + '/' + property);
				}
				catch(e) {
					// Failed to get info via RPC.
				}
			}
			return target[property];
		}
	};
};

var gsData = {
	achievements: Proxy({}, rpcDataProxy('achievements')),
	items: Proxy({}, rpcDataProxy('items')),
	quests: Proxy({}, rpcDataProxy('quests')),
	skills: {},
	locations: {},
	upgrades: {}
};
global.gsData = gsData;


exports.init = function() {
	// Fetch GSJS config (skills, locations and upgrades).
	log.info('Fetching GSJS config...');
	var gsjsConfig = rpcCall('gs', 'getGsjsConfig');
	gsData.skills = gsjsConfig.data_skills;
	gsData.locations = gsjsConfig.data_maps;
	gsData.upgrades = gsjsConfig.data_imagination_upgrades;
	log.info('Received GSJS config');

	// Fetch extra Items (not found in GSJS).
	log.info('Fetching extra items...');
	var extra_items = require('./extras').extra_items;
	Object.keys(extra_items).forEach(function store(class_tsid) {
		log.info('Loading extra item ' + class_tsid + ' from extras.js');
		extra_items[class_tsid].missing_item = 1;
		gsData.items[class_tsid] = extra_items[class_tsid];
	});

	// TODO: Fetch Wardrobe/Vanity (fetch from a database after namerizer)
};


exports.handle = function(name, req, callback) {
	var handler;
	try {
		var parts = name.split('.');
		if (parts.length == 3) {
			handler = methods[parts[0]][parts[1]][parts[2]];
		}
		else if (parts.length == 2) {
			handler = methods[parts[0]][parts[1]];
		}
		else {
			callback(new Error('invalid_request'));
		}
	}
	catch (e) {
		log.warn('Could not parse HTTP API function name "%s" (err: %s)', name, e);
	}
	if (typeof handler !== 'function') {
		callback(new Error('invalid_request'));
	} 
	else {
		// TODO: Authentication.
		// pc = 'PA9HIFJTI1E2TJS';
		var pc = req.body.ctoken ? req.body.ctoken : undefined;
		try {
			var ret = handler(req, pc);
			ret = getRes(ret);
			callback(null, ret);
		} catch (e) {
			log.error(e);
			callback(new Error(e.message));
		}
	}
};


function getRes(body, status) {
	if (body.error) {
		return {
			status: 200,
			body: { ok: 0, error: body.error }
		};
	} else {
		body.ok = 1;
		return {
			status: 200,
			body: body
		};
	}
}


/*
 * RPC examples
 *   obj: rpcObjCall('PA9HIFJTI1E2TJS', 'skills_train', ['teleportation_1']);
 *   api: rpcCall('api', 'apiIsPlayerOnline', ['PA9HIFJTI1E2TJS']);
 * admin: rpcCall('admin', 'adminGetItemDescExtras', { class_id: 'tomato' });
 *    gs: rpcCall('gs', 'getConnectData', ['PA9HIFJTI1E2TJS']);
 */
global.rpcObjCall = rpcObjCall;
function rpcObjCall(obj, fname, args) {
	try {
		var res = wait.forMethod(rpc, 'obj', 'HTTPAPI', obj, fname, args);
		return res;
	}
	catch(e) {
		throw new Error('RPC error');
	}
}


global.rpcCall = rpcCall;
function rpcCall(type, fname, args) {
	try {
		var res = wait.forMethod(rpc, type, 'HTTPAPI', fname, args);
		return res;
	}
	catch(e) {
		throw new Error('RPC error');
	}
}


global.sendMessageToSlack = sendMessageToSlack;
function sendMessageToSlack(text, fields) {
	if (!config.slackbot) {
		return;
	}
	var https = require('https');
	var options = config.slackbot.options;
	var payload = {
		"username": "HTTPAPI-Bot",
		"text": text,
		"icon_emoji": ":crab:",
		"fields": fields
	};
	var req = https.request(options, null);
	req.on('error', function err(e) {
		log.error(e);
	});
	req.write(JSON.stringify(payload));
	req.end();
}