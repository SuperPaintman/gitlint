'use strict';
/** Requires */
const fs            = require('fs');
const path          = require('path');

const gulp          = require('gulp');
const $             = require('gulp-load-plugins')();

const del           = require('del');
const yaml          = require('js-yaml');

/** Constants */
const jsPath = {
  from: [
    './src/**/*.js',
    '!./node_modules/**/*'
  ],
  watch: [
    './src/**/*.js',
    './bin/**/*.js',
    '!./node_modules/**/*',
    './gulpfile.js',
    './index.js'
  ],
  to: './lib/'
};

const babelOptions = JSON.parse(fs.readFileSync('./.babelrc').toString());

const eslintOptions = yaml.load(
  fs.readFileSync(path.join(__dirname, './.eslintrc.yml'))
);

/** Helps */
function onError(err) {
  $.util.log($.util.colors.red('Error'), err.toString());

  this.end();
}

/** Tasks */
gulp.task('build:js', () => {
  return gulp.src(jsPath.from)
    .pipe($.plumber({
      errorHandler: onError
    }))
    // Source map
    .pipe($.sourcemaps.init())
    .pipe($.babel(babelOptions))
    // End source map
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(jsPath.to));
});

gulp.task('clear', () => {
  return Promise.all([
    del(path.join(__dirname, jsPath.to, './**/*'))
  ]);
});

gulp.task('build', ['build:js']);

gulp.task('lint', () => {
  return gulp.src(jsPath.watch)
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.eslint(eslintOptions))
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

gulp.task('watch:js', () => {
  gulp.watch(jsPath.watch, ['build:js']);
});

gulp.task('watch:lint', () => {
  gulp.watch(jsPath.watch, ['lint']);
});

gulp.task('watch', ['watch:js']);

gulp.task('default', ['clear', 'build']);
