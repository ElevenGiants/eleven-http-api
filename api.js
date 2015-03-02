require('harmony-reflect');
var wait = require('wait.for');
var jsonrpc = require('multitransport-jsonrpc');
var config = require('config');
var requireDir = require('require-dir');

global.utils = require('./utils');
var methods = requireDir('./methods', {recurse: true});
var rpc = new jsonrpc.client(new jsonrpc.transports.client.tcp(config.rpcHost,
	config.rpcPort));
rpc.register(['obj', 'api', 'admin', 'gs']);

var rpcDataProxy = function rpcDataProxy(type) {
	return {
		get: function (target, property) {
			if (!target[property]) {
				// Not in cache. Get (and set) info from RPC.
				try {
					var rpcData = rpcCall('api', 'apiGetJSFileObject',
						[type + '/' + property + '.js']);
					gsData[type][property] = rpcData;
					log.info('Cached ' + type + '/' + property);
				}
				catch (e) {
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


exports.init = function init() {
	// Fetch GSJS config (skills, locations and upgrades).
	log.info('Fetching GSJS config...');
	var gsjsConfig = rpcCall('gs', 'getGsjsConfig');
	gsData.skills = gsjsConfig.data_skills;
	gsData.locations = gsjsConfig.data_maps;
	gsData.upgrades = gsjsConfig.data_imagination_upgrades;
	log.info('Received GSJS config');

	// Fetch extra Items (not found in GSJS).
	log.info('Fetching extra items...');
	var extraItems = require('./extras').extra_items;
	Object.keys(extraItems).forEach(function store(classTSID) {
		log.info('Loading extra item ' + classTSID + ' from extras.js');
		extraItems[classTSID].missing_item = 1;
		gsData.items[classTSID] = extraItems[classTSID];
	});

	// TODO: Fetch Wardrobe/Vanity (fetch from a database after namerizer)
};


exports.handle = function handle(name, req, callback) {
	var handler;
	try {
		var parts = name.split('.');
		parts.reverse();
		if (parts.length == 0) {
			callback(new Error('invalid_request'));
			return;
		}
		handler = methods;
		while (parts.length > 0) {
			handler = handler[parts.pop()];
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
		}
		catch (e) {
			log.error(e);
			callback(new Error(e.message));
		}
	}
};


function getRes(body, status) {
	if (body.error) {
		return {
			status: 200,
			body: {ok: 0, error: body.error}
		};
	}
	else {
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
	catch (e) {
		throw new Error('RPC error');
	}
}


global.rpcCall = rpcCall;
function rpcCall(type, fname, args) {
	try {
		var res = wait.forMethod(rpc, type, 'HTTPAPI', fname, args);
		return res;
	}
	catch (e) {
		throw new Error('RPC error');
	}
}
