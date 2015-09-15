var fs = require('fs');
var mock = require('mock-fs');
var should = require('should');


describe('Hocus Actions', function() {

	describe('Configure', function() {

		before(function() {
			mock({
				".": {}
			});
		});

		after(function() {
			mock.restore();
		});

		var configure = require('../actions/configure');

		var firstProfileName = 'primary',
			firstProfile = {
				profile: firstProfileName,
				awsAccessKey: 'asdf',
				awsSecretAccessKey: 'ferber',
				regionName: 'us-east-1'
			},
			secondProfileName = 'secondary',
			secondProfile = {
				profile: secondProfileName,
				awsAccessKey: 'asdf',
				awsSecretAccessKey: 'ferber',
				regionName: 'us-east-1'
			},
			thirdProfile = {
				profile: secondProfileName,
				awsAccessKey: 'mobli',
				awsSecretAccessKey: 'qewr',
				regionName: 'us-east-1'
			};

		it('should store a profile with a name', function(done) {
			configure("./credentials.json", firstProfile)
				.then(function() {
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

		it('should let the user store multiple profiles', function(done) {
			configure("./credentials.json", secondProfile)
				.then(function() {
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

		it('should let the user overwrite a profile', function(done) {
			configure("./credentials.json", thirdProfile)
				.then(function() {
					var credentials = JSON.parse(fs.readFileSync("./credentials.json").toString('utf8'));

					credentials.profiles[secondProfileName].should.be.json;
					credentials.profiles[secondProfileName].awsAccessKey.should.equal(thirdProfile.awsAccessKey);
					credentials.profiles[secondProfileName].awsSecretAccessKey.should.equal(thirdProfile.awsSecretAccessKey);
					credentials.profiles[secondProfileName].regionName.should.equal(thirdProfile.regionName);
					done();
				});
		});
	});

	describe('Init', function() {

		var init = require('../actions/init');

		it('should return an error if package.json is not found', function(done) {

			mock({
				".": {}
			});

			var errored = false;

			init()
				.catch(function(e) {
					e.message.should.containEql('package.json');
					mock.restore();
					done();
				});
		});

		it('should return an error if .hocus already exists', function(done) {

			mock({
				'package.json': 'test',
				'.hocus': 'test'
			});

			var errored = false;

			init()
				.catch(function(e) {
					e.message.should.containEql('exists');
					mock.restore();
					done();
				});
		});

		it('should create a .hocus file', function(done) {

			mock({
				'package.json': 'test'
			});

			init()
				.then(function(){
					var contents = JSON.parse(fs.readFileSync(".hocus").toString('utf8'));
					contents.should.be.json;
					contents.initializedDate.should.exist;
					mock.restore();
					done();
				})
		});
	});
});