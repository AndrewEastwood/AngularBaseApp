'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import plumber from 'gulp-plumber';
import inject from 'gulp-inject';
import uglify from 'gulp-uglify';
import bowerFiles from 'main-bower-files';
import extend from 'node.extend';
import rename from "gulp-rename";
import yargs from "yargs";
import gulpFilter from 'gulp-filter';
import clean from 'gulp-clean';
import eslint from 'gulp-eslint';
import merge from 'merge-stream';
import templateCache from 'gulp-angular-templatecache';
import preprocess from 'gulp-preprocess';
import less from 'gulp-less';
import minifyHTML from 'gulp-minify-html';
import gutil from 'gulp-util';
import cleanCSS from 'gulp-clean-css';
import nop from 'gulp-nop';
import bower from 'gulp-bower';
import debug from 'gulp-debug';
import logger from 'gulp-logger';
import {protractor} from 'gulp-protractor';
import karma from 'gulp-karma-runner';
import istanbul from 'gulp-istanbul';

var
    // application's main config file
    baseConfig = require('./package.json').solution,
    env = (yargs.argv.env || 'debug').toLowerCase(),
    addWatchCmd = yargs.argv.watch === 'false' ? false : true,
    uglifySources = !/debug|dev/.test(env),
    buildVersion = (new Date()).getTime(),
    apps = baseConfig.apps || [];


if (yargs.argv.app) {
    apps = [yargs.argv.app];
}

gutil.log(yargs.argv);

gutil.log('Active apps: ', apps);

if (apps.length === 0) {
    throw "No applications present";
}

function innerlogger (...args) {
    gutil.log(args.join(' '));
}

function handleError(err) {
    innerlogger(err.toString());
    this.emit('end');
}

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
        constructor ({name: appName, baseCfg: baseConfig, ver: ver, env: env, done: done}) {
            
            privates.set(this, {
                name: appName,
                ver: ver,
                env: env,
                cfg: null,
                paths: null,
                urls: null,
                doneCb: done
            });

            this.applogger('initializing');

            var appConfigGeneral = require(this.getPathToFileInAppDir('config.json')),
                appConfigGeneralCurrEnv = appConfigGeneral[this.env],
                paths = {},
                urls = {},
                cfg = {};

            cfg = extend(true, baseConfig.common,
                appConfigGeneral.common || {}, appConfigGeneralCurrEnv);
            ;
            paths = {
                src: {
                    app: this.getPathToFileInAppDir(),
                    core: this.getPathToFileInAppDir(this.dirNames.core),
                    tests: this.getPathToFileInAppDir(this.dirNames.tests),
                    specs: this.combinePathDir(this.getPathToFileInAppDir(this.dirNames.tests), this.dirNames.specs),
                    specsE2E: this.combinePathDir(this.getPathToFileInAppDir(this.dirNames.tests), this.dirNames.e2e),
                    specsUnit: this.combinePathDir(this.getPathToFileInAppDir(this.dirNames.tests), this.dirNames.unit),
                    mocks: this.combinePathDir(this.getPathToFileInAppDir(this.dirNames.tests), this.dirNames.mocks),
                    rawmocks: this.combinePathDir(this.getPathToFileInAppDir(this.dirNames.tests), this.dirNames.rawmocks),
                    bowerJson: this.getPathToFileInAppDir('bower.json'),
                    api: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.api),
                    bricks: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.bricks),
                    components: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.components),
                    pages: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.pages),
                    libs: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.libs),
                    assets: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.assets),
                    assetsCss: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.assets, this.dirNames.css),
                    assetsStyles: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.assets, this.dirNames.styles),
                    vendors: this.combinePathDir(this.getPathToFileInAppDir, this.dirNames.vendors),
                    static: this.combinePathDir(this.getPathToFileInAppDir, this.staticDirName)
                },
                dist: {
                    app: this.getPathToFileInDistAppDir(),
                    core: this.getPathToFileInDistAppDir(this.dirNames.core),
                    tests: this.getPathToFileInDistAppDir(this.dirNames.tests),
                    specs: this.combinePathDir(this.getPathToFileInDistAppDir(this.dirNames.tests), this.dirNames.specs),
                    specsE2E: this.combinePathDir(this.getPathToFileInDistAppDir(this.dirNames.tests), this.dirNames.e2e),
                    specsUnit: this.combinePathDir(this.getPathToFileInDistAppDir(this.dirNames.tests), this.dirNames.unit),
                    mocks: this.combinePathDir(this.getPathToFileInDistAppDir(this.dirNames.tests), this.dirNames.mocks),
                    rawmocks: this.combinePathDir(this.getPathToFileInDistAppDir(this.dirNames.tests), this.dirNames.rawmocks),
                    bowerJson: this.getPathToFileInDistAppDir('bower.json'),
                    api: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.api),
                    bricks: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.bricks),
                    components: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.components),
                    pages: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.pages),
                    libs: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.libs),
                    assets: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.assets),
                    assetsCss: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.assets, this.dirNames.css),
                    assetsStyles: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.assets, this.dirNames.styles),
                    vendors: this.combinePathDir(this.getPathToFileInDistAppDir, this.dirNames.vendors),
                    static: this.combinePathDir(this.getPathToFileInDistAppDir, this.staticDirNameDist)
                }
            };
            paths.run = this.isDeloyment ? paths.dist : paths.src;
            privates.get(this).cfg = cfg;
            privates.get(this).paths = paths;

            urls = {
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
        get doneCb () { return privates.get(this).doneCb; }
        get staticUrl () { return this.urls.static; }
        get mainHtmlFiles () { return this.config.mainHtmlFiles; }
        get dirNames () {
            var dirNames = {
                specs: 'specs',
                mocks: 'mocks',
                rawmocks: 'rawmocks',
                e2e: 'e2e',
                unit: 'unit',
                tests: 'tests',
                core: 'core',
                api: 'api',
                bricks: 'bricks',
                components: 'components',
                pages: 'pages',
                libs: 'libs',
                assets: 'assets',
                vendors: 'vendors',
                styles: 'styles',
                css: 'css',
                less: 'less'
            };
            return dirNames;
        }
        get dirSrcAppJsNames () {
            var dirNames = {
                core: 'core',
                api: 'api',
                bricks: 'bricks',
                components: 'components',
                pages: 'pages'
            };
            return dirNames;
        }
        get injectables () {
            var config = this.config;
            config.urls = this.urls;
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
            return appvars;
        }
        testE2ESpecsJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.specsE2E, '*spec.js')
                ];
            return jsAppFiles;
        }
        testUnitSpecsJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.specsUnit, '*.js')
                ];
            return jsAppFiles;
        }
        testMocksJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.mocks, '*.js')
                ];
            return jsAppFiles;
        }
        testRawMocksJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.rawmocks, '*.js')
                ];
            return jsAppFiles;
        }
        coreJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.core, 'app.js'),
                    this.combinePath(wrkPh.core, '*.js')
                ];
            return jsAppFiles;
        }
        comJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.components, '*.js'),
                    this.combinePath(wrkPh.components, '**/*.js')
                ];
            return jsAppFiles;
        }
        brxJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.bricks, '*.js'),
                    this.combinePath(wrkPh.bricks, '**/*.js')
                ];
            return jsAppFiles;
        }
        apiJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.api, '*.js'),
                    this.combinePath(wrkPh.api, '**/*.js')
                ];
            return jsAppFiles;
        }
        pgsJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.pages, '*.js'),
                    this.combinePath(wrkPh.pages, '**/*.js')
                ];
            return jsAppFiles;
        }
        libJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    this.combinePath(wrkPh.libs, '*.js'),
                    this.combinePath(wrkPh.libs, '**/*.js')
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
        appJsAllFilesGlobsArray (k = 'run') {
            return [
                ...this.coreJsFilesGlobsArray(k),
                ...this.comJsFilesGlobsArray(k),
                ...this.brxJsFilesGlobsArray(k),
                ...this.apiJsFilesGlobsArray(k),
                ...this.pgsJsFilesGlobsArray(k),
                ...this.libJsFilesGlobsArray(k)
            ];
        }
        vendorsJsFilesGlobsArray (k = 'run') {
            var wrkPh = this.paths[k.toLowerCase().trim()],
                jsAppFiles = [
                    ...bowerFiles({
                        filter: /.*\.js$/,
                        paths: {
                            bowerJson: wrkPh.bowerJson,
                            bowerDirectory: wrkPh.vendors
                        }
                    })
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

        t_test () {
            var tasks = [
                // this.p_test_e2e.bind(this),
                gulp.series(...this.t_test_unit.bind(this)())
            ];
            return tasks;
        }

        t_build () {
            var tasks = this.t_buildNoWatch();
            if (this.isDeloyment || !addWatchCmd) {
                return tasks;
            }
            tasks.push(this.p_watch.bind(this));
            return tasks;
        }

        t_buildNoWatch () {
            if (this.isDeloyment) {
                return this.t_buildDist();
            }
            return [
                this.p_lintJs.bind(this),
                this.p_InstallBowerDeps.bind(this),
                ...this.t_genCss.bind(this)(),
                this.p_transformTemplate.bind(this)
            ];
        }

        t_buildDist () {
            return [
                this.p_lintJs.bind(this),
                ...this.t_test.bind(this)(),
                this.p_InstallBowerDeps.bind(this),
                this.p_clearDist.bind(this),
                this.p_copyFiles.bind(this),
                gulp.parallel([
                    gulp.series(...this.t_genCss.bind(this)()),
                    this.p_compressCoreJs.bind(this),
                    this.p_compressComJs.bind(this),
                    this.p_compressBrxJs.bind(this),
                    this.p_compressPgsJs.bind(this),
                    this.p_compressApiJs.bind(this),
                    this.p_compressVendorsJs.bind(this),
                    this.p_compressLibJs.bind(this),
                    this.p_compressHtml.bind(this)
                ]),
                this.p_transformTemplate.bind(this),
                ...this.t_createPackage.bind(this)()
            ];
        }

        t_genCss () {
            var canUglify = this.canUglify;
            var _cssRemoveDir = () => {
                return gulp.src(this.paths.run.assetsCss, {allowEmpty: true})
                    .pipe(clean())
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

        t_createPackage () {
            var that = this;
            var packaging = [];

            var move2static = () => {
                return gulp.src([
                        that.getPathToFileInDistAppDir('core.min.js'),
                        that.getPathToFileInDistAppDir('lib.min.js'),
                        that.getPathToFileInDistAppDir('vendors.min.js'),
                        that.getPathToFileInDistAppDir('**/*.html'),
                        '!' + that.getPathToFileInDistAppDir('*.html'),
                        that.combinePath(that.paths.run.assets, '**'),
                        that.combinePath(that.paths.run.vendors, '**/*.css'),
                        that.combinePath(that.paths.run.vendors, '**/*.min.js'),
                        that.combinePath(that.paths.run.vendors, '**/fonts/**'),
                        that.combinePath(that.paths.run.libs, '**/*.css'),
                        that.combinePath(that.paths.run.libs, '**/*.min.js'),
                        that.combinePath(that.paths.run.libs, '**/fonts/**'),
                    ], {base: that.combinePathDir('.', that.paths.run.app)})
                    .pipe(gulp.dest(that.paths.run.static))
            }

            var cleanInDist = () => {
                return gulp.src([
                        that.combinePathDir(that.paths.run.app, that.dirNames.api),
                        that.combinePathDir(that.paths.run.app, that.dirNames.tests),
                        that.combinePathDir(that.paths.run.app, that.dirNames.core),
                        that.combinePathDir(that.paths.run.app, that.dirNames.assets),
                        that.combinePathDir(that.paths.run.app, that.dirNames.bricks),
                        that.combinePathDir(that.paths.run.app, that.dirNames.components),
                        that.combinePathDir(that.paths.run.app, that.dirNames.libs),
                        that.combinePathDir(that.paths.run.app, that.dirNames.pages),
                        that.combinePathDir(that.paths.run.app, that.dirNames.vendors),
                        that.combinePath(that.paths.run.app, '*.tpl.html'),
                        that.combinePath(that.paths.run.app, '*.json'),
                        that.combinePath(that.paths.run.app, '*.js'),
                        that.combinePath(that.paths.run.app, '**/*.orig'),
                        that.combinePath(that.paths.run.static, '**/styles/**'),
                    ])
                    .pipe(clean());
            };

            return [move2static, cleanInDist];
        }

        t_test_unit () {
            var files = [
                ...this.testMocksJsFilesGlobsArray('src'),
                ...this.vendorsJsFilesGlobsArray('src'),
                ...this.testUnitSpecsJsFilesGlobsArray('src'),
                ...this.appJsAllFilesGlobsArray('src')
            ];

            var mocks = () => {
                return gulp.src(this.testRawMocksJsFilesGlobsArray('src'))
                    .pipe(preprocess({
                        context: this.injectables
                    }))
                    .pipe(gulp.dest(this.paths.src.mocks));
            };

            var preTest = () => {
                return gulp.src(this.appJsAllFilesGlobsArray('src'))
                    .pipe(debug())
                    .pipe(istanbul())
                    .pipe(istanbul.hookRequire());
            };

            var unit = () => {
                var filesToPreprocess = {};

                Object.keys(this.dirSrcAppJsNames).forEach((srcDirName) => {
                    filesToPreprocess[`**/${srcDirName}/**/*.js`] = ['coverage'];
                });

                // console.log(files);
                return gulp.src(files)
                    .pipe(karma.server({
                        singleRun: true,
                        frameworks: ['jasmine'],
                        browsers: ['Chrome'],
                        plugins: [
                            'karma-chrome-launcher',
                            'karma-jasmine',
                            'karma-mocha-reporter',
                            'karma-coverage'
                        ],

                        // test result reporter
                        reporters: ['progress', 'coverage'],
                        preprocessors: filesToPreprocess,
                        // junitReporter : {
                        //     outputFile: this.combinePath(this.paths.src.tests, 'out', 'unit.xml'),
                        //     suite: 'unit'
                        // },
                        // web server port
                        // port: 9876,
                        // enable / disable colors in the output (reporters and logs)
                        colors: true,
                        // enable / disable watching file and executing tests whenever any file changes
                        // autoWatch: true,
                        coverageReporter: {
                            type: 'text',
                            dir: null,//this.combinePathDir(this.paths.src.tests, 'coverage'),
                            file: null
                        },
                        // logLevel: 'DEBUG'
                        // Continuous Integration mode
                        // singleRun: false
                    }))
                    // .pipe(istanbul.writeReports())
                    // .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
            }

            var cleanMocks = () => {
                return gulp.src(this.paths.src.mocks, {allowEmpty: true, read: false})
                   .pipe(clean());
            }
            return [cleanMocks, mocks, unit];
        }
        //--------- FILE MODIFIERS

        p_InstallBowerDeps () {
            var fs = require('fs');
            if (!fs.existsSync(this.paths.src.bowerJson))
                return gulp.src('nothing', {allowEmpty: true}).pipe(nop());
            return bower({ cwd: this.paths.src.app, directory: getDirNameFromPath(this.paths.src.vendors) })
                .pipe(gulp.dest(this.paths.src.vendors));
        }

        p_clearDist () {
            return gulp.src(this.paths.dist.app, {allowEmpty: true})
                .pipe(clean())
        }

        p_copyFiles () {
            return gulp.src(this.combinePath(this.paths.src.app, '**'))
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

            var injectCoreScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'core.min.js')];
                } else {
                    jsAppFiles = that.coreJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'core'
                });
            }

            var injectComScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'com.min.js')];
                } else {
                    jsAppFiles = that.comJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'com'
                });
            }

            var injectBrxScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'brx.min.js')];
                } else {
                    jsAppFiles = that.brxJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'brx'
                });
            }

            var injectApiScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'api.min.js')];
                } else {
                    jsAppFiles = that.apiJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'api'
                });
            }

            var injectPgsScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'pgs.min.js')];
                } else {
                    jsAppFiles = that.pgsJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'pgs'
                });
            }

            var injectLibScripts = () => {
                var jsAppFiles = [];
                if (that.isDeloyment) {
                    jsAppFiles = [that.combinePath(that.paths.run.app, 'lib.min.js')];
                } else {
                    jsAppFiles = that.libJsFilesGlobsArray();
                }
                return inject(gulp.src(jsAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'libs'
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

            var injectStyles = () => {
                var cssAppFiles = that.combinePath(this.paths.run.assetsCss, '**/*.css');
                return inject(gulp.src(cssAppFiles, {read: false}), {
                    relative: true,
                    transform: transform,
                    name: 'styles'
                });
            }

            var html2compress = this.mainHtmlFiles.map((fName) => {
                return gulp.src(that.combinePath(that.paths.run.app, `${fName}.tpl.html`))
                    .pipe(preprocess({
                        context: this.injectables
                    }))
                    .pipe(injectCoreScripts())
                    .pipe(injectComScripts())
                    .pipe(injectBrxScripts())
                    .pipe(injectApiScripts())
                    .pipe(injectLibScripts())
                    .pipe(injectPgsScripts())
                    .pipe(injectVendors())
                    .pipe(injectStyles())
                    .pipe(rename(`${fName}.html`))
                    .pipe(gulp.dest(that.paths.run.app));
            });

            return merge(...html2compress);
        }

        p_compressCoreJs () {
            return gulp.src(this.coreJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('core.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressComJs () {
            return gulp.src(this.comJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('com.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressBrxJs () {
            return gulp.src(this.brxJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('brx.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressApiJs () {
            return gulp.src(this.apiJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('api.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressPgsJs () {
            return gulp.src(this.pgsJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('pgs.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.dist.app));
        }

        p_compressLibJs () {
            return gulp.src(this.libJsFilesGlobsArray())
                .pipe(babel())
                .pipe(concat('lib.min.js'))
                .pipe(this.canUglify ? uglify() : nop())
                .pipe(gulp.dest(this.paths.run.app));
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
                .pipe(gulp.dest(this.paths.run.app));
        }

        p_compressHtml () {
            if (!this.isDeloyment) {
                return false;
            }
            return gulp.src(this.appHtmlFilesGlobsArray(),
                    {base: this.combinePathDir('.', this.name)})

                .pipe(preprocess({
                    context: this.injectables
                }))
                .pipe(this.canUglify ? minifyHTML() : nop())
                .pipe(gulp.dest(DIST_ROOT));
        }

        p_lintJs () {
            return gulp.src(this.coreJsFilesGlobsArray('src'))
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
            gulp.watch(this.coreJsFilesGlobsArray(), this.p_lintJs.bind(this));
            gulp.watch(this.combinePath(this.paths.run.assetsStyles, '**'), gulp.series(...this.t_genCss.bind(this)()));
            gulp.watch(this.combinePath(this.paths.run.app, '*.tpl.html'), this.p_transformTemplate.bind(this));
        }

        p_test_e2e () {
            var that = this;
            return gulp.src(this.testE2ESpecsJsFilesGlobsArray('src'))
                .pipe(protractor({
                    configFile: that.combinePath(that.paths.src.tests, 'protractor.js'),
                    args: [
                        '--basekrl', 'http://127.0.0.1:8000'
                    ]
                }));
        }

    }

    return _Application;
})();

function doForEachApp(cb) {
    return {
        run (done) {
            var series = [];
            apps.forEach((appName) => {
                var app = new Application({
                    name: appName,
                    baseCfg: baseConfig,
                    ver: buildVersion,
                    env: env
                });
                var tasks = app[cb]();
                series.push(...tasks);
            });
            return gulp.series(...series);
        }
    }
}

gulp.task('default', doForEachApp('t_build').run());
gulp.task('build', doForEachApp('t_build').run());
gulp.task('test', doForEachApp('t_test').run());