var chai = require('chai')

var expect = chai.expect;

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

    it('should add sourceMappingBaseURL', function(done) {
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

        var stream = concat('file.js', { sourceMappingBaseURL: 'scripts/' });

        var contentFile;
        stream.on('data', function(newFile) {
            if (!contentFile) { // contentFile
                contentFile = newFile;
                expect(String(newFile.contents)).to.be.equal(
                    'console.log(\'Hello\');' +
                    '\n\nconsole.log(\'World\');\n\n' +
                    '//# sourceMappingURL=scripts/file.js.map'
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
    it('should generate source content inline', function(done){
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

        var stream = concat('file.js', {prefix: 2, sourcesContent: true});

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
                        "{\n  " +
                        "\"version\": 3,\n  " +
                        "\"file\": \"file.js\",\n  " +
                        "\"sources\": [\n    " +
                        "\"file1.js\",\n    " +
                        "\"file2.js\"\n  ],\n  " +
                        "\"names\": [],\n  " +
                        "\"mappings\": \"AAAA;;ACAA\",\n  " +
                        "\"sourcesContent\": [\n    " +
                        "\"console.log('Hello');\",\n    " +
                        "\"console.log('World');\"\n  " +
                        "]\n" +
                        "}");
                done();
            }
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });

    it('should not produce a sourcemap file if sourceMap is truthy on the input file', function(done) {
        var file1 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file1.js',
            contents: new Buffer('console.log(\'Hello\');')
        });
        file1.sourceMap = {version: 3, file:'file1.js', sources: ['file1.js'], mappings:""}

        var file2 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file2.js',
            contents: new Buffer('console.log(\'World\');')
        });
        file2.sourceMap = {version: 3, file:'file2.js', sources: ['file2.js'], mappings:""}

        var stream = concat('file.js', { sourceMappingBaseURL: 'scripts/' });

        stream.on('data', function(newFile) {
            expect(String(newFile.contents)).to.equal(
                'console.log(\'Hello\');' +
                '\n\nconsole.log(\'World\');\n\n'
            );
            expect(newFile.sourceMap).to.exist;
            expect(JSON.stringify(newFile.sourceMap, null, '  ')).to.be.equal(
                    '{\n  \"version\": 3,\n  \"file\": \"file.js\",' + 
                    '\n  \"sources\": [\n    \"file1.js\",\n    \"file2.js\"\n  ]' +
                    ',\n  \"names\": [],\n  \"mappings\": \"AAAA;;ACAA\"\n}'
                );
            done();
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });
  
    it('should use the input sourcemap if it is available', function(done) {
        var file1 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file1.js',
            contents: new Buffer('console.log(\'Hello\');')
        });
        file1.sourceMap = {version: 3, file:'file1.js', sources: ['file1.coffee'], mappings:"AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE;"}

        var file2 = new File({
            cwd: 'test',
            base: '/test',
            path: 'test/file2.js',
            contents: new Buffer('console.log(\'World\');')
        });
        file2.sourceMap = {version: 3, file:'file2.js', sources: ['file2.coffee'], mappings:"AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE;"}

        var stream = concat('file.js', { sourceMappingBaseURL: 'scripts/' });

        stream.on('data', function(newFile) {
            expect(String(newFile.contents)).to.equal(
                'console.log(\'Hello\');' +
                '\n\nconsole.log(\'World\');\n\n'
            );
            expect(newFile.sourceMap).to.exist;
            expect(JSON.stringify(newFile.sourceMap, null, '  ')).to.be.equal(
                    '{\n  \"version\": 3,\n  \"file\": \"file.js\",' + 
                    '\n  \"sources\": [\n    \"file1.coffee\",\n    \"file2.coffee\"\n  ]' +
                    ',\n  \"names\": [],\n  \"mappings\": \"AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE;;ACAnB,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE\"\n}'
                );
            done();
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });
});