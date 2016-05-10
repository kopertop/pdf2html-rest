/**
 * Basic wrapper around pdf2htmlEX
 */
'use strict';
// We don't really need express, or anything fancy, just a
// basic HTTP server
var http = require('http');
var url = require('url');
var request = require('request');
var child_process = require('child_process');
var path = require('path');
var os = require('os');
var uuid = require('uuid');
var fs = require('fs');

var PORT= process.env.PORT || 8000
// NPM overwrites this, that's dumb
process.env.TMPDIR = '/tmp';

http.createServer(function(req, resp){
	var params = url.parse(req.url, true);
	if(params && params.query && params.query.url){
		console.log('Generate PDF', params.query.url);
		var pdfRequest = request.get(params.query.url);

		var id = uuid.v4();
		var pdfFileName = id + '.pdf';
		var htmlFileName = id + '.html';

		var pdfFileObject = fs.createWriteStream(path.join(os.tmpdir(), pdfFileName));
		pdfRequest.pipe(pdfFileObject);
		pdfFileObject.on('close', function(){
			console.log('PDF saved', pdfFileName);
			child_process.spawn('/usr/local/bin/pdf2htmlEX', [
				'--external-hint-tool=ttfautohint',
				'--optimize-text=1',
				'--zoom',
				'2',
				pdfFileName,
				htmlFileName,
			], {
				cwd: os.tmpdir(),
			}).on('close', function(code){
				if(code === 0){
					console.log('DONE', code);
					resp.writeHead(200, {'Content-Type': 'text/html'});
					fs.createReadStream(path.join(os.tmpdir(), htmlFileName)).pipe(resp);
				} else {
					resp.writeHead(500, {'Content-Type': 'text/plain'});
					resp.end('Something went wrong');
				}
				// Clean up any temp files
				fs.unlink(path.join(os.tmpdir(), pdfFileName));
				fs.unlink(path.join(os.tmpdir(), htmlFileName));
			});
		});
	} else {
		resp.writeHead(400, {'Content-Type': 'text/plain'});
		resp.end('You must specify a URL parameter');
	}
}).listen(PORT, function(){
	console.log("Server listening on: http://localhost:%s", PORT);
});

