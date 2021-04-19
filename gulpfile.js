const
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    cssnano = require('cssnano'),
    autoprefixer = require('autoprefixer'),
    rename = require('gulp-rename'),
    nunjucks = require('gulp-nunjucks-render'),
    prettier = require('gulp-prettier'),
    typograf = require('gulp-typograf'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    svgstore = require('gulp-svgstore'),
    cheerio = require('gulp-cheerio'),
    imageResize = require('gulp-image-resize'),
    rollup = require('rollup-stream'),
    babel = require('gulp-babel'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    terser = require('gulp-terser'),
    replace = require('gulp-replace'),
    del = require('del'),
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

const stylesDev = () => {
    return gulp.src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.stream());
};
const stylesBuild = () => {
    return gulp.src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer(),
            cssnano()
        ]))
        .pipe(gulp.dest('dist/css/'));
};
exports.stylesDev = stylesDev;
exports.stylesBuild = stylesBuild;

const scriptsDev = () => {
    return gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.stream());
};
const scriptsBuild = () => {
    return rollup({
        input: 'src/js/index.js',
        format: 'iife',
    })
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe(babel({
            presets: ['@babel/preset-env'],
        }))
        .pipe(terser())
        .pipe(gulp.dest('dist/js/'));
};
exports.scriptsDev = scriptsDev;
exports.scriptsBuild = scriptsBuild;

const pagesDev = done => {
    gulp.src('src/njk/pages/**/*.njk')
        .pipe(nunjucks({
            path: ['src/njk/layouts']
        }))
        .pipe(gulp.dest('dist/'));
    done();
};
const pagesBuild = () => {
    return gulp.src('src/njk/pages/**/*.njk')
        .pipe(nunjucks({
            path: ['src/njk/layouts']
        }))
        .pipe(typograf({ locale: ['ru', 'en-US'], htmlEntity: { type: 'name' } }))
        .pipe(prettier({ proseWrap: 'never', printWidth: 800, tabWidth: 4, useTabs: true }))
        .pipe(gulp.dest('dist/'));
};
exports.pagesDev = pagesDev;
exports.pagesBuild = pagesBuild;

const copy = done => {
    gulp.src([
        'src/img/**/*.{jpg,png,svg}',
        'src/favicons/**/*.{jpg,png,svg}',
        'src/fonts/*.{woff2,woff}',
        'src/*.{xml,json}'
    ], {
        base: 'src'
    })
        .pipe(gulp.dest('dist'));
    done();
}
exports.copy = copy;

const paths = () => {
    return gulp.src('dist/**/*.html')
        .pipe(replace(
            /(<script) type="module"( src="\/js)\/index(.js">)/, '<script src="/js/scripts.js">'
        ))
        .pipe(gulp.dest('dist'));
};
exports.paths = paths;

const optimizeImgs = () => {
    return gulp.src('dist/**/*.{jpg,png,svg}')
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({
                plugins: [
                    {cleanupIDs: true}
                ]
            })
        ]))
        .pipe(gulp.dest('dist')); 
};
exports.optimizeImgs = optimizeImgs;

const createWebp = done => {
    gulp.src('src/img/**/*.{jpg,png}')
    .pipe(webp())
    .pipe(gulp.dest('dist/img')); 
    done();
};
exports.createWebp = createWebp;

const icons = () => {
    return gulp.src('src/img/ico/**/*.svg')
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    {
                        cleanupIDs: true
                    }, {
                        removeViewBox: false
                    }
                ]
            })
        ]))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').attr('fill', 'currentColor');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('dist/img'));
};
exports.icons = icons;

const clear = () => {
    return del('dist');
};
exports.clear = clear;

const serve = done => {
    browserSync.init({
        server: 'dist',
        routes: {},
        middleware: function (req, res, next) {
            if (/\.json|\.txt|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
                console.log('[POST => GET] : ' + req.url);
                req.method = 'GET';
            }
            next();
        }
    });
    done();
};
exports.serve = serve;

const reload = done => {
    browserSync.reload();
    done();
};

const watch = () => {
    gulp.watch('src/scss/**/*.scss', gulp.series(stylesDev));
    gulp.watch('src/js/**/*.js', gulp.series(scriptsDev));
    gulp.watch('src/njk/**/*.njk', gulp.series(pagesDev, reload));

    gulp.watch([
        'src/img/**/*.{jpg,png,svg}',
        'src/favicons/**/*.{jpg,png,svg}',
        'src/fonts/*.{woff2,woff}',
        'src/*.{xml,json}'
    ], gulp.series(copy));

    gulp.watch([
        'src/img/**/*.{jpg,png}'
    ], gulp.series(createWebp));
};

const build = gulp.series(
    clear,
    gulp.parallel(
        stylesBuild,
        scriptsBuild,
        pagesBuild,
        createWebp,
        copy
    ),
    paths,
    optimizeImgs,
    icons
);
exports.build = build;

const dev = gulp.series(
    clear,
    gulp.parallel(
        stylesDev,
        scriptsDev,
        pagesDev,
        createWebp,
        copy,
        icons
    ),
    serve,
    watch
);
exports.dev = dev;
exports.default = dev;
