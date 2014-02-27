//
//  inject the contents of files matching the provided file names to the head of the files that pass through
//
var through = require('through2'),
    fs = require('fs'),
    gwmUtil = require('gwm-util'),
    path = require('path'),
    join = gwmUtil.asyncJoin,
    util = gwmUtil.util;

module.exports = function(dirPath, options, gulp) {
  var successCallback,
      orderedFileNames = (options.priority || []).map(function(name) {
        return new RegExp('^(.*\\/)?' + name.replace('*', '.*').replace('(', '\\(').replace(')', '\\)'));
      }),
      buffer = [],
      file,
      complete,
      pipeline = gulp.src(dirPath + '/**/*');
      pipeline = pipeline.pipe(through.obj(
        function(file, enc, cb) {
          if (file.stat.isFile()) {
            buffer.push(file);
          }
          cb();
        }, function(cb) {
          if (successCallback) {
            successCallback();
          } else {
            complete = true;
          }
          cb();
        }));

  return through.obj(
    function(_file, enc, cb) {
      file = _file;
      this.push(_file);
      cb();
    },
    function(cb) {
      if (!file) {
        return cb();
      }
      if (file.isStream()) {
        return this.emit('error', new gutil.PluginError('gulp-web-modules:file-header', 'Streaming not supported'));
      }

      function onLoad() {
        var ordered = [], unordered = [];

        // order the entries to match the incoming array of file names
        for (var i in orderedFileNames) {
          var fileName = orderedFileNames[i];
          for (var j in buffer) {
            var _file = buffer[j];
            if (_file.path.match(fileName)) {
              buffer.splice(j, 1);
              ordered.push(_file);
              found = true;
              break;
            }
          }
        }
        var unordered = buffer.map(function(file) {
          return file;
        });

        var orderedBuffer = [];
        for (var i in ordered) {
          orderedBuffer.push(ordered[i].contents);
          orderedBuffer.push(new Buffer('\n'));
        }
        for (var i in unordered) {
          orderedBuffer.push(unordered[i].contents);
          orderedBuffer.push(new Buffer('\n'));
        }
        orderedBuffer.push(file.contents);

        file.contents = Buffer.concat(orderedBuffer);
        cb();
      }

      if (complete) {
        onLoad();
      } else {
        successCallback = onLoad;
      }
    }
  );
}
