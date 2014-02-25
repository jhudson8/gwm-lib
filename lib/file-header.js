//
//  inject the contents of files matching the provided file names to the head of the files that pass through
//
var through = require('through2'),
    fs = require('fs'),
    gwmUtil = require('gwm-util'),
    path = require('path'),
    join = gwmUtil.asyncJoin,
    util = gwmUtil.util;

module.exports = function(fileNames) {
  var successCallback,
      error,
      loaded,
      blocker = join(function() {
        successCallback && successCallback();
        loaded = true;
      }),
      buffer = [],
      file;

  function readFile(fileName) {
    var _fileName = fileName.split(path.sep);
    _fileName = _fileName[_fileName.length-1];
    if (_fileName.indexOf('.') !== 0) {
      fs.readFile(fileNames[i], blocker.newCallback(function(err, data) {
        if (err) {
          error = err;
        }
        buffer.push({name: fileName, data: new Buffer(data)});
      }));
    }
  }

  for (var i in fileNames) {
    readFile(fileNames[i]);
  }
  blocker.complete();

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

      var onLoad = function() {
        var index = {};
        // index the entries
        for (var i in buffer) {
          var entry = buffer[i];
          index[entry.name] = entry.data;
        }

        var ordered = [];
        // order the entries to match the incoming array of file names
        for (var i in fileNames) {
          var fileName = fileNames[i];
          if (index[fileName] && index[fileName]) {
            ordered.push(new Buffer(index[fileName]));
          }
        }
        ordered.push(file.contents);

        file.contents = Buffer.concat(ordered);
        cb();
      }

      if (loaded) {
        onLoad();
      } else {
        successCallback = onLoad;
      }
    }
  );
}
