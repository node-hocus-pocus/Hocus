var Promise = require('bluebird');
var path = require('path');
var helpers = require('./helpers');

var fs = Promise.promisifyAll(require("fs"));

module.exports = function(){
	return helpers
		.existsAsync('package.json')
		.then(function(exists){
			if (!exists){
				throw Error('Could not find package.json.');
			} else {
				return helpers.existsAsync('.hocus')
			}
		})
		.then(function(exists){
			if ( exists ){
				throw Error('.hocus already exists.');
			} else {
				var data = {
					"initializedDate" : new Date()
				};
				return fs.writeFileAsync(".hocus",JSON.stringify(data,null,4));
			}
		})
}