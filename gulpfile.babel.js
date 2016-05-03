// 'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import plumber from 'gulp-plumber';
import inject from 'gulp-inject';
import fs from 'fs';
import uglify from 'gulp-uglify';
import bowerFiles from 'main-bower-files';
import extend from 'node.extend';
import rename from "gulp-rename";
import yargs from "yargs";
import gulpFilter from 'gulp-filter'; // ?
import clean from 'gulp-clean';
import jshint from 'gulp-jshint';
import stylish from 'jshint-stylish';
// import merge from 'merge-stream';
import templateCache from 'gulp-angular-templatecache';
import preprocess from 'gulp-preprocess';
import less from 'gulp-less';
import minifyHTML from 'gulp-minify-html';
import gutil from 'gulp-util';
// import minifyCss from 'gulp-minify-css';
import cleanCSS from 'gulp-clean-css';
import nop from 'gulp-nop';
// import ngHtml2Js from "gulp-ng-html2js";
// import inlineCss from 'gulp-inline-css';
import bower from 'gulp-bower';
import debug from 'gulp-debug';
// import runSequence from 'run-sequence';
// import asyncPipe from 'gulp-async-func-runner';

var
    // application's main config file
    baseConfig = require('./config.json'),
    // srcDir = 'src/',
    // distDir = 'dist/',
    env = (yargs.argv.env || 'debug').toLowerCase(),
    uglifySources = !/debug|dev/.test(env),
    buildVersion = (new Date()).getTime(),
    apps = baseConfig.apps || [];



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
// if (isDeloyment) {
//     logger('OMG! It\'s production build');
//     path.app = path.dist;
// }

// function p_clean () {
//     return gulp.src('./dist', {allowEmpty: true})
//         .pipe(clean()).on('end', function () { console.log('clean DONE'); });
// }
// function p_copy () {
//     return gulp.src('./src').pipe(gulp.dest('./dist'))
//         .on('end', () => { console.log('copying files to: Done!'); });
// }

// var tasks = [p_clean, p_copy];
// const build = gulp.series(tasks);
// export default build;


// gulp.task('default', build);

function logger (...args) {
    gutil.log(args.join(' '));
}

function handleError(err) {
    logger(err.toString());
    this.emit('end');
}

// logger('Running env = ' + env);
// logger('[path] src = ' + path.src);
// logger('[path] dist = ' + path.dist);
// logger('[path] app = ' + path.app);
// logger('[path] urlStatic = ' + path.urlStatic);
// logger('[path] distStatic = ' + path.distStatic);
// logger('[path] pathToVendors = ' + pathToVendors);
// logger('[path] pathToLibs= ' + pathToLibs);
// logger('[path] pathToBowerJson = ' + pathToBowerJson);


// logger('Available apps: ', apps);

// export default taskBuildAll;
// taskBuildAll();

// default task
// if (isDeloyment) {
//     gulp.task('default', taskBuildAll);
// }
//} else {
//     gulp.task('default', ['app:html'], watchLocalChanges);
// }


/******* startup taks *******/




var Application = (function() {

    var privates = new WeakMap();

    const SRC_ROOT = './src/';
    const DIST_ROOT ='./dist/';
    const STATIC_DIR_NAME = 'static';

    function combinePath (...chunks) {
        chunks.forEach((v, k) => {
            if (typeof v === 'function') {
                chunks[k] = v.call(this);
            }
        });
        return chunks.join('/').replace(/\/\//g, '/');
    }

    class _Application {
        constructor ({name: appName, baseCfg: baseConfig, ver: ver, env: env}) {
            
            privates.set(this, {
                name: appName,
                ver: ver,
                env: env,
                cfg: null,
                paths: null,
                urls: null
            });

            // console.log(privates.get(this));

            this.applogger('initializing');

            var pathToBowerJson = this.getPathToFileInAppDir('bower.json'),
                appConfigGeneral = require(this.getPathToFileInAppDir('config.json')),
                appConfigGeneralCurrEnv = appConfigGeneral[this.env],
                paths = {},
                urls = {},
                cfg = {};

            cfg = extend(true, baseConfig.base, baseConfig.common,
                appConfigGeneral.common || {}, appConfigGeneralCurrEnv)
            paths = {
                src: {
                    app: this.getPathToFileInAppDir(),
                    assets: this.combinePathDir(this.getPathToFileInAppDir, 'assets'),
                    assetsCss: this.combinePathDir(this.getPathToFileInAppDir, 'assets', 'css'),
                    assetsStyles: this.combinePathDir(this.getPathToFileInAppDir, 'assets', 'styles'),
                    vendors: this.combinePathDir(this.getPathToFileInAppDir, 'vendors')
                },
                dist: {
                    app: this.getPathToFileInDistAppDir(),
                    assets: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets'),
                    assetsCss: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets', 'css'),
                    assetsStyles: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets', 'styles'),
                    vendors: this.combinePathDir(this.getPathToFileInDistAppDir, 'vendors')
                }
            };
            paths.run = this.isDeloyment ? paths.dist : paths.src;
            urls = {
                static: this.isDeloyment ? this.combinePathDir(cfg.staticPath, this.distName) : 
                    this.combinePathDir(cfg.staticPath, this.name)
            };

            privates.get(this).cfg = cfg;
            privates.get(this).paths = paths;
            privates.get(this).urls = urls;
        }

        // get staticDirName () { return this.isDeloyment ? `${STATIC_DIR_NAME}_${this.ver}` : STATIC_DIR_NAME; }
        get name () { return privates.get(this).name; }
        get distName () { return privates.get(this).name + '_' + this.ver; }
        get ver () { return privates.get(this).ver; }
        get env () { return privates.get(this).env; }
        get bust () { return `?bust=${this.ver}`; }
        get canUglify () { return !/debug|dev/.test(this.ver); }
        get isDeloyment () { return this.env !== 'debug'; }
        get config () { return privates.get(this).cfg; }
        get paths () { return privates.get(this).paths; }
        get urls () { return privates.get(this).urls; }
        get injectables () {
            // var appConfig = this.getAppConfig();
            // appConfig.VERSION = buildVersion;
            // appConfig.DEBUG = !this.isDeloyment();
            // appConfig.ENV = env;
            // appConfig.STATICDIR = path.app.static;
            // adding both local and common values
            // if (configLocal[appName]) {
            //     appConfig = extend(true, config.common, appConfig, configLocal[appName]);
            // } else {
            //     appConfig = extend(true, config.common, appConfig);
            // }
            var appvars = {
                DEBUG: !this.isDeloyment,
                ENV: this.env,
                CONFIG: JSON.stringify(this.config),
                CONFIGJSON: this.config,
                STATICDIR: this.urls.static,
                VERSION: this.ver,
                BUST: this.bust,
                APP: this.name
            };
            console.log('appvars', appvars);
            return appvars;
        }



        combinePath (...p) {
            return combinePath.bind(this)(...p);
        }

        combinePathDir (...p) {
            p.push('');
            return combinePath.bind(this)(...p);
        }

        getPathToFileInAppDir (p) {
            return  `${SRC_ROOT}${this.name}/${!!p ? p : ''}`;
        }

        getPathToFileInDistAppDir (p) {
            return  `${DIST_ROOT}${this.distName}/${!!p ? p : ''}`;
        }

        applogger (...params) {
            logger(`    [${this.name}] ${params.join(' ')}`);
        }

        appFnLogger (fn, ...params) {
            logger(`        [${this.name}.${fn}] ${params.join(' ')}`);
        }

        // hasEnvConfig (env) {
        //     if (env) {
        //         return config && config.apps && config.apps[name] && config.apps[name][env];
        //     }
        //     return config && config.apps && config.apps[name];
        // }

        //-------- TASKS

        t_build () {
            if (this.isDeloyment) {
                return this.t_buildDist();
            }
            // this.appFnLogger('t_build', 'starting');
            return [
                this.p_InstallBowerDeps.bind(this),
                ...this.p_genCss.bind(this)()
            ];
        }

        t_buildDist () {
            // this.appFnLogger('t_buildDist', 'starting');
            return [
                this.p_InstallBowerDeps.bind(this),
                this.p_clearDist.bind(this),
                this.p_copyFiles.bind(this),
                ...this.p_genCss.bind(this)(),
                gulp.parallel(this.p_clearDist2.bind(this),
                    this.p_clearDist3.bind(this))
            ];
        }

        //--------- FILE MODIFIERS

        p_clearDist2 () {
            // this.appFnLogger('p_clearDist', 'cleaning ' + this.paths.dist.app);
            return gulp.src(this.paths.dist.app+'_2', {allowEmpty: true})
                .pipe(clean())
                .on('end', () => this.appFnLogger('p_clearDist2', 'done'));
        }

        p_clearDist3 () {
            // this.appFnLogger('p_clearDist', 'cleaning ' + this.paths.dist.app);
            return gulp.src(this.paths.dist.app+'_3', {allowEmpty: true})
                .pipe(clean())
                .on('end', () => this.appFnLogger('p_clearDist3', 'done'));
        }

        p_InstallBowerDeps () {
            // this.appFnLogger('p_InstallBowerDeps');
            return bower({cwd: this.paths.run.app})
                .pipe(gulp.dest(this.paths.run.vendors));
        }

        p_clearDist () {
            this.appFnLogger('p_clearDist', 'cleaning ' + this.paths.dist.app);
            return gulp.src(this.paths.dist.app, {allowEmpty: true})
                .pipe(clean())
                .on('end', () => this.appFnLogger('p_clearDist', 'done'));
        }

        p_copyFiles () {
            this.appFnLogger('p_copyFiles', 'copying files to ' + this.paths.dist.app);
            return gulp.
                src(['**/*', '!assets/{css,css/**}'], {
                    cwd: this.paths.src.app
                })
                .pipe(gulp.dest(this.paths.dist.app))
                // .on('end', () => this.appFnLogger('p_copyFiles', 'done'));
        }

        p_genCss () {
            var canUglify = this.canUglify;
            var _cssRemoveDir = () => {
                return gulp.src(this.paths.run.assetsCss, {allowEmpty: true})
                    .pipe(clean())
                    // .on('end', () => this.appFnLogger('_cssRemoveDir', 'done'))
            };
            var _cssCopyAllStylesIntoCssDir = () => {
                return gulp.src(['*', '**', '**/*'], {
                        cwd: this.paths.run.assetsStyles
                    })
                    .pipe(preprocess({
                        context: this.injectables
                    }))
                    .pipe(gulp.dest('.', {
                        cwd: this.paths.run.assetsCss
                    }));
            };
            var _cssGenerate = () => {
                return gulp.src(['*.less', '**/*.less'], {
                        cwd: this.paths.run.assetsCss
                    })
                    .pipe(debug())
                    .pipe(plumber({
                        errorHandler: handleError
                    }))
                    .pipe(less({
                        paths: [this.paths.run.assetsCss + '/*']
                    }))
                    .pipe(canUglify ? cleanCSS({
                        processImport: false
                    }) : nop())
                    .pipe(gulp.dest('.', {
                        cwd: this.paths.run.assetsCss
                    }))
                    // .on('end', () => this.appFnLogger('_cssGenerate', 'done'))
            };
            var _cssRemoveNonCssFiles = () => {
                return gulp.src(['*.less', '**/*.less', '_**'], {
                        cwd: this.paths.run.assetsCss
                    }).pipe(clean());
            };
            return [_cssRemoveDir, _cssCopyAllStylesIntoCssDir, _cssGenerate, _cssRemoveNonCssFiles];
        }

        p_transformTemplate () {
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

        p_transformLess () {

        }

        p_compressAppJs () {

        }

        p_compressVendorsJs () {

        }

        p_compressLibJs () {

        }

        p_injectStatic () {

        }

        p_injectVendors () {
            this.applogger('        [injectVendorScripts]');
            var jsVendorsFiles = [];
            if (isDeloyment()) {
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

        p_cleanup () {

        }

        p_createPackage () {

        }

    }

    return _Application;
})();

function doForEachApp(cb) {
    // var series = [];
    // var parallel = [];
    var series = [];
    // logger('[' + taskOwner + '] running through apps:');
    apps.forEach((appName) => {
        // logger('running the [' + appName + ']');
        // var task = cb(appName);
        // logger(appName, ' task= ', task);
        // if (!!task) {
            // logger(appName, ' >>>> ', task);
            var tasks = cb(appName);
            series.push(...tasks);
            // tasks.series;
            // tasks.parallel;
            // apps.unshift([gulp.series(tasks.series), gulp.parallel(tasks.parallel)]);

        // }
    });
    // logger('total tasks to run: ', series.length);
    // logger(series);
    return gulp.series(...series);
}

function taskBuild () {
    return doForEachApp((appName) => {
        var app = new Application({
            name: appName,
            baseCfg: baseConfig,
            ver: buildVersion,
            env: env
        });
        return app.t_build();
    });
}
function taskBuildDist () {
    return doForEachApp((appName) => {
        var app = new Application({
            name: appName,
            baseCfg: baseConfig,
            ver: buildVersion,
            env: env
        });
        return app.t_buildDist();
    });
}

gulp.task('default', taskBuild());
gulp.task('build', taskBuild());
gulp.task('build-dist', taskBuildDist());



// function watchLocalChanges() {
//     // TDO: fix js first then uncomment
//     gulp.watch('ui/src/solution/**/*.js', ['app:lintjs']);
//     gulp.watch('ui/src/assets/styles/**', ['app:css']);
//     gulp.watch('ui/src/*.tpl.html', ['app:html']);
//     gulp.watch('config*.json', ['app:html']);
//     gulp.watch('bower.json', ['app:html']);
//     gulp.watch('.jshintrc', ['app:lintjs']);
// }



// // simple wrapper for injected files lthat adds the bust param
// function getBustedFile(fileName) {
//     return path.urlStatic + fileName + buildVersionUrlParam;
// }

// // this injects custom variables directly into source
// function injectAppVars(appName) {
//     logger('        [injectAppVars:' + appName + ']');
//     var appConfig = config.apps[appName][env];
//     // update config (combine common with local and env configs)
//     appConfig.VERSION = buildVersion;
//     appConfig.DEBUG = !isDeloyment();
//     appConfig.ENV = env;
//     appConfig.STATICDIR = path.urlStatic;
//     // adding both local and common values
//     if (configLocal[appName]) {
//         appConfig = extend(true, config.common, appConfig, configLocal[appName]);
//     } else {
//         appConfig = extend(true, config.common, appConfig);
//     }
//     var appvars = {
//         CONFIG: JSON.stringify(appConfig),
//         CONFIGJSON: appConfig,
//         STATICDIR: path.urlStatic,
//         VERSION: buildVersion,
//         BUST: buildVersionUrlParam,
//         APP: appName
//     };
//     return preprocess({
//         context: appvars
//     });
// }

// function transform(filepath, file, i, length) {
//     if (filepath.indexOf('.js') > -1) {
//         return '<script crossorigin="anonymous" src="' + getBustedFile(filepath) + '"></script>';
//     } else {
//         return '<link rel="stylesheet" type="text/css" href="' + getBustedFile(filepath) + '"/>';
//     }
// }

// function injectAppScripts(appName) {
//     logger('        [injectAppScripts]');
//     var jsAppFiles = [];
//     if (isDeloyment) {
//         jsAppFiles = ['solution/' + appName + '/' + appName + '.js'];
//     } else {
//         jsAppFiles = ['solution/' + appName + '/app.js', 'solution/' + appName + '/**/*.js'];
//     }
//     return inject(gulp.src(jsAppFiles, {
//         read: false,
//         cwd: path.app
//     }), {
//         relative: true,
//         transform: transform,
//         name: appName
//     });
// }

// function injectVendors() {
//     logger('        [injectVendorScripts]');
//     var jsVendorsFiles = [];
//     if (isDeloyment) {
//         jsVendorsFiles = ['solution/vendors.js'];
//     } else {
//         jsVendorsFiles = bowerFiles({
//             filter: /.*\.js$/,
//             paths: {
//                 bowerJson: pathToBowerJson,
//                 bowerDirectory: pathToVendors
//             }
//         });
//     }
//     // console.dir(jsVendorsFiles);
//     return inject(gulp.src(jsVendorsFiles, {
//         cwd: path.app
//     }), {
//         relative: true,
//         transform: transform,
//         name: 'bower'
//     });
// }

// function injectLibs() {
//     logger('        [injectAppLibs]');
//     var jsAppFiles = [];
//     if (isDeloyment) {
//         jsAppFiles = ['solution/libs.js'];
//     } else {
//         jsAppFiles = ['libs/**/*.js'];
//     }
//     return inject(gulp.src(jsAppFiles, {
//         read: false,
//         cwd: path.app
//     }), {
//         relative: true,
//         transform: transform,
//         name: 'libs'
//     });
// }

// function handleError(err) {
//     logger(err.toString());
//     this.emit('end');
// }

// function genHtml() {
//     return doForEachApp(function (appName) {
//         if (!hasEnvConfig(appName)) {
//             return false;
//         }
//         return gulp.src(appName + '.tpl.html', {
//                 cwd: path.app
//             })
//             .pipe(injectAppVars(appName))
//             .pipe(injectAppScripts(appName))
//             .pipe(injectAppScripts('shared'))
//             .pipe(injectVendors())
//             .pipe(injectLibs())
//             .pipe(rename(appName + '.html'))
//             .pipe(gulp.dest(path.app));
//     }, 'genHtml', 'generating html');
// }

// function cleanCss() {
//     logger('[cleanCss]');
//     return gulp.src(path.app + 'assets/css/').pipe(clean());
// }

// function initCss() {
//     logger('[initCss]');
//     return doForEachApp(function (appName) {
//         if (!hasEnvConfig(appName)) {
//             return false;
//         }
//         return gulp.src([
//             'assets/styles/' + appName + '/*',
//             'assets/styles/' + appName + '/**',
//             'assets/styles/' + appName + '/**/*'], {
//                 cwd: path.app
//             })
//             .pipe(injectAppVars(appName))
//             .pipe(gulp.dest(appName, {
//                 cwd: path.app + 'assets/css/'
//             }));
//     }, 'initCss', 'generating css');
// }

// function genCss() {
//     logger('[genCss]');
//     return doForEachApp(function (appName) {
//         if (!hasEnvConfig(appName)) {
//             return false;
//         }
//         logger('    current path: ' + path.app + 'assets/css/' + appName + '/');
//         return gulp.src('*.less', {
//                 cwd: path.app + 'assets/css/' + appName + '/'
//             })
//             .pipe(plumber({
//                 errorHandler: handleError
//             }))
//             .pipe(less({
//                 paths: [path.app, path.app + 'assets/css/', path.app + 'assets/css/' + appName + '/']
//             }))
//             .pipe(uglifySources ? minifyCss({
//                 processImport: false
//             }) : nop())
//             .pipe(gulp.dest('.', {
//                 cwd: path.app + 'assets/css/' + appName + '/'
//             }));
//     }, 'genCss', 'generating css');
// }

// function lintJs() {
//     logger('[lintJs]');
//     return doForEachApp(function (appName) {
//         return gulp.src(['solution/' + appName + '/**/*.js'], {
//                 cwd: path.app
//             })
//             .pipe(jshint())
//             .pipe(jshint.reporter(stylish))
//             .pipe(jshint.reporter('default'));
//     }, 'lintJs');
// }

// function compressAppTemplates() {
//     if (!isDeloyment) {
//         return false;
//     }
//     return doForEachApp(function (appName) {
//         if (!hasEnvConfig(appName)) {
//             return false;
//         }
//         return gulp.src('solution/' + appName + '/**/*.html', {
//                 cwd: path.dist
//             })
//             .pipe(injectAppVars(appName))
//             .pipe(uglifySources ? minifyHTML() : nop())
//             .pipe(gulp.dest('solution/' + appName, {
//                 cwd: path.dist
//             }));
//     }, 'appTpl', 'compressing templates');
// }

// function watchLocalChanges() {
//     // TDO: fix js first then uncomment
//     gulp.watch('ui/src/solution/**/*.js', ['app:lintjs']);
//     gulp.watch('ui/src/assets/styles/**', ['app:css']);
//     gulp.watch('ui/src/*.tpl.html', ['app:html']);
//     gulp.watch('config*.json', ['app:html']);
//     gulp.watch('bower.json', ['app:html']);
//     gulp.watch('.jshintrc', ['app:lintjs']);
// }

// // TODO: merge into one task and run them in sync
// // compiles scss files into css
// gulp.task('app:css:clean', cleanCss);
// gulp.task('app:css:init', ['app:css:clean'], initCss);
// gulp.task('app:css:transform', ['app:css:init'], genCss);
// gulp.task('app:css', ['app:css:transform'], function () {
//     return gulp.src(['assets/css/**/*.less', 'assets/css/**/_**'], {
//         cwd: path.app
//     }).pipe(clean());
// });

// // validates js
// gulp.task('app:lintjs', lintJs);

// // generates root htmls from tpl files
// gulp.task('app:html', ['app:css'], genHtml);

// gulp.task('app:watch', watchLocalChanges);

// /************ build tasks **************/

// // Delete the dist directory
// gulp.task('dist:clean', function () {
//     return gulp.src('ui/dist').pipe(clean());
// });

// // copy all files into dist dir
// gulp.task('dist:copy', ['dist:clean'], function () {
//     return gulp.src(['**/*', '!assets/{css,css/**}'], {
//         cwd: path.src
//     }).pipe(gulp.dest(path.dist));
// });

// // generates css + lint js files
// gulp.task('dist:css:init', ['dist:copy'], initCss);l
// gulp.task('dist:css:transform', ['dist:css:init'], genCss);
// gulp.task('dist:css', ['dist:css:transform'], function () {
//     return gulp.src(['assets/css/**/*.less', 'assets/css/**/_**'], {
//         cwd: path.app
//     }).pipe(clean());
// });
// // gulp.task('dist:css', ['dist:copy'], genCss);

// gulp.task('dist:lintjs', ['dist:copy'], lintJs);

// // compress app's js
// gulp.task('dist:appjs', ['dist:copy'], function () {
//     return doForEachApp(function (appName) {
//         return gulp.src(['solution/' + appName + '/app.js', 'solution/' + appName + '/**/*.js'], {
//                 cwd: path.src
//             })
//             .pipe(concat('solution/' + appName + '/' + appName + '.js'))
//             .pipe(uglifySources ? uglify() : nop())
//             .pipe(gulp.dest('.', {
//                 cwd: path.dist
//             }));
//     }, 'appJs', 'compressing js');
// });

// gulp.task('dist:tpl', ['dist:copy'], compressAppTemplates);

// // compress vendor's js
// gulp.task('dist:vendors', ['dist:copy'], function () {
//     return gulp.src(bowerFiles({
//             paths: {
//                 bowerJson: pathToBowerJson,
//                 bowerDirectory: pathToVendors
//             }
//         }))
//         .pipe(gulpFilter(['*.js']))
//         .pipe(concat('vendors.js'))
//         .pipe(uglifySources ? uglify() : nop())
//         .pipe(gulp.dest('app', {
//             cwd: path.dist
//         }));
// });

// // compress libs js
// gulp.task('dist:libs', ['dist:copy'], function () {
//     return gulp.src(['libs/**/*.js'], {
//             cwd: path.src
//         })
//         .pipe(concat('libs.js'))
//         .pipe(uglifySources ? uglify() : nop())
//         .pipe(gulp.dest('app', {
//             cwd: path.dist
//         }));
// });

// // create html file and inject combined js and css files
// gulp.task('dist:html', ['dist:appjs', 'dist:tpl', 'dist:vendors', 'dist:libs'], genHtml);

// // organize files into specific folders
// gulp.task('dist:structure', ['dist:html', 'dist:css'], function () {
//     // move app js files
//     var vendorsJs = gulp.src(['solution/vendors.js'], {
//         cwd: path.dist
//     }).pipe(gulp.dest('app', {
//         cwd: path.distStatic
//     }));
//     var libsJs = gulp.src(['solution/libs.js'], {
//         cwd: path.dist
//     }).pipe(gulp.dest('app', {
//         cwd: path.distStatic
//     }));

//     var appJs = doForEachApp(function (appName) {
//         return gulp.src(['solution/' + appName + '/' + appName + '.js'], {
//                 cwd: path.dist
//             })
//             .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
//     }, 'structure', 'moving template files');

//     var appTpl = doForEachApp(function (appName) {
//         return gulp.src(['solution/' + appName + '/**/*.html'], {
//                 cwd: path.dist
//             })
//             .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
//     }, 'structure', 'moving template files');

//     // move assets
//     var assets = gulp.src(['assets/**'], {
//             cwd: path.dist
//         })
//         .pipe(gulp.dest('assets', {
//             cwd: path.distStatic
//         }));

//     // copy only necessary vendors' files
//     var vendors = gulp.src(['./vendors/**/*.css', './vendors/**/*.min.js', './vendors/**/fonts/**'], {
//             cwd: path.dist
//         })
//         .pipe(gulp.dest('vendors', {
//             cwd: path.distStatic
//         }));

//     var libs = gulp.src(['./libs/**/*.css', './libs/**/*.min.js', './libs/**/fonts/**'], {
//             cwd: path.dist
//         })
//         .pipe(gulp.dest('libs', {
//             cwd: path.distStatic
//         }));


//     return merge(appJs, appTpl, vendorsJs, libsJs, assets, vendors, libs);
// });

// // create distro + cleanup unucessary files
// gulp.task('package', ['dist:structure'], function () {
//     // cleanup files
//     var topDistStatic = gulp.src(['./solution/', './assets/', './vendors/', './libs/', '*.tpl.html', '**/*.orig'], {
//         cwd: path.dist
//     }).pipe(clean());
//     var combinedStatic = gulp.src(['./assets/styles', './assets/css/**/*.map'], {
//         cwd: path.distStatic
//     }).pipe(clean());
//     return merge(topDistStatic, combinedStatic);
// });

// // create distro + cleanup unucessary files
// gulp.task('bower', function () {
//     var bwr = doForEachApp(function (appName) {


//     }, 'structure', 'moving template files');

//     return bwr;

// });

// /******* startup taks *******/

// // default task
// if (isDeloyment) {
//     gulp.task('default', ['package']);
// } else {
//     gulp.task('default', ['app:html'], watchLocalChanges);
// }


