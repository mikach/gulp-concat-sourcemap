var expect = require('chai').expect;

var Stream = require('stream');

var File = require('gulp-util').File;

var concat = require('..');

describe('gulp-concat-sourcemap', function() {
    it('should be a stream', function() {
        expect(concat('file.js')).to.be.instanceOf(Stream);
    });

    it('should concat files', function(done) {
        var file1 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file1.js',
            contents: new Buffer('console.log(\'Hello\');')
        });

        var file2 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file2.js',
            contents: new Buffer('console.log(\'World\');')
        });

        var stream = concat('file.js');

        var contentFile;
        stream.on('data', function(newFile) {
            if (!contentFile) { // contentFile
                contentFile = newFile;
                expect(String(newFile.contents)).to.be.equal(
                    'console.log(\'Hello\');' +
                    '\n\nconsole.log(\'World\');\n\n' +
                    '//# sourceMappingURL=file.js.map'
                );
            } else { // mapFile
                expect(String(newFile.contents)).to.be.equal(
                    '{\n  \"version\": 3,\n  \"file\": \"file.js\",' + 
                    '\n  \"sources\": [\n    \"file1.js\",\n    \"file2.js\"\n  ]' +
                    ',\n  \"names\": [],\n  \"mappings\": \"AAAA;;ACAA\"\n}'
                );
                done();
            }
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });

    it('should prefix sourcemap output', function(done) {
         var file1 = new File({
            base: '/test',
            path: 'test/path/file1.js',
            contents: new Buffer('console.log(\'Hello\');')
        });

        var file2 = new File({
            base: '/test',
            path: 'test/path/file2.js',
            contents: new Buffer('console.log(\'World\');')
        });

        var stream = concat('file.js', {prefix: 2});

        var contentFile;
        stream.on('data', function(newFile) {
            if (!contentFile) { // contentFile
                contentFile = newFile;
                expect(String(newFile.contents)).to.be.equal(
                    'console.log(\'Hello\');' +
                    '\n\nconsole.log(\'World\');\n\n' +
                    '//# sourceMappingURL=file.js.map'
                );
            } else { // mapFile
                expect(String(newFile.contents)).to.be.equal(
                    '{\n  \"version\": 3,\n  \"file\": \"file.js\",' + 
                    '\n  \"sources\": [\n    \"file1.js\",\n    \"file2.js\"\n  ]' +
                    ',\n  \"names\": [],\n  \"mappings\": \"AAAA;;ACAA\"\n}'
                );
                done();
            }
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });
});