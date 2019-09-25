var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify-es').default,
    rename = require('gulp-rename'),
    clone = require('gulp-clone'),
    concat = require('gulp-concat'),
    include = require("gulp-include"),
    livereload = require('gulp-livereload');

gulp.task('sass', function () {
    return gulp.src('src/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dist/static/css'))
        .pipe(clone())
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/static/css'))
        .pipe(livereload());
});
gulp.task('html', function () {
    return gulp.src('src/**/*.html').pipe(livereload());
});
gulp.task('js', function() {
    return gulp.src('src/js/scripts.js')
        .pipe(include())
        .on('error', console.log)
        .pipe(gulp.dest('dist/static/js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/static/js'))
        .pipe(livereload());
});

gulp.task('default', function () {
    livereload.listen();
    gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('src/**/*.html', gulp.series('html'));
    gulp.watch('src/js/**/*.js', gulp.series('js'));
});
