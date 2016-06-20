var mkdirp = require('mkdirp');
var wait = require('wait.for');


exports.saveAvatarImages = function saveAvatarImages(req, pc, dir, apiFunc) {
    var fs = require('fs');
    var url_path = '/c2.glitch.bz/avatars/' + pc + '/' + dir + '/';
    var dir = __dirname + '/../eleven-assets' + url_path;
    wait.for(mkdirp, dir);
    for (var key in req.files) {
        var file = req.files[key];
        //TODO: Store in outfit directories? Store with a timestamp/date/random number like TS did?
        data = wait.forMethod(fs, 'readFile', file.path);
        wait.forMethod(fs, 'writeFile', dir + file.name + '.png', data);
    }

    //Save sprietsheet paths to GS
    rpcObjCall(pc, apiFunc, [{ url: url_path + 'image' }]);
    return {};
}
