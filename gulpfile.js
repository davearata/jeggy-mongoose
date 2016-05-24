var path = require('path')
var gulp = require('gulp')
var nsp = require('gulp-nsp')
var coveralls = require('gulp-coveralls')
var babel = require('gulp-babel')
var del = require('del')

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-register')

gulp.task('nsp', function (cb) {
  nsp({package: path.resolve('package.json')}, cb)
})

gulp.task('coveralls', ['test'], function () {
  if (!process.env.CI) {
    return
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls())
})

gulp.task('babel', ['clean'], function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
})

gulp.task('clean', function () {
  return del('dist')
})

gulp.task('prepublish', ['nsp', 'babel'])
gulp.task('default', ['test', 'coveralls'])
