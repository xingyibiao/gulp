/*
* @Author: xingyibiao
* @Date:   2017-06-09 11:15:41
* @Last Modified by:   xingyibiao
* @Last Modified time: 2017-06-12 13:23:42
*/
var browserSync = require('browser-sync').create(),
    gulp = require('gulp'),
    proxy = require('http-proxy-middleware'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    notify = require('gulp-notify');

const APIURL = 'http://192.168.120.92';
const ISPROXY = true;

gulp.task('sass', function() {
    return gulp.src('src/basicInformation/scss/*.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('src/basicInformation/css'))
        .pipe(notify({ message: 'Styles task complete' }))
        .pipe(browserSync.stream());
});
gulp.task('server',['sass'], function() {
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
    return gulp.src('src/js/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        //.pipe(uglify())
        //.pipe(gulp.dest('dist/js'))
        //.pipe(browserSync.stream());;
});

gulp.task('dev',['server'],function(){
    gulp.watch('src/**/*.html',browserSync.reload)
    gulp.watch("src/**/scss/*.scss", ['sass'])
    gulp.watch('src/**/js/*.js',browserSync.reload)
})