//
//  inject the contents of files matching the provided file names to the head of the files that pass through
//
var through = require('through2'),
    fs = require('fs'),
    gwmUtil = require('gwm-util'),
    path = require('path'),
    join = gwmUtil.asyncJoin,
    util = gwmUtil.util;

// files = {list[], bower{name, path}}
module.exports = function(dirPath, files, options, gulp) {
  var successCallback,
      orderedFileNames = (files.list).map(function(name) {
        return {
          pattern: new RegExp('^(.*\\/)?' + name.replace('*', '.*').replace('(', '\\(').replace(')', '\\)').replace('.', '\.') + '$'),
          name: name
        };
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
        var ordered = [], fileDetails, i;

        // order the entries to match the incoming array of file names
        var bower = files.bower;
        for (i=0; i<orderedFileNames.length; i++) {
          fileDetails = orderedFileNames[i];
          if (bower[fileDetails.name]) {
            ordered.push(new Buffer(bower[fileDetails.name]));
            bower[fileDetails.name] = true;
            orderedFileNames[i] = true;
          } else {
            for (var j in buffer) {
              var _file = buffer[j];
              if (_file.path.match(fileDetails.pattern)) {
                buffer.splice(j, 1);
                ordered.push(_file.contents);
                orderedFileNames[i] = true;
                break;
              }
            }
          }
        }

        for (var bowerKey in bower) {
          if (bower[bowerKey] !== true) {
            throw new Error('Bower resource not found: ' + bowerKey);
          }
        }
        for (i = 0; i<orderedFileNames.length; i++) {
          if (orderedFileNames[i] !== true) {
            throw new Error('priority resource not found: ' + orderedFileNames[i].name);
          }
        }

        var orderedBuffer = [];
        for (i in ordered) {
          orderedBuffer.push(ordered[i]);
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
};
