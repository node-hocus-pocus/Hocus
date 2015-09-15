var exec = require('child_process').exec,
	child = require('child_process'),
	path = require('path'),
	should = require('should')
	osenv = require('osenv');

var bin = path.join(__dirname, '../cli/hocus');


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
Responder.prototype.hasMoreResponses = function() {
	return (this.arguments.length > 0)
}

describe('Hocus CLI', function() {

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

		it('should accept default profile name', function(done) {

			var proc = child.spawn(bin, ['configure']);

			var testing = {
				profile_name: '',
				awsAccessKeyBad: 'a'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKeyBad
			]);

			proc.stdout.on('data', function(data) {
				if (responder.hasMoreResponses()){
					responder.respond();
				} else {
					done();
				}
			});

		});

		it('should reject invalid AWS Access Keys', function(done) {

			var proc = child.spawn(bin, ['configure']);

			var testing = {
				profile_name: '_hocus_test_profile_config',
				awsAccessKeyBad: 'a'
			}

			var responder = new Responder(proc.stdin, [
				testing.profile_name,
				testing.awsAccessKeyBad
			]);

			proc.stdout.on('data', function(data) {
				responder.respond();
			});

			proc.stderr.on('data', function(data) {
				data.toString('utf8').should.containEql('Invalid input for AWS Access Key');
				proc.stdin.end();
				done();
			});

		});

	});
});