var fileHeader = require('./lib/file-header'),
    fs = require('fs');

module.exports = function(options) {
  var dir = options.dir || 'js/lib',
  options = options || {};

  return {
    javascript: {
      complete: function(_options, pipeline) {
        var dirPath = _options.srcPath + dir;
        return pipeline.pipe(fileHeader(dirPath, getOrderedList(_options), options, _options.gulp));
      },
      watch: function(options) {
        if (options.isBase) {
          var bowerPriority = [];

        }
        return options.srcPath + dir + '/**/*';
      }
    }
  };

  function getOrderedList(buildOptions) {
    var section = buildOptions.section,
        paths = options[section] || [],
        bowerComponents = [],
        buildType = buildOptions.buildType,
        match, item;

    paths = paths.map(function(path) {
      if (typeof path === 'string') {
        return {resource: path, options: {}};
      } else {
        return {resource: path[buildType] || path.dev, options: path};
      }
    });

    for (var i=0; i<paths.length; i++) {
      item = paths[i];
      match = item.resource.match(/bower:(.*)/);
      if (match) {
        bowerComponents.push(match[1]);
      }
    }

    // at least for now, synchronously load bower components
    var indexedBowerComponents = {};
    for (i=0; i<bowerComponents.length; i++) {
      indexedBowerComponents['bower:' + bowerComponents[i]] = getBower(bowerComponents[i]);
    }

    return {
      list: paths,
      bower: indexedBowerComponents
    };
  }

  function getBower(bowerPath) {
    var match = bowerPath.match(/([^/]+)\/?(.*)/),
        bowerKey = match[1],
        path = match[2],
        prefix = './bower_components/' + bowerKey + '/';
    if (!path) {
      try {
        path = JSON.parse(fs.readFileSync(prefix + 'bower.json', {encoding: 'utf8'})).main;
      } catch (e) {}
    }
    if (!path) {
      throw new Error('Unknown bower path: ' + bowerKey);
    }
    path = './bower_components/' + bowerKey + '/' + path;
    var content = fs.readFileSync(path, {encoding: 'utf8'});
    return content;
  }
};
