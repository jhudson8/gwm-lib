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
      orderedFileNames = (files.list).map(function(item) {
        var name = item.resource;
        return {
          pattern: new RegExp('^(.*\\/)?' + name.replace('*', '.*').replace('(', '\\(').replace(')', '\\)').replace('.', '\.') + '$'),
          name: name,
          options: item.options
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
        var bower = files.bower,
            contents;
        for (i=0; i<orderedFileNames.length; i++) {
          contents = undefined;
          fileDetails = orderedFileNames[i];
          if (bower[fileDetails.name]) {
            contents = new Buffer(bower[fileDetails.name]);
            bower[fileDetails.name] = true;
            orderedFileNames[i] = true;
          } else {
            for (var j in buffer) {
              var _file = buffer[j];
              if (_file.path.match(fileDetails.pattern)) {
                buffer.splice(j, 1);
                contents = _file.contents;
                orderedFileNames[i] = true;
                break;
              }
            }
          }

          if (contents) {
            if (fileDetails.options.includeIf) {
              ordered.push(new Buffer('if (' + fileDetails.options.includeIf + ') {\n'));
              ordered.push(contents);
              ordered.push(new Buffer('\n}'));
            }
            else {
              ordered.push(contents);
            }
          }
          ordered.push(new Buffer('\n'));
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

        ordered.push(file.contents);

        file.contents = Buffer.concat(ordered);
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
