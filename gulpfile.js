
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

gulp.task('vendorJs', function () {
  return gulp.src([
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
  ])
  .pipe($.concat('vendor.js'))
  .pipe(gulp.dest('./public/javascripts'))
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
  gulp.src(['./source/**/**', '!source/scss/**/**'])
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
  gulp.watch(['./source/scss/**/*.sass', './source/scss/**/*.scss'], ['sass']);
  gulp.watch(['./source/**/**', '!/source/scss/**/**'], ['copy']);
});

gulp.task('deploy', function () {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

gulp.task('sequence', gulpSequence('clean', 'copy', 'sass', 'vendorJs', 'sass'));

gulp.task('default', ['copy', 'sass', 'vendorJs', 'browserSync', 'watch']);
gulp.task('build', ['sequence'])
