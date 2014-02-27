var fileHeader = require('./lib/file-header'),
    fs = require('fs');

module.exports = function(options) {
  options = options || {};
  var dir = options.dir || 'lib',
      priority = options.priority;

  return {
    javascript: {
      complete: function(_options, pipeline) {
        var dirPath = _options.srcPath + dir;
        return pipeline.pipe(fileHeader(dirPath, options, _options.gulp));
      },
      watch: function(options) {
        return './' + options.srcPath + dir + '/**/*'
      }
    }
  }
};

