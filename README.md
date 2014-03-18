gulp-concat-sourcemap [![Build Status](https://travis-ci.org/mikach/gulp-concat-sourcemap.png?branch=master)](https://travis-ci.org/mikach/gulp-concat-sourcemap)
=====================

Concatenate files and generate a source map file.

Based on https://github.com/wearefractal/gulp-concat

### Usage

```javascript
var concat = require('gulp-concat-sourcemap');

gulp.task('concat', function() {
    gulp.src(['file1.js', './js/*.js', 'file2.js'])
        .pipe(concat('all.js', options))
        .pipe(gulp.dest('./dist/'));
});
```

### Options

`options.sourcesContent`
An optional flag that tells the source map generator whether or not to include all original sources in the map.

`options.sourceRoot`
An optional root for all relative URLs in the source map.