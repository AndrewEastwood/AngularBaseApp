var gulp = require('gulp');
var less = require('gulp-less');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var del = require('del');

var paths = {
  styles: {
    src: 'src/styles/**/*.less',
    dest: 'assets/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'assets/scripts/'
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del([ 'assets' ]);
}

/*
 * Define our tasks using plain functions
 */

class App {
     styles() {
      return gulp.src(paths.styles.src)
        .pipe(less())
        .pipe(cleanCSS())
        // pass in options to the stream
        .pipe(rename({
          basename: 'main',
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest));
    }

     scripts() {
      return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
    }

     watch() {
      gulp.watch(paths.scripts.src, scripts);
      gulp.watch(paths.styles.src, styles);
    }

    build () {
        // gulp.task('styles', this.styles);
        // gulp.task('scripts', this.scripts);
        // return gulp.series(['styles', 'scripts'])();
        return {
            parallel: [this.styles, this.scripts],
            series: []
        };
    }
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
// exports.clean = clean;
// exports.styles = styles;
// exports.scripts = scripts;
// exports.watch = watch;
var appOne = new App();
/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
 var appTasks = appOne.build();
var tasks = [clean, ...appTasks.series, gulp.parallel(...appTasks.parallel)];

console.log(tasks);

var build = gulp.series(...tasks);

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);