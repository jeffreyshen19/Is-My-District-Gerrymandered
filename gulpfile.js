var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');

gulp.task('default', ['sass', 'compressjs'], function() {
  gulp.watch('public/src/SCSS/*.scss', ['sass']);
  gulp.watch('public/src/JS/*.js', ['compressjs']);
});

gulp.task('sass', function () {
  return gulp.src('public/src/SCSS/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('public/dist/CSS'));
    /*.on("error", notify.onError(function (error) {
        return "Error: " + error.message;
    }));*/
});

gulp.task('compressjs', function() {
  gulp.src('public/src/JS/*.js')
    .pipe(minify({}))
    .pipe(gulp.dest('public/dist/JS'));
    /*.on("error", notify.onError(function (error) {
        return "Error: " + error.message;
    }));*/
});
