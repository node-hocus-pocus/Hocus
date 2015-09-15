var Promise = require('bluebird');
var path = require('path');
var mkdirp = Promise.promisifyAll(require('mkdirp'));
var helpers = require('./helpers');

var fs = Promise.promisifyAll(require("fs"));

module.exports = function(fullFilePath, options) {
	var directory = path.dirname(fullFilePath);

	return mkdirp
		.mkdirpAsync(directory)
		.then(function() {
			return helpers.existsAsync(fullFilePath)
		})
		.then(function(exists) {
			if (exists) {
				return fs
					.readFileAsync(fullFilePath)
					.then(function(contents) {
						return JSON.parse(contents.toString('utf8'))
					});
			} else {
				return {
					profiles: {}
				};
			}
		})
		.then(function(credentials) {
			//console.log(credentials);
			var profile = options.profile;
			delete options.profile;

			credentials.profiles[profile] = options;
			return fs.writeFileAsync(fullFilePath, JSON.stringify(credentials, null, 4))
		});
};