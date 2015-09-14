var exec = require('child_process').exec,
	child = require('child_process'),
	path = require('path'),
	should = require('should')
concat = require('concat-stream'),
	fs = require('fs-extra'),
	osenv = require('osenv');

var bin = path.join(__dirname, '../lib/hocus');

var userHome = osenv.home();

var credentialsFile = userHome + '/.hocus/credentials.json';

function Responder(writeStream, arguments) {
	this.arguments = arguments;
	this.writeStream = writeStream;
}
Responder.prototype.respond = function() {
	if (this.arguments.length) {
		var response = this.arguments.shift();
		this.writeStream.write(response + '\n');
	}
}

describe('Hocus', function() {

	describe('Help', function() {
		it('should print out help information if no arguments are passed', function(done) {
			exec(bin, function(error, stdout, stderr) {
				should.not.exist(error);
				stderr.should.equal('');
				stdout.should.exist;
				stdout.should.containEql('Usage');
				stdout.should.containEql('Commands');
				stdout.should.containEql('Options');
				done();
			});
		});
	});

	describe('Configure', function() {
		after(function(done){
			fs.remove('test/tmp',done);
		});

		it('should print out help information if no arguments are passed and --help is used', function(done) {
			exec(bin + ' configure --help', function(error, stdout, stderr) {
				should.not.exist(error);
				stderr.should.equal('');
				stdout.should.exist;
				stdout.should.containEql('Usage');
				stdout.should.containEql('Options');
				done();
			});
		});

		it('should print out help information if no arguments are passed and -h is used', function(done) {
			exec(bin + ' configure -h', function(error, stdout, stderr) {
				should.not.exist(error);
				stderr.should.equal('');
				stdout.should.exist;
				stdout.should.containEql('Usage');
				stdout.should.containEql('Options');
				done();
			});
		});

		it('should create a configuration profile', function(done) {

			var tmpCredentialsPath = 'test/tmp/credentials1.json';

			var proc = child.spawn(bin, ['configure', '--file', tmpCredentialsPath]);


			var testing = {
				profile_name: '_hocus_test_profile_config',
				awsAccessKey: '05as4vziu4jgxj5bfd7c',
				awsSecretAccessKey: 'drjdjdt+mslf=xcda/ul7imnzdyxg+o=wcldesfe',
				regionName: 'us-east-1'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKey,
				testing.awsSecretAccessKey,
				testing.regionName
			]);

			proc.stdout.on('data', function() {
				responder.respond();
			});

			proc.on('exit', function() {

				var contents = require(path.join(__dirname, '..', tmpCredentialsPath));
				contents.should.exist;
				contents.should.be.json;
				contents.profiles.should.be.json;

				var profile = contents.profiles[testing.profile_name];
				profile.awsAccessKey.should.equal(testing.awsAccessKey);
				profile.awsSecretAccessKey.should.equal(testing.awsSecretAccessKey);
				profile.regionName.should.equal(testing.regionName);

				done();
				
			});

		});

		it('should create a default profile name', function(done) {

			var tmpCredentialsPath = 'test/tmp/credentials2.json';

			var proc = child.spawn(bin, ['configure', '--file', tmpCredentialsPath]);

			var testing = {
				profile_name: '', // should default to 'dev'
				awsAccessKey: '05as4vziu4jgxj5bfd7c',
				awsSecretAccessKey: 'drjdjdt+mslf=xcda/ul7imnzdyxg+o=wcldesfe',
				regionName: 'us-east-1'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKey,
				testing.awsSecretAccessKey,
				testing.regionName
			]);

			proc.stdout.on('data', function() {
				responder.respond();
			});

			proc.on('exit', function() {

				var contents = require(path.join(__dirname, '..', tmpCredentialsPath));
				contents.should.exist;
				contents.should.be.json;
				contents.profiles.should.be.json;

				var profile = contents.profiles['dev'];
				profile.awsAccessKey.should.equal(testing.awsAccessKey);
				profile.awsSecretAccessKey.should.equal(testing.awsSecretAccessKey);
				profile.regionName.should.equal(testing.regionName);

				done();
			});

		});

		it('should use us-east-1 as a default region', function(done) {

			var tmpCredentialsPath = 'test/tmp/credentials3.json';

			var proc = child.spawn(bin, ['configure', '--file', tmpCredentialsPath]);


			var testing = {
				profile_name: '', // should default to 'dev'
				awsAccessKey: '05as4vziu4jgxj5bfd7c',
				awsSecretAccessKey: 'drjdjdt+mslf=xcda/ul7imnzdyxg+o=wcldesfe',
				regionName: '' // should default to us-east-1
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKey,
				testing.awsSecretAccessKey,
				testing.regionName
			]);

			proc.stdout.on('data', function() {
				responder.respond();
			});

			proc.on('exit', function() {

				var contents = require(path.join(__dirname, '..', tmpCredentialsPath));
				contents.should.exist;
				contents.should.be.json;
				contents.profiles.should.be.json;

				var profile = contents.profiles['dev'];
				profile.awsAccessKey.should.equal(testing.awsAccessKey);
				profile.awsSecretAccessKey.should.equal(testing.awsSecretAccessKey);
				profile.regionName.should.equal('us-east-1');

				done();
			});

		});

		it('should reject invalid AWS Access Keys', function(done) {

			var tmpCredentialsPath = 'test/tmp/credentials1.json';

			var proc = child.spawn(bin, ['configure', '--file', tmpCredentialsPath]);

			var error = false;

			var testing = {
				profile_name: '_hocus_test_profile_config',
				awsAccessKeyBad: 'a',
				awsAccessKeyGood: '05as4vziu4jgxj5bfd7c',
				awsSecretAccessKey: 'drjdjdt+mslf=xcda/ul7imnzdyxg+o=wcldesfe',
				regionName: 'us-east-1'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKey,
				testing.awsAccessKeyGood,
				testing.awsSecretAccessKey,
				testing.regionName
			]);

			proc.stdout.on('data', function(data) {
				responder.respond();
			});

			proc.stderr.on('data', function(data) {
				error = data.toString('utf8');
			});

			proc.on('exit', function() {

				error.should.containEql('That does not seem to be a valid AWS Access Key.')

				done();
				
			});

		});

		it('should reject invalid AWS Secret Access Keys', function(done) {

			var tmpCredentialsPath = 'test/tmp/credentials1.json';

			var proc = child.spawn(bin, ['configure', '--file', tmpCredentialsPath]);

			var error = false;

			var testing = {
				profile_name: '_hocus_test_profile_config',
				awsAccessKey: '05as4vziu4jgxj5bfd7c',
				awsSecretAccessKeyBad: '000',
				awsSecretAccessKeyGood: 'drjdjdt+mslf=xcda/ul7imnzdyxg+o=wcldesfe',
				regionName: 'us-east-1'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKey,
				testing.awsSecretAccessKeyBad,
				testing.awsSecretAccessKeyGood,
				testing.regionName
			]);

			proc.stdout.on('data', function(data) {
				responder.respond();
			});

			proc.stderr.on('data', function(data) {
				error = data.toString('utf8');
			});

			proc.on('exit', function() {

				error.should.containEql('That does not seem to be a valid AWS Secret Access Key')

				done();
				
			});

		});

	});
});