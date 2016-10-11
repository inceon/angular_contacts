const gulp = require('gulp');
const connect = require('gulp-connect');
const watch = require('gulp-watch');

gulp.task('connect', () => {
    connect.server({
        port: 8080,
        livereload: true,
        root: ''
    });
});

gulp.task('watch', () => {
    watch('./**/*.js', () => {
        console.log('js edit');
    })
        .pipe(connect.reload());

    watch('./**/*.html', () => {
        console.log('html edit');
    })
        .pipe(connect.reload());

    watch('./**/*.css', () => {
        console.log('css edit');
    })
        .pipe(connect.reload());
});

gulp.task('default', ['connect', 'watch']);