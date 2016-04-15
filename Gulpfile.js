var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var inject = require('gulp-inject');
var fs = require('fs');
var uglify = require('gulp-uglify');
var bowerFiles = require('main-bower-files');
var extend = require('node.extend');
var rename = require("gulp-rename");
var argv = require("yargs").argv;
var gulpFilter = require('gulp-filter'); // ?
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var merge = require('merge-stream');
var templateCache = require('gulp-angular-templatecache');
var preprocess = require('gulp-preprocess');
var less = require('gulp-less');
var minifyHTML = require('gulp-minify-html');
var gutil = require('gulp-util');
var minifyCss = require('gulp-minify-css');
var nop = require('gulp-nop');
var ngHtml2Js = require("gulp-ng-html2js");
var inlineCss = require('gulp-inline-css');
var bower = require('gulp-bower');

var
    // application's main config file
    config = require('./config.json'),
    // srcDir = 'src/',
    // distDir = 'dist/',
    env = (argv.env || 'debug').toLowerCase(),
    uglifySources = !/debug|dev/.test(env),
    buildVersion = (new Date()).getTime(),
    apps = config.apps || [],
    baseConfig = config.base;


if (!baseConfig) {
    throw "Cannot find base configuration in the main config.json";
}

if (apps.length === 0) {
    throw "No applications";
}

// // load local config file
// if (fs.existsSync('./config_local.json')) {
//     logger('Using local config file: config_local.json');
//     configLocal = require('./config_local.json');
// }

// set new app path in case of build mode
if (isBuild) {
    logger('OMG! It\'s production build');
    path.app = path.dist;
}


function logger () {
    gutil.log(arguments);
}

logger('Running env = ' + env);
// logger('[path] src = ' + path.src);
// logger('[path] dist = ' + path.dist);
// logger('[path] app = ' + path.app);
// logger('[path] urlStatic = ' + path.urlStatic);
// logger('[path] distStatic = ' + path.distStatic);
// logger('[path] pathToVendors = ' + pathToVendors);
// logger('[path] pathToLibs= ' + pathToLibs);
// logger('[path] pathToBowerJson = ' + pathToBowerJson);


logger('Available apps: ', apps);




gulp.task('default', taskBuildAll);

return;


// default task
if (isBuild) {
    gulp.task('default', taskBuildAll);
}
//} else {
//     gulp.task('default', ['app:html'], watchLocalChanges);
// }


/******* startup taks *******/
function taskBuildAll () {
    return doForEachApp(function (appName) {
        var app = new Application(appName);
        app.configure(baseConfig);
        app.setBuildMode(buildVersion, env);
        return app.buildAll();
    });
}




function Application (name) {
    logger('creating new instance ' + name);

    var that = this,
        buildVersion = null,
        env = null,
        baseCfg = null,
        srcRoot = 'src/',
        distRoot = 'dist/',
        staticName = 'static',
        // dirSrcVendors = name + '/static/vendors/',
        // dirLibs = 'libs/', 
        pathToBowerJson = withinAppSrcDir('bower.json'),
        pathToConfigJson = withinAppSrcDir('config.json'),
        path = {
            src: {
                app: toF(withinAppSrcDir()),
                static: toF(withinAppSrcDir('static/')),
                assets: toF(withinAppSrcDir(combinePath('static', 'assets'))),
                urlStatic: toF('/static/')
            },
            dist: {
                app: toF(withinAppSrcDir()),
                static: toF(withinAppSrcDir('static_' +  + '/')),
                assets: toF(withinAppSrcDir(combinePath(getStaticName, 'assets'))),
                urlStatic: toF('/static/')
            }
            // app: 'src/' + name + '/',
            // dist: 'dist/' + name + '/',
            // srcApp: 'src/' + name + '/',
            // distApp: 'dist/' + name + '/',

            // // static path
            // innerSrcStatic: '/static/',
            // innerDistStatic: '/static/' + buildVersion + '/',

            // // urls
            // srcStaticUrl: '/static/',
            // distStaticUrl: '/static/' + buildVersion + '/'
            // distStatic: 'dist/' + (isBuild ? 'static/' + buildVersion + '/' : '')
        }
        // pathToVendors = path.app + dirVendors,
        // pathToLibs = path.app + dirLibs,
        appConfigGeneral = require(pathToConfigJson),
        appConfig = null;


    // this.getConfig = function () {
    //     return {
    //     }
    // }

    function toF (f) {
        return function () {
            if (typeof f === 'function') {
                return f();
            }
            return f;
        }
    }

    function getStaticName () {
        if (isBuild()) {
            return staticName + '_' + that.getBuildVer();
        }
        return staticName;
    }

    function combinePath () {
        return [].slice.call(arguments, 0).join('/');
    }

    function isBuild () {
        return that.getEnv() !== 'debug';
    }

    function setRuntimePathAppToDist () {
        path.run = path.dist;
    }

    function setRuntimePathAppToSrc () {
        path.run = path.src;
    }

    function getBuildVersionUrlParam () {
        return '?bust=' + that.getBuildVer(),
    }

    function withinAppSrcDir (p) {
        return srcRoot + name + '/' + p || '',
    }

    function withinAppDistDir (p) {
        return distRoot + name + '/' + p || '',
    }

    function getStaticPath () {
        return '/static/';
    }

    function setAppConfig (c) {
        appConfig = c || {};
    }

    function applogger () {
        logger('    [' + name + '] ', arguments);
    }

    this.getAppName = function () {
        return appName;
    }

    this.setBuildVer = function (v) {
        applogger('build #', v);
        buildVersion = v;
        that.configure(that.getBaseConfig());
    }
    this.getBuildVer = function () {
        return buildVersion;
    }

    this.setEnv = function (e) {
        env = !!e ? e.toLowerCase() : 'debug';
        applogger('env ', env);
        that.configure(that.getBaseConfig());
    }

    this.getEnv = function () {
        return env || 'debug';
    }

    this.setBuildMode = function (ver, env) {
        setBuildVer(ver);
        setEnv(env);
    }

    this.setBaseConfig = function (base) {
        baseConfig = base || {};
        that.configure(that.getBaseConfig());
    }

    this.getBaseConfig = function () {
        return base || {};
    }

    this.configure = function (baseConfig) {
        that.setBaseConfig(baseConfig);
        var appCurrEnvCfg = appConfig[that.getEnv()],
            common = {};
        if (appConfig.common) {
            common = appConfig.common;
        }
        setAppConfig(extend(true, that.getBaseConfig(), common, appCurrEnvCfg));
        return that.getAppConfig();
    }

    this.getAppConfig = function () {
        return appConfig || {};
    }

    this.getTplConfigObj = function () {
        var appConfig = that.getAppConfig();
        appConfig.VERSION = buildVersion;
        appConfig.DEBUG = !isBuild();
        appConfig.ENV = env;
        appConfig.STATICDIR = path.app.static;
        // adding both local and common values
        // if (configLocal[appName]) {
        //     appConfig = extend(true, config.common, appConfig, configLocal[appName]);
        // } else {
        //     appConfig = extend(true, config.common, appConfig);
        // }
        var appvars = {
            CONFIG: JSON.stringify(appConfig),
            CONFIGJSON: appConfig,
            STATICDIR: getStaticPath(),
            VERSION: that.getBuildVer(),
            BUST: getBuildVersionUrlParam(),
            APP: that.getAppName()
        };
        return appvars;
    }


    this.p_InstallBowerDeps = function () {
        return bower({ directory: , cwd:  })
    }


    this.hasEnvConfig = function (env) {
        if (env) {
            return config && config.apps && config.apps[name] && config.apps[name][env];
        }
        return config && config.apps && config.apps[name];
    }

    this.buildAll = function () {
        return nop();
    }

    // source transformation

    function p_clearDist () {
        return gulp.src('ui/dist').pipe(clean());
    }
    function p_copyFiles () {

    }
    function p_clearCss () {
        applogger('[cleanCss]');
        return gulp.src(path.app + 'assets/css/').pipe(clean());
    }
    function p_genCss () {
        applogger('[cleanCss]');
        return gulp.src('*.less', {
                cwd: path.app + 'assets/css/' + appName + '/'
            })
            .pipe(plumber({
                errorHandler: handleError
            }))
            .pipe(less({
                paths: [path.app, path.app + 'assets/css/', path.app + 'assets/css/' + appName + '/']
            }))
            .pipe(uglifySources ? minifyCss({
                processImport: false
            }) : nop())
            .pipe(gulp.dest('.', {
                cwd: path.app + 'assets/css/' + appName + '/'
            }));
    }
    function p_transformTemplate () {
        return gulp.src('index.tpl.html', {
                cwd: path.src.app
            })
            .pipe(injectAppVars(appName))
            .pipe(injectAppScripts(appName))
            .pipe(injectAppScripts('shared'))
            .pipe(injectVendors())
            .pipe(injectLibs())
            .pipe(rename(appName + '.html'))
            .pipe(gulp.dest(path.app));
    }
    function p_transformLess () {

    }
    function p_compressAppJs () {

    }
    function p_compressVendorsJs () {

    }
    function p_compressLibJs () {

    }
    function p_injectVars () {
        
    }
    function p_injectStatic () {

    }
    function p_injectVendors () {
        applogger('        [injectVendorScripts]');
        var jsVendorsFiles = [];
        if (isBuild()) {
            jsVendorsFiles = ['app/vendors.js'];
        } else {
            jsVendorsFiles = bowerFiles({
                filter: /.*\.js$/,
                paths: {
                    bowerJson: pathToBowerJson,
                    bowerDirectory: pathToVendors
                }
            });
        }
        // console.dir(jsVendorsFiles);
        return inject(gulp.src(jsVendorsFiles, {
            cwd: path.app
        }), {
            relative: true,
            transform: transform,
            name: 'bower'
        });
    }
    function p_cleanup () {

    }
    function p_createPackage () {

    }
}




function doForEachApp(cb) {
    var seriesTasks = merge();
    // logger('[' + taskOwner + '] running through apps:');
    apps.forEach(function (appName) {
        logger('    running the [' + appName + ']');
        var task = cb(appName);
        if (task !== false) {
            seriesTasks.add(task);
        }
    });
    return seriesTasks;
}

function watchLocalChanges() {
    // TDO: fix js first then uncomment
    gulp.watch('ui/src/solution/**/*.js', ['app:lintjs']);
    gulp.watch('ui/src/assets/styles/**', ['app:css']);
    gulp.watch('ui/src/*.tpl.html', ['app:html']);
    gulp.watch('config*.json', ['app:html']);
    gulp.watch('bower.json', ['app:html']);
    gulp.watch('.jshintrc', ['app:lintjs']);
}



// simple wrapper for injected files lthat adds the bust param
function getBustedFile(fileName) {
    return path.urlStatic + fileName + buildVersionUrlParam;
}

// this injects custom variables directly into source
function injectAppVars(appName) {
    logger('        [injectAppVars:' + appName + ']');
    var appConfig = config.apps[appName][env];
    // update config (combine common with local and env configs)
    appConfig.VERSION = buildVersion;
    appConfig.DEBUG = !isBuild;
    appConfig.ENV = env;
    appConfig.STATICDIR = path.urlStatic;
    // adding both local and common values
    if (configLocal[appName]) {
        appConfig = extend(true, config.common, appConfig, configLocal[appName]);
    } else {
        appConfig = extend(true, config.common, appConfig);
    }
    var appvars = {
        CONFIG: JSON.stringify(appConfig),
        CONFIGJSON: appConfig,
        STATICDIR: path.urlStatic,
        VERSION: buildVersion,
        BUST: buildVersionUrlParam,
        APP: appName
    };
    return preprocess({
        context: appvars
    });
}

function transform(filepath, file, i, length) {
    if (filepath.indexOf('.js') > -1) {
        return '<script crossorigin="anonymous" src="' + getBustedFile(filepath) + '"></script>';
    } else {
        return '<link rel="stylesheet" type="text/css" href="' + getBustedFile(filepath) + '"/>';
    }
}

function injectAppScripts(appName) {
    logger('        [injectAppScripts]');
    var jsAppFiles = [];
    if (isBuild) {
        jsAppFiles = ['solution/' + appName + '/' + appName + '.js'];
    } else {
        jsAppFiles = ['solution/' + appName + '/app.js', 'solution/' + appName + '/**/*.js'];
    }
    return inject(gulp.src(jsAppFiles, {
        read: false,
        cwd: path.app
    }), {
        relative: true,
        transform: transform,
        name: appName
    });
}

function injectVendors() {
    logger('        [injectVendorScripts]');
    var jsVendorsFiles = [];
    if (isBuild) {
        jsVendorsFiles = ['solution/vendors.js'];
    } else {
        jsVendorsFiles = bowerFiles({
            filter: /.*\.js$/,
            paths: {
                bowerJson: pathToBowerJson,
                bowerDirectory: pathToVendors
            }
        });
    }
    // console.dir(jsVendorsFiles);
    return inject(gulp.src(jsVendorsFiles, {
        cwd: path.app
    }), {
        relative: true,
        transform: transform,
        name: 'bower'
    });
}

function injectLibs() {
    logger('        [injectAppLibs]');
    var jsAppFiles = [];
    if (isBuild) {
        jsAppFiles = ['solution/libs.js'];
    } else {
        jsAppFiles = ['libs/**/*.js'];
    }
    return inject(gulp.src(jsAppFiles, {
        read: false,
        cwd: path.app
    }), {
        relative: true,
        transform: transform,
        name: 'libs'
    });
}

function handleError(err) {
    logger(err.toString());
    this.emit('end');
}

function genHtml() {
    return doForEachApp(function (appName) {
        if (!hasEnvConfig(appName)) {
            return false;
        }
        return gulp.src(appName + '.tpl.html', {
                cwd: path.app
            })
            .pipe(injectAppVars(appName))
            .pipe(injectAppScripts(appName))
            .pipe(injectAppScripts('shared'))
            .pipe(injectVendors())
            .pipe(injectLibs())
            .pipe(rename(appName + '.html'))
            .pipe(gulp.dest(path.app));
    }, 'genHtml', 'generating html');
}

function cleanCss() {
    logger('[cleanCss]');
    return gulp.src(path.app + 'assets/css/').pipe(clean());
}

function initCss() {
    logger('[initCss]');
    return doForEachApp(function (appName) {
        if (!hasEnvConfig(appName)) {
            return false;
        }
        return gulp.src([
            'assets/styles/' + appName + '/*',
            'assets/styles/' + appName + '/**',
            'assets/styles/' + appName + '/**/*'], {
                cwd: path.app
            })
            .pipe(injectAppVars(appName))
            .pipe(gulp.dest(appName, {
                cwd: path.app + 'assets/css/'
            }));
    }, 'initCss', 'generating css');
}

function genCss() {
    logger('[genCss]');
    return doForEachApp(function (appName) {
        if (!hasEnvConfig(appName)) {
            return false;
        }
        logger('    current path: ' + path.app + 'assets/css/' + appName + '/');
        return gulp.src('*.less', {
                cwd: path.app + 'assets/css/' + appName + '/'
            })
            .pipe(plumber({
                errorHandler: handleError
            }))
            .pipe(less({
                paths: [path.app, path.app + 'assets/css/', path.app + 'assets/css/' + appName + '/']
            }))
            .pipe(uglifySources ? minifyCss({
                processImport: false
            }) : nop())
            .pipe(gulp.dest('.', {
                cwd: path.app + 'assets/css/' + appName + '/'
            }));
    }, 'genCss', 'generating css');
}

function lintJs() {
    logger('[lintJs]');
    return doForEachApp(function (appName) {
        return gulp.src(['solution/' + appName + '/**/*.js'], {
                cwd: path.app
            })
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(jshint.reporter('default'));
    }, 'lintJs');
}

function compressAppTemplates() {
    if (!isBuild) {
        return false;
    }
    return doForEachApp(function (appName) {
        if (!hasEnvConfig(appName)) {
            return false;
        }
        return gulp.src('solution/' + appName + '/**/*.html', {
                cwd: path.dist
            })
            .pipe(injectAppVars(appName))
            .pipe(uglifySources ? minifyHTML() : nop())
            .pipe(gulp.dest('solution/' + appName, {
                cwd: path.dist
            }));
    }, 'appTpl', 'compressing templates');
}

function watchLocalChanges() {
    // TDO: fix js first then uncomment
    gulp.watch('ui/src/solution/**/*.js', ['app:lintjs']);
    gulp.watch('ui/src/assets/styles/**', ['app:css']);
    gulp.watch('ui/src/*.tpl.html', ['app:html']);
    gulp.watch('config*.json', ['app:html']);
    gulp.watch('bower.json', ['app:html']);
    gulp.watch('.jshintrc', ['app:lintjs']);
}

// TODO: merge into one task and run them in sync
// compiles scss files into css
gulp.task('app:css:clean', cleanCss);
gulp.task('app:css:init', ['app:css:clean'], initCss);
gulp.task('app:css:transform', ['app:css:init'], genCss);
gulp.task('app:css', ['app:css:transform'], function () {
    return gulp.src(['assets/css/**/*.less', 'assets/css/**/_**'], {
        cwd: path.app
    }).pipe(clean());
});

// validates js
gulp.task('app:lintjs', lintJs);

// generates root htmls from tpl files
gulp.task('app:html', ['app:css'], genHtml);

gulp.task('app:watch', watchLocalChanges);

/************ build tasks **************/

// Delete the dist directory
gulp.task('dist:clean', function () {
    return gulp.src('ui/dist').pipe(clean());
});

// copy all files into dist dir
gulp.task('dist:copy', ['dist:clean'], function () {
    return gulp.src(['**/*', '!assets/{css,css/**}'], {
        cwd: path.src
    }).pipe(gulp.dest(path.dist));
});

// generates css + lint js files
gulp.task('dist:css:init', ['dist:copy'], initCss);l
gulp.task('dist:css:transform', ['dist:css:init'], genCss);
gulp.task('dist:css', ['dist:css:transform'], function () {
    return gulp.src(['assets/css/**/*.less', 'assets/css/**/_**'], {
        cwd: path.app
    }).pipe(clean());
});
// gulp.task('dist:css', ['dist:copy'], genCss);

gulp.task('dist:lintjs', ['dist:copy'], lintJs);

// compress app's js
gulp.task('dist:appjs', ['dist:copy'], function () {
    return doForEachApp(function (appName) {
        return gulp.src(['solution/' + appName + '/app.js', 'solution/' + appName + '/**/*.js'], {
                cwd: path.src
            })
            .pipe(concat('solution/' + appName + '/' + appName + '.js'))
            .pipe(uglifySources ? uglify() : nop())
            .pipe(gulp.dest('.', {
                cwd: path.dist
            }));
    }, 'appJs', 'compressing js');
});

gulp.task('dist:tpl', ['dist:copy'], compressAppTemplates);

// compress vendor's js
gulp.task('dist:vendors', ['dist:copy'], function () {
    return gulp.src(bowerFiles({
            paths: {
                bowerJson: pathToBowerJson,
                bowerDirectory: pathToVendors
            }
        }))
        .pipe(gulpFilter(['*.js']))
        .pipe(concat('vendors.js'))
        .pipe(uglifySources ? uglify() : nop())
        .pipe(gulp.dest('app', {
            cwd: path.dist
        }));
});

// compress libs js
gulp.task('dist:libs', ['dist:copy'], function () {
    return gulp.src(['libs/**/*.js'], {
            cwd: path.src
        })
        .pipe(concat('libs.js'))
        .pipe(uglifySources ? uglify() : nop())
        .pipe(gulp.dest('app', {
            cwd: path.dist
        }));
});

// create html file and inject combined js and css files
gulp.task('dist:html', ['dist:appjs', 'dist:tpl', 'dist:vendors', 'dist:libs'], genHtml);

// organize files into specific folders
gulp.task('dist:structure', ['dist:html', 'dist:css'], function () {
    // move app js files
    var vendorsJs = gulp.src(['solution/vendors.js'], {
        cwd: path.dist
    }).pipe(gulp.dest('app', {
        cwd: path.distStatic
    }));
    var libsJs = gulp.src(['solution/libs.js'], {
        cwd: path.dist
    }).pipe(gulp.dest('app', {
        cwd: path.distStatic
    }));

    var appJs = doForEachApp(function (appName) {
        return gulp.src(['solution/' + appName + '/' + appName + '.js'], {
                cwd: path.dist
            })
            .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
    }, 'structure', 'moving template files');

    var appTpl = doForEachApp(function (appName) {
        return gulp.src(['solution/' + appName + '/**/*.html'], {
                cwd: path.dist
            })
            .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
    }, 'structure', 'moving template files');

    // move assets
    var assets = gulp.src(['assets/**'], {
            cwd: path.dist
        })
        .pipe(gulp.dest('assets', {
            cwd: path.distStatic
        }));

    // copy only necessary vendors' files
    var vendors = gulp.src(['./vendors/**/*.css', './vendors/**/*.min.js', './vendors/**/fonts/**'], {
            cwd: path.dist
        })
        .pipe(gulp.dest('vendors', {
            cwd: path.distStatic
        }));

    var libs = gulp.src(['./libs/**/*.css', './libs/**/*.min.js', './libs/**/fonts/**'], {
            cwd: path.dist
        })
        .pipe(gulp.dest('libs', {
            cwd: path.distStatic
        }));


    return merge(appJs, appTpl, vendorsJs, libsJs, assets, vendors, libs);
});

// create distro + cleanup unucessary files
gulp.task('package', ['dist:structure'], function () {
    // cleanup files
    var topDistStatic = gulp.src(['./solution/', './assets/', './vendors/', './libs/', '*.tpl.html', '**/*.orig'], {
        cwd: path.dist
    }).pipe(clean());
    var combinedStatic = gulp.src(['./assets/styles', './assets/css/**/*.map'], {
        cwd: path.distStatic
    }).pipe(clean());
    return merge(topDistStatic, combinedStatic);
});

// create distro + cleanup unucessary files
gulp.task('bower', function () {
    var bwr = doForEachApp(function (appName) {


    }, 'structure', 'moving template files');

    return bwr;

});

/******* startup taks *******/

// default task
if (isBuild) {
    gulp.task('default', ['package']);
} else {
    gulp.task('default', ['app:html'], watchLocalChanges);
}