 var gulp = require('gulp'),
     browserSync = require('browser-sync').create();

//     notify = require('gulp-notify'),
//     plumber = require('gulp-plumber'),
//     less = require('gulp-less'),
//     livereload = require('gulp-livereload');
// gulp.task('Less', function() {
// 	gulp.src('less/**/*.less')
// 		.pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
// 		.pipe(less())
// 		.pipe(gulp.dest('public/static/css'));
// });
// gulp.task('watch', function() {
//   // Watch .scss files
//   gulp.watch('less/**/*.less', ['Less']);
//   // Create LiveReload server
//    livereload.listen();
//   // Watch any files in dist/, reload on change
//   gulp.watch(['public/**']).on('change', livereload.changed);
// });
// gulp.task('default', ['Less', 'watch']);
 gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "192.168.0.108"
    });
});
 gulp.task('default', ['browser-sync']);