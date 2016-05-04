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
import eslint from 'gulp-eslint';
// import stylish from 'jshint-stylish';
import merge from 'merge-stream';
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



// if (!baseConfig) {
//     throw "Cannot find base configuration in the main config.json";
// }

if (apps.length === 0) {
    throw "No applications present";
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

    var getDirNameFromPath = (path) => path.match(/([^\/]*)\/*$/)[1];

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

            var appConfigGeneral = require(this.getPathToFileInAppDir('config.json')),
                appConfigGeneralCurrEnv = appConfigGeneral[this.env],
                paths = {},
                urls = {},
                cfg = {};

            cfg = extend(true, baseConfig.common,
                appConfigGeneral.common || {}, appConfigGeneralCurrEnv)
            paths = {
                src: {
                    app: this.getPathToFileInAppDir(),
                    bowerJson: this.getPathToFileInAppDir('bower.json'),
                    api: this.combinePathDir(this.getPathToFileInAppDir, 'api'),
                    bricks: this.combinePathDir(this.getPathToFileInAppDir, 'bricks'),
                    components: this.combinePathDir(this.getPathToFileInAppDir, 'components'),
                    pages: this.combinePathDir(this.getPathToFileInAppDir, 'pages'),
                    libs: this.combinePathDir(this.getPathToFileInAppDir, 'libs'),
                    assets: this.combinePathDir(this.getPathToFileInAppDir, 'assets'),
                    assetsCss: this.combinePathDir(this.getPathToFileInAppDir, 'assets', 'css'),
                    assetsStyles: this.combinePathDir(this.getPathToFileInAppDir, 'assets', 'styles'),
                    vendors: this.combinePathDir(this.getPathToFileInAppDir, 'vendors'),
                    static: this.combinePathDir(this.getPathToFileInAppDir, this.staticDirName)
                },
                dist: {
                    app: this.getPathToFileInDistAppDir(),
                    bowerJson: this.getPathToFileInDistAppDir('bower.json'),
                    api: this.combinePathDir(this.getPathToFileInDistAppDir, 'api'),
                    bricks: this.combinePathDir(this.getPathToFileInDistAppDir, 'bricks'),
                    components: this.combinePathDir(this.getPathToFileInDistAppDir, 'components'),
                    pages: this.combinePathDir(this.getPathToFileInDistAppDir, 'pages'),
                    libs: this.combinePathDir(this.getPathToFileInDistAppDir, 'libs'),
                    assets: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets'),
                    assetsCss: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets', 'css'),
                    assetsStyles: this.combinePathDir(this.getPathToFileInDistAppDir, 'assets', 'styles'),
                    vendors: this.combinePathDir(this.getPathToFileInDistAppDir, 'vendors'),
                    static: this.combinePathDir(this.getPathToFileInDistAppDir, this.staticDirNameDist)
                }
            };
            paths.run = this.isDeloyment ? paths.dist : paths.src;
            privates.get(this).cfg = cfg;
            privates.get(this).paths = paths;

            urls = {
                // static: this.isDeloyment ? this.combinePathDir(cfg.staticRoot, this.distName) : 
                //     this.combinePathDir(cfg.staticRoot, this.name)
                static: this.staticUrlPath
            };
            privates.get(this).urls = urls;
        }

        get staticDirName () {
            return '';
        }
        get staticDirNameDist () {
            return `${STATIC_DIR_NAME}_${this.ver}`;
        }
        get staticUrlPath () {
            if (this.isDeloyment) {
                return this.combinePathDir(this.config.staticUrlPrefix, this.staticDirNameDist)
            }
            return this.config.staticUrlPrefix;
        }
        get name () { return privates.get(this).name; }
        get distName () { return privates.get(this).name; }
        get ver () { return privates.get(this).ver; }
        get env () { return privates.get(this).env; }
        get bust () { return `?bust=${this.ver}`; }
        get canUglify () { return !/debug|dev/.test(this.ver); }
        get isDeloyment () { return this.env !== 'debug'; }
        get config () { return privates.get(this).cfg; }
        get paths () { return privates.get(this).paths; }
        get urls () { return privates.get(this).urls; }
        get staticUrl () { return this.urls.static; }
        get mainHtmlFiles () { return this.config.mainHtmlFiles; }
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
                STATICDIR: this.staticUrl,
                VERSION: this.ver,
                BUST: this.bust,
                APP: this.name
            };
            // console.log('appvars', appvars);
            return appvars;
        }
        appJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.app, 'app.js'),
                    this.combinePath(wrkPh.api, '**/*.js'),
                    this.combinePath(wrkPh.bricks, '**/*.js'),
                    this.combinePath(wrkPh.components, '**/*.js'),
                    this.combinePath(wrkPh.pages, '**/*.js')
                ];
            return jsAppFiles;
        }
        appHtmlFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.components, '**/*.html'),
                    this.combinePath(wrkPh.pages, '**/*.html')
                ];
            return jsAppFiles;
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

        getBustedStaticFileUrl (fileName) {
            return this.staticUrlPath + fileName + (this.config.bustFiles ? this.bust : '');
        }

        //-------- TASKS

        t_build () {
            var tasks = this.t_buildNoWatch();
            if (!this.isDeloyment) {
                tasks.push(this.p_watch.bind(this));
            }
            return tasks;
        }

        t_buildNoWatch () {
            if (this.isDeloyment) {
                return this.t_buildDist();
            }
            return [
                this.p_lintJs.bind(this),
                this.p_InstallBowerDeps.bind(this),
                gulp.parallel([
                    this.p_transformTemplate.bind(this),
                    gulp.series(...this.t_genCss.bind(this)())
                ])
            ];
        }

        t_buildDist () {
            return [
                this.p_lintJs.bind(this),
                this.p_InstallBowerDeps.bind(this),
                this.p_clearDist.bind(this),
                this.p_copyFiles.bind(this),
                gulp.parallel([
                    this.p_transformTemplate.bind(this),
                    gulp.series(...this.t_genCss.bind(this)()),
                    this.p_compressAppJs.bind(this),
                    this.p_compressVendorsJs.bind(this),
                    this.p_compressLibJs.bind(this),
                    this.p_compressHtml.bind(this)
                ]),
                this.p_createPackage.bind(this)
            ];
        }

        t_genCss () {
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
            };
            var _cssRemoveNonCssFiles = () => {
                return gulp.src(['*.less', '**/*.less', '_**'], {
                        cwd: this.paths.run.assetsCss
                    }).pipe(clean());
            };
            return [_cssRemoveDir, _cssCopyAllStylesIntoCssDir, _cssGenerate, _cssRemoveNonCssFiles];
        }

        t_lintJs () {
            return [p_lintJs];
        }
        //--------- FILE MODIFIERS

        p_clearDist2 () {
            return gulp.src(this.paths.dist.app+'_2', {allowEmpty: true})
                .pipe(clean())
                .on('end', () => this.appFnLogger('p_clearDist2', 'done'));
        }

        p_clearDist3 () {
            return gulp.src(this.paths.dist.app+'_3', {allowEmpty: true})
                .pipe(clean())
                .on('end', () => this.appFnLogger('p_clearDist3', 'done'));
        }

        p_InstallBowerDeps () {
            var fs = require('fs');
            if (!fs.existsSync(this.paths.run.bowerJson))
                return gulp.src('nothing', {allowEmpty: true}).pipe(nop());
            return bower({ cwd: this.paths.run.app, directory: getDirNameFromPath(this.paths.run.vendors) })
                .pipe(debug())
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
        }

        p_transformTemplate () {
            var that = this;

            var transform = (filepath) => {
                if (filepath.indexOf('.js') > -1) {
                    return '<script crossorigin="anonymous" src="' + that.getBustedStaticFileUrl(filepath) + '"></script>';
                } else {
                    return '<link rel="stylesheet" type="text/css" href="' + that.getBustedStaticFileUrl(filepath) + '"/>';
                }
            }

            var injectAppScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'app.min.js')];
                } else {
                    jsAppFiles = that.appJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'app'
                });
            }

            var injectVendors = () => {
                var jsVendorsFiles = [];
                if (that.isDeloyment) {
                    jsVendorsFiles = [that.combinePath(that.paths.run.app, 'vendors.min.js')];
                } else {
                    jsVendorsFiles = bowerFiles({
                        filter: /.*\.js$/,
                        paths: {
                            bowerJson: that.paths.run.bowerJson,
                            bowerDirectory: that.paths.run.vendors
                        }
                    });
                }
                return inject(gulp.src(jsVendorsFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'bower'
                });
            }

            var injectLibs = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'libs.min.js')];
                } else {
                    jsAppFiles = [that.combinePath(that.paths.run.libs, '**/*.js')];
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'libs'
                });
            }

            // TODO: index.tpl.html can be a default value
            //       that will be taken from the combined
            //       config file.
            //       Later we can specify either array with templates
            //       or single file to be processed

            var html2compress = this.mainHtmlFiles.map((fName) => {
                return gulp.src(that.combinePath(that.paths.run.app, `${fName}.tpl.html`))
                    .pipe(preprocess({
                        context: this.injectables
                    }))
                    .pipe(injectAppScripts())
                    .pipe(injectVendors())
                    .pipe(injectLibs())
                    .pipe(rename(`${fName}.html`))
                    .pipe(gulp.dest(that.paths.run.app));
            });

            return merge(...html2compress);
        }

        p_compressAppJs () {
            return gulp.src(this.appJsFilesGlobsArray())
                .pipe(concat('app.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressVendorsJs () {
            return gulp.src(bowerFiles({
                    paths: {
                        bowerJson: this.paths.run.bowerJson,
                        bowerDirectory: this.paths.run.vendors
                    }
                }))
                .pipe(gulpFilter(['*.js']))
                .pipe(concat('vendors.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(that.paths.run.app));
        }

        p_compressLibJs () {
            return gulp.src(that.combinePath(that.paths.run.libs, '**/*.js'))
                .pipe(concat('libs.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(that.paths.run.app));
        }

        p_compressHtml () {
            if (!this.isDeloyment) {
                return false;
            }
            return gulp.src(this.appHtmlFilesGlobsArray())
                .pipe(preprocess({
                    context: this.injectables
                }))
                .pipe(this.canUglify ? minifyHTML() : nop())
                .pipe(gulp.dest(that.paths.run.app));
        }

        p_createPackage () {


            // // move app js files
            // var vendorsJs = gulp.src(['solution/vendors.js'], {
            //     cwd: path.dist
            // }).pipe(gulp.dest('app', {
            //     cwd: path.distStatic
            // }));
            // var libsJs = gulp.src(['solution/libs.js'], {
            //     cwd: path.dist
            // }).pipe(gulp.dest('app', {
            //     cwd: path.distStatic
            // }));

            // var appJs = doForEachApp(function (appName) {
            //     return gulp.src(['solution/' + appName + '/' + appName + '.js'], {
            //             cwd: path.dist
            //         })
            //         .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
            // }, 'structure', 'moving template files');


            var move2static = () => {
                return gulp.src([
                        this.getPathToFileInDistAppDir('app.min.js'),
                        this.getPathToFileInDistAppDir('libs.min.js'),
                        this.getPathToFileInDistAppDir('vendors.min.js'),
                        this.getPathToFileInDistAppDir('**/*.html'),
                        this.paths.dist.assets,
                        this.combinePath(this.paths.run.vendors, '**/*.css'),
                        this.combinePath(this.paths.run.vendors, '**/*.min.js'),
                        this.combinePath(this.paths.run.vendors, '**/fonts/**'),
                        this.combinePath(this.paths.run.libs, '**/*.css'),
                        this.combinePath(this.paths.run.libs, '**/*.min.js'),
                        this.combinePath(this.paths.run.libs, '**/fonts/**'),
                    ])
                    .pipe(gulp.dest(that.paths.dist.static))
            }

            // var appTpl = doForEachApp(function (appName) {
            //     return gulp.src(['solution/' + appName + '/**/*.html'], {
            //             cwd: path.dist
            //         })
            //         .pipe(gulp.dest(path.distStatic + 'solution/' + appName + '/'));
            // }, 'structure', 'moving template files');

            // // move assets
            // var assets = gulp.src(['assets/**'], {
            //         cwd: path.dist
            //     })
            //     .pipe(gulp.dest('assets', {
            //         cwd: path.distStatic
            //     }));

            // // copy only necessary vendors' files
            // var vendors = gulp.src(['./vendors/**/*.css', './vendors/**/*.min.js', './vendors/**/fonts/**'], {
            //         cwd: path.dist
            //     })
            //     .pipe(gulp.dest('vendors', {
            //         cwd: path.distStatic
            //     }));

            // var libs = gulp.src(['./libs/**/*.css', './libs/**/*.min.js', './libs/**/fonts/**'], {
            //         cwd: path.dist
            //     })
            //     .pipe(gulp.dest('libs', {
            //         cwd: path.distStatic
            //     }));

            var cleanInDist = () => {
                return gulp.src([
                        this.combinePathDir(this.paths.run.app, 'api'),
                        this.combinePathDir(this.paths.run.app, 'assets'),
                        this.combinePathDir(this.paths.run.app, 'bricks'),
                        this.combinePathDir(this.paths.run.app, 'components'),
                        this.combinePathDir(this.paths.run.app, 'libs'),
                        this.combinePathDir(this.paths.run.app, 'pages'),
                        this.combinePathDir(this.paths.run.app, 'vendors'),
                        this.combinePath(this.paths.run.app, '*.tpl.html'),
                        this.combinePath(this.paths.run.app, '**/*.orig'),
                        this.combinePath(this.paths.run.static, '**/styles/**'),
                    ])
                    .pipe(clean());
            };

            // // cleanup files
            // var topDistStatic = gulp.src(['./solution/', './assets/', './vendors/', './libs/', '*.tpl.html', '**/*.orig'], {
            //     cwd: path.dist
            // }).pipe(clean());

            // var combinedStatic = gulp.src(['./assets/styles', './assets/css/**/*.map'], {
            //     cwd: path.distStatic
            // }).pipe(clean());

            return merge(move2static, cleanInDist);

            // return merge(appJs, appTpl, vendorsJs, libsJs, assets, vendors, libs,
            //     topDistStatic, combinedStatic);
        }

        p_lintJs () {
            return gulp.src(this.appJsFilesGlobsArray('src'))
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.results(function (results) {
                    // Called once for all ESLint results.
                    console.log('Total Results: ' + results.length);
                    console.log('Total Warnings: ' + results.warningCount);
                    console.log('Total Errors: ' + results.errorCount);
                }))
                .pipe(eslint.failAfterError());
        }

        p_watch () {
            gulp.watch(this.appJsFilesGlobsArray(), this.p_lintJs.bind(this));
            // gulp.watch('ui/src/assets/styles/**', ['app:css']);
            // gulp.watch('ui/src/*.tpl.html', ['app:html']);
            // gulp.watch('config*.json', ['app:html']);
            // gulp.watch('bower.json', ['app:html']);
            // gulp.watch('.jshintrc', ['app:lintjs']);
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

function taskBuildNoWatch () {
    return doForEachApp((appName) => {
        var app = new Application({
            name: appName,
            baseCfg: baseConfig,
            ver: buildVersion,
            env: env
        });
        return app.t_buildNoWatch();
    });
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
gulp.task('build-only', taskBuildNoWatch());
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


