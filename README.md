gulp-web-modules plugin which will copy the contents of all files in a lib directory to the head of the base javascript file


Add section handlebars precompiling to your gulp-web-modules project.

Usage
-----
Your handlebars template should be located in a file called *templates* within your section directory
    {project root}
    |-- lib
        |-- myfile.js

Install
------
Add this plugin to the gulp-web-module reference in your gulpfile
    var gulpWebModules = require('gulp-web-modules'),
        gwmLib = require('gwm-lib');

    gulpWebModules({
      plugins: [
        gwmLib(options)
      ]
    }).injectTasks(gulp);

Options
-------
The options that can be provided when creating this plugin is a hash with the following values
* *dir*: (default "lib") name of the directory containing the javascript files
* *priority* optional array of file names if any particular order is required - not all file names need to be included and "*" can be used to indicate wildcards
