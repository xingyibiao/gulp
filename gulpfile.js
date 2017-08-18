/*
* @Author: xingyibiao
* @Date:   2017-06-09 11:15:41
* @Last Modified by:   xingyibiao
* @Last Modified time: 2017-08-18 08:55:33
*/
var browserSync = require('browser-sync').create(),
    gulp = require('gulp'),
    proxy = require('http-proxy-middleware'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    notify = require('gulp-notify');

const APIURL = 'http://192.168.120.200';
const ISPROXY = true;
const sourceBaseDir = 'src/salesActivity/';

gulp.task('sass', function() {
    return gulp.src(sourceBaseDir + 'scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sourceBaseDir + 'css'))
        .pipe(notify({ message: 'Styles task complete' }))
        .pipe(browserSync.stream());
});
gulp.task('server', function() {
    const aipProxy = proxy('/hyzx', {
        target: APIURL,
        changeOrigin: true,
        ws: true
    });

    if (!ISPROXY) {
        browserSync.init({
            // files:'**',
            server: {
                baseDir: 'src'
            }
        });
    }else {
        browserSync.init({
            server: {
                baseDir: 'src',
                middleware: [aipProxy]
            }
        });
    }
});

gulp.task('js', function () {
    return gulp.src(sourceBaseDir + 'js/*.js')
        //.pipe(concat('main.js'))
        //.pipe(gulp.dest('dist/js/'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(sourceBaseDir + 'minjs/'))
        //.pipe(uglify())
        //.pipe(gulp.dest('dist/js'))
        //.pipe(browserSync.stream());;
        .pipe(browserSync.stream());
});

gulp.task('imagemin',function(){
    gulp.src([sourceBaseDir + '**/*.jpg',sourceBaseDir + '**/*.png'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/image'))
})
gulp.task('dev',['sass','server'],function(){
    gulp.watch(sourceBaseDir + '*.html',browserSync.reload)
    gulp.watch(sourceBaseDir + "scss/*.scss",['sass'])
    gulp.watch(sourceBaseDir + 'js/*.js',browserSync.reload)
})