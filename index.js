'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through');

var PluginError = require('gulp-util').PluginError;
var File = require('gulp-util').File;

var SourceMapConsumer = require('source-map').SourceMapConsumer;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceNode = require('source-map').SourceNode;

module.exports = function(fileName, opts) {
    if (!fileName) {
        throw new PluginError('gulp-concat-sourcemap', 'Missing fileName option for gulp-concat-sourcemap');
    }

    opts = opts || {};

    var firstFile = null;

    var sourceNode = new SourceNode();

    function bufferContents(file) {
        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', new PluginError('gulp-concat-sourcemap', 'Streaming not supported'));

        if (!firstFile) firstFile = file;

        var rel = path.relative(file.cwd, file.path).replace(/\\/g, '/');

        if(opts.prefix) {
            var p = opts.prefix;
            while(p-- > 0) {
                rel = rel.substring(rel.indexOf('/') + 1);
            }
        }

        file.contents.toString('utf8').split('\n').forEach(function(line, j){
            sourceNode.add(new SourceNode(j + 1, 0, rel, line + '\n'));
        });
        sourceNode.add('\n');

        if (opts.sourcesContent) {
            sourceNode.setSourceContent(file.relative, file.contents.toString('utf8'));
        }
    }

    function endStream(){
        if (!firstFile) return this.emit('end');

        var contentPath = path.join(firstFile.base, fileName),
            mapPath = contentPath + '.map';

        if (/\.css$/.test(fileName)) {
            sourceNode.add('/*# sourceMappingURL=' + fileName + '.map' + ' */');
        } else {
            sourceNode.add('//# sourceMappingURL=' + fileName + '.map');
        }

        var codeMap = sourceNode.toStringWithSourceMap({
            file: fileName,
            sourceRoot: opts.sourceRoot || ''
        });

        var sourceMap = SourceMapGenerator
                                .fromSourceMap( new SourceMapConsumer( codeMap.map.toJSON() ) )
                                .toJSON();
                                
        sourceMap.file = path.basename(sourceMap.file);

        var contentFile = new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: contentPath,
            contents: new Buffer(codeMap.code)
        });

        var mapFile = new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: mapPath,
            contents: new Buffer(JSON.stringify(sourceMap, null, '  '))
        });

        this.emit('data', contentFile);
        this.emit('data', mapFile);
        this.emit('end');
    }

    return through(bufferContents, endStream);
};
