/*
* @Author: xingyibiao
* @Date:   2017-06-09 11:15:41
 * @Last Modified by: xingyibiao
 * @Last Modified time: 2017-09-26 16:04:56
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
  eslint = require('gulp-eslint'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  spritesmith = require('gulp.spritesmith'),
  concat = require('gulp-concat'),
  del = require('del'),
  notify = require('gulp-notify'),
  rev = require('gulp-rev'),
  revCollector = require('gulp-rev-collector'),
  runSequence = require('run-sequence')

const APIURL = 'http://192.168.120.190:8080',
  ISPROXY = true,
  sourceBaseDir = 'src/productExchange/',
  entriesName = 'productExchange'

gulp.task('sass', function () {
  return gulp
    .src(sourceBaseDir + 'scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      autoprefixer(
        'last 2 version',
        'safari 5',
        'ie 8',
        'ie 9',
        'opera 12.1',
        'ios 6',
        'android 4'
      )
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(sourceBaseDir + 'css'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.stream())
})
gulp.task('server', function () {
  const aipProxy = proxy('/ProductDetail', {
      target: APIURL,
      changeOrigin: true,
      ws: true
    }),
    aipProxy2 = proxy('/ProducTotal', {
      target: APIURL,
      changeOrigin: true,
      ws: true
    })

  if (!ISPROXY) {
    browserSync.init({
      // files:'**',
      server: {
        baseDir: 'src'
      }
    })
  } else {
    browserSync.init({
      server: {
        baseDir: 'src',
        middleware: [aipProxy, aipProxy2]
      }
    })
  }
})

// eslint
gulp.task('lint', function () {
  return gulp
    .src(sourceBaseDir + 'js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('js', ['lint'], function () {
  return (gulp
    .src(sourceBaseDir + 'js/*.js')
    .pipe(
      browserify({
        insertGlobals: true,
        debug: true,
        shim: {
          jqPaginator: {
            path: './src/jqPaginator/dist/js/jqPaginator.min',
            exports: 'jqPaginator',
            depends: {
              jquery: 'jQuery'
            }
          },
          jedate: {
            path: './src/customerExchange/assets/jquery.jedate.min',
            exports: 'jeDate',
            depends: {
              jquery: 'jQuery'
            }
          }
        }
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(sourceBaseDir + 'minjs'))
    .pipe(browserSync.stream()))
})

// 生产环境 -> 编译并压缩scss
gulp.task('buildSass', function () {
  return gulp
    .src(sourceBaseDir + 'scss/*.scss')
    .pipe(sass())
    .pipe(
      autoprefixer(
        'last 2 version',
        'safari 5',
        'ie 8',
        'ie 9',
        'opera 12.1',
        'ios 6',
        'android 4'
      )
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(sourceBaseDir + 'dist/css'))
})

// 压缩Js
gulp.task('minjs', function () {
  return (gulp
    .src(sourceBaseDir + 'minjs/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(sourceBaseDir + 'dist/minjs/')))
})

// 压缩图片
gulp.task('imagemin', function () {
  gulp
    .src([sourceBaseDir + '**/*.jpg', sourceBaseDir + '**/*.png'])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/image'))
})

// 清空dist文件夹
gulp.task('clean', function () {
  del([sourceBaseDir + 'dist'])
})

// css md5
gulp.task('md5css', function () {
  return gulp.src(sourceBaseDir + 'dist/css/' + entriesName + '.min.css')
    .pipe(rev())
    .pipe(gulp.dest(sourceBaseDir + 'dist/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(sourceBaseDir + 'dist/css'))
})

// js md5
gulp.task('md5js', function () {
  return gulp.src(sourceBaseDir + 'dist/minjs/*.js')
    .pipe(rev())
    .pipe(gulp.dest(sourceBaseDir + 'dist/minjs'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(sourceBaseDir + 'dist/minjs'))
})

// html 替换css版本
gulp.task('revHtmlcss', function () {
  return gulp.src([sourceBaseDir + 'dist/css/*.json', sourceBaseDir + '*.html'])
    .pipe(gulp.dest(sourceBaseDir + 'dist'))
    .pipe(revCollector())
    .pipe(gulp.dest(sourceBaseDir + 'dist'))
})

// html 替换css版本
gulp.task('revHtmljs', function () {
  return gulp.src([sourceBaseDir + 'dist/minjs/*.json', sourceBaseDir + 'dist/*.html'])
    .pipe(revCollector())
    .pipe(gulp.dest(sourceBaseDir + 'dist'))
})

// sprite
gulp.task('sprite', function () {  
  gulp.src('src/sprite/img/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'css/sprite.css',
      padding: 5,
      algorithm: 'binary-tree'
    }))
    .pipe(gulp.dest('dist/sprite/'))
}) 

// 开发环境
gulp.task('dev', ['sass', 'server'], function () {
  gulp.watch(sourceBaseDir + '*.html', browserSync.reload)
  gulp.watch(sourceBaseDir + 'scss/*.scss', ['sass'])
  gulp.watch(sourceBaseDir + 'js/*.js', ['js'], browserSync.reload)
})

// 生产环境 -> 压缩打包
gulp.task('build', function (done) {
  runSequence(
    ['clean'],
    ['buildSass'],
    ['md5css'],
    ['revHtmlcss'],
    ['minjs'],
    ['md5js'],
    ['revHtmljs'],
    done)
  console.log('completa')
})
