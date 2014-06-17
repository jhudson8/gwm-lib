gulp-web-modules plugin which will copy the contents of all files in a lib directory to the head of the associated section javascript file


Add section handlebars precompiling to your gulp-web-modules project.

Usage
-----
If you include a lib directory within any *section*, all files within that directly will be included as global resources in the transpiled section javascript code
```
    {project root}
    |-- js
        |-- lib
            file1.js
            file1.min.js
            ...
    |-- {section name}
        |-- js
            |-- lib
                ...
```

Install
------
Add this plugin to the gulp-web-module reference in your gulpfile
```javascript
    var gulpWebModules = require('gulp-web-modules'),
        gwmLib = require('gwm-lib');

    gulpWebModules({
      plugins: [
        gwmLib(options)
      ]
    }).injectTasks(gulp);
```

Options
-------
Not all files in the lib dirs will be included, only those that are referenced in the plugin options.  The options are split out by section and can optionally be specific to a build type.
```
    gwmLib({
      // the base section
      base: [
        file1.js (or file-*.js as * is wildcard)
        {dev: 'file1.js', prod: 'file1.min.js'},
      ],
      // another section called "foo"
      foo: [
        ...
      ]
    })
```

Bower
-----
This plugin understands bower.  All you have to do is to prefix the lib entries with "bower:"" to use bower for the resources.  This is an example of using jquery.
```
    gwmLib({
      // the base section
      base: [
        {dev: 'bower:jquery', prod: 'bower:jquery/dist/jquery.min.js'},
      ]
    })
```
