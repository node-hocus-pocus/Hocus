var fs = require('fs');
var mock = require('mock-fs');
var should = require('should');


var configure = require('../actions/configure');

describe('Hocus Actions', function() {
	describe('Configure', function() {

		var firstProfileName = 'primary',
			firstProfile = {
				profile : firstProfileName,
				awsAccessKey : 'asdf',
				awsSecretAccessKey : 'ferber',
				regionName : 'us-east-1'
			},
			secondProfileName = 'secondary',
			secondProfile = {
				profile : secondProfileName,
				awsAccessKey : 'asdf',
				awsSecretAccessKey : 'ferber',
				regionName : 'us-east-1'
			},
			thirdProfile = {
				profile : secondProfileName,
				awsAccessKey : 'mobli',
				awsSecretAccessKey : 'qewr',
				regionName : 'us-east-1'
			};

		before(function(){
			mock({
				"." : {}
			});
		});

		after(function(){
			mock.restore();
		});

		it('should store a profile with a name', function(done){
			configure("./credentials.json", firstProfile)
				.then(function(){
					var credentials = JSON.parse(fs.readFileSync("./credentials.json").toString('utf8'));
					credentials.should.be.json;
					credentials.profiles.should.be.json;
					credentials.profiles[firstProfileName].should.be.json;
					credentials.profiles[firstProfileName].awsAccessKey.should.equal(firstProfile.awsAccessKey);
					credentials.profiles[firstProfileName].awsSecretAccessKey.should.equal(firstProfile.awsSecretAccessKey);
					credentials.profiles[firstProfileName].regionName.should.equal(firstProfile.regionName);
					done();
				});
		});

		it('should let the user store multiple profiles', function(done){
			configure("./credentials.json", secondProfile)
				.then(function(){
					var credentials = JSON.parse(fs.readFileSync("./credentials.json").toString('utf8'));
					credentials.should.be.json;
					credentials.profiles.should.be.json;
					credentials.profiles[secondProfileName].should.be.json;
					credentials.profiles[secondProfileName].awsAccessKey.should.equal(secondProfile.awsAccessKey);
					credentials.profiles[secondProfileName].awsSecretAccessKey.should.equal(secondProfile.awsSecretAccessKey);
					credentials.profiles[secondProfileName].regionName.should.equal(secondProfile.regionName);

					credentials.profiles[firstProfileName].should.be.json;
					credentials.profiles[firstProfileName].awsAccessKey.should.equal(firstProfile.awsAccessKey);
					credentials.profiles[firstProfileName].awsSecretAccessKey.should.equal(firstProfile.awsSecretAccessKey);
					credentials.profiles[firstProfileName].regionName.should.equal(firstProfile.regionName);
					done();
				});
		});

		it('should let the user overwrite a profile', function(done){
			configure("./credentials.json", thirdProfile)
				.then(function(){
					var credentials = JSON.parse(fs.readFileSync("./credentials.json").toString('utf8'));
					
					credentials.profiles[secondProfileName].should.be.json;
					credentials.profiles[secondProfileName].awsAccessKey.should.equal(thirdProfile.awsAccessKey);
					credentials.profiles[secondProfileName].awsSecretAccessKey.should.equal(thirdProfile.awsSecretAccessKey);
					credentials.profiles[secondProfileName].regionName.should.equal(thirdProfile.regionName);
					done();
				});
		});
	});
});