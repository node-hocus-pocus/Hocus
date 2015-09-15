var helpers = {};

helpers.existsAsync = function(path) {
	return new Promise(function (resolve) {
	    require('fs').exists(path, resolve);
	});
}

module.exports = helpers;