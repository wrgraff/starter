const gulp = require('gulp'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    csso = require('gulp-csso'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    uglify = require('gulp-uglify-es').default,
    rename = require('gulp-rename'),
    nunjucks = require('gulp-nunjucks-render'),
    clone = require('gulp-clone'),
    prettier = require('gulp-prettier'),
    typograf = require('gulp-typograf'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    del = require('del'),
    imageResize = require('gulp-image-resize'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync').create();

const cutImg = () => {
    return gulp.src('src/img/name/*.jpg')
        .pipe(imageResize({
            width: 458 * 2,
            height: 300 * 2,
            crop : true
        }))
        .pipe(rename({ suffix: '-size' }))
        .pipe(gulp.dest('src/img/name/size/'));
};
exports.cutImg = cutImg;

const scss = () => {
    return gulp.src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.stream());
        // .pipe(csso())
        // .pipe(rename({ suffix: '.min' }))
        // .pipe(gulp.dest('dist/css/'))
};
exports.scss = scss;

const js = () => {
    return gulp.src('src/js/*.js')
        .pipe(babel())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.stream());
        // .pipe(uglify())
        // .pipe(rename({ suffix: '.min' }))
        // .pipe(gulp.dest('dist/static/js'))
};
exports.js = js;

const njk = () => {
    return gulp.src('src/njk/pages/**/*.njk')
        .pipe(nunjucks({
            path: ['src/njk/layouts']
        }))
        .pipe(typograf({ locale: ['ru', 'en-US'], htmlEntity: { type: 'name' } }))
        .pipe(prettier({ proseWrap: 'never', printWidth: 800, tabWidth: 4, useTabs: true }))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
};
exports.njk = njk;

const img = () => {
    return gulp.src('src/img/**/*.{jpg,png,svg}')
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({
                plugins: [
                    {cleanupIDs: true}
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'))
        .pipe(webp())
        .pipe(gulp.dest('dist/img')); 
};
exports.img = img;

const favicons = () => {
    return gulp.src('src/img/**/*.{jpg,png,svg}')
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({
                plugins: [
                    {cleanupIDs: true}
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'))
        .pipe(webp())
        .pipe(gulp.dest('dist/img')); 
};
exports.favicons = favicons;

const fonts = () => {
    return gulp.src('src/fonts/**/*{woff,woff2}')
        .pipe(gulp.dest('dist/fonts'));
};
exports.fonts = fonts;

const settings = () => {
    return gulp.src('src/**/*{xml,json}')
        .pipe(gulp.dest('dist/'));
};
exports.settings = settings;

const clear = () => {
    return del('dist');
};
exports.clear = clear;

const serve = () => {
    browserSync.init({
        server: "dist",
        routes: {},
        middleware: function (req, res, next) {
            if (/\.json|\.txt|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
                console.log('[POST => GET] : ' + req.url);
                req.method = 'GET';
            }
            next();
        }
    });

    gulp.watch('src/scss/**/*.scss', gulp.series('scss'));
    gulp.watch('src/js/*.js', gulp.series('js'));
    gulp.watch('src/njk/**/*.njk', gulp.series('njk'));
    gulp.watch('src/img/**/*{jpg,png,svg}', gulp.series('img'));

    gulp.watch('dist/**/*{jpg,png,svg}').on('change', browserSync.reload);
};
exports.serve = serve;
exports.default = serve;

const build = gulp.series(
    clear,
    gulp.parallel(
        scss,
        js,
        njk,
        fonts,
        img,
        favicons,
        settings
    ),
);
exports.build = build;

exports.start = gulp.series(
    build,
    serve
);
