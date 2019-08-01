
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const gulpSequence = require('gulp-sequence').use(gulp);

// production || development
// # gulp --env production
const envOptions = {
  string: 'env',
  default: { env: 'development' }
};
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

gulp.task('clean', () => {
  return gulp.src(['./public', './.tmp'], { read: false })
    .pipe($.clean());
});


gulp.task('jade', function () {
  // var YOUR_LOCALS = {};

  gulp.src('./source/**/*.jade')
      .pipe($.plumber()) // 出錯時不會停止，會繼續執行 Gulp
      // jade 編譯前取得資料
      .pipe($.data(function () {
          // 使用 require() 載入外部 .json 資料
          var imgURL = require('./source/data/imgURL.json');
          var linkList = require('./source/data/linkList.json');
          var personList = require('./source/data/personList.json');
          var bedList = require('./source/data/bedList.json');
          var servicesList = require('./source/data/servicesList.json');

          // 合併成物件
          var source = {
              'imgURL': imgURL,
              'linkList': linkList,
              'personList': personList,
              'bedList': bedList,
              "servicesList": servicesList
          }
          // console.log('jade', source); // 檢查是否有資料載入
          return source; // 要回傳物件
      }))
      .pipe($.jade({
          // locals: YOUR_LOCALS
          pretty: true, // 編譯完的 HTML 將會展開 (沒有壓縮的版本)
      }))
      .pipe(gulp.dest('./public/'))
      .pipe(browserSync.stream()); // 自動重新整理
});

gulp.task('vendorJs', function () {
  return gulp.src([
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
  ])
  .pipe($.concat('vendor.js'))
  .pipe(gulp.dest('./public/js'))
})

gulp.task('sass', function () {
  return gulp.src(['./source/scss/**/*.sass', './source/scss/**/*.scss'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({ 
      outputStyle: 'nested',
      includePaths: ['./node_modules/bootstrap/scss']
    })
    .on('error', $.sass.logError))
    .pipe($.postcss([autoprefixer()]))
    .pipe($.if(options.env === 'production', $.cleanCss()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/scss'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('copy', function () {
  gulp.src(['./source/**/**', '!source/**/*.jade', '!source/**/*.html', '!source/scss/**/**'])
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function () {
  browserSync.init({
    server: { baseDir: './public' },
    reloadDebounce: 2000
  })
});

gulp.task('watch', function () {
  gulp.watch(['./source/**/*.jade'], ['jade']);
  gulp.watch(['./source/scss/**/*.sass', './source/scss/**/*.scss'], ['sass']);
  gulp.watch(['./source/**/**', '!/source/scss/**/**'], ['copy']);
});

gulp.task('deploy', function () {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

gulp.task('sequence', gulpSequence('clean', 'copy', 'jade', 'sass', 'vendorJs', 'sass'));

gulp.task('default', ['copy', 'jade', 'sass', 'vendorJs', 'browserSync', 'watch']);
gulp.task('build', ['sequence'])
