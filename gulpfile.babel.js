import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import twig from 'gulp-twig';

const server = browserSync.create();

const paths = {
  distDir: './dist/',
  srcImages: 'src/images/*.{jpg,jpeg,png,svg}',
  distImages: 'dist/images/',
  srcVendors: ['node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'],
  distVendors: 'dist/javascripts/',
  srcScripts: 'src/javascripts/main.js',
  distScripts: 'dist/javascripts/',
  srcStyles: 'src/stylesheets/**/*.scss',
  distStyles: 'dist/stylesheets/css/',
  srcHtml: 'src/**/*.twig',
  distHtml: 'dist/'
};

const onError = (err) => {
  notify.onError({
    title: 'Innnteg',
    subtitle: 'Error!',
    message: '<%= error.message %>'
  })(err);
  this.emit('end');
};

// Styles Task
export function styles() {
  return gulp.src(paths.srcStyles)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['> 3%', 'last 3 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distStyles));
}

// Javascript Task
export function scripts() {
  return gulp.src(paths.srcScripts, {
    sourcemaps: true
  })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.distScripts));
}

export function vendors() {
  return gulp.src(paths.srcVendors)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(paths.distVendors));
}

// Compress Images Task
export function images() {
  return gulp.src(paths.srcImages, {
    since: gulp.lastRun(images)
  })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(gulp.dest(paths.distImages));
}

// Templates to HTML Task
export function html() {
  return gulp.src(paths.srcHtml)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(twig())
    .pipe(gulp.dest(paths.distHtml));
}

// BrowserSync Reload Task
function reload(done) {
  server.reload();
  done();
}

// BrowserSync Serve Task
function serve(done) {
  server.init({
    server: {
      baseDir: paths.distDir
    },
    open: false,
    notify: false
  });
  done();
}

// Watch Task
function watch() {
  gulp.watch(paths.srcHtml, gulp.series(html, reload));
  gulp.watch(paths.srcScripts, gulp.series(scripts, reload));
  gulp.watch(paths.srcStyles, gulp.series(styles, reload));
  gulp.watch(paths.srcImages, gulp.series(images, reload));
}

const dev = gulp.series(html, vendors, scripts, styles, images, serve, watch);
gulp.task('dev', dev);

export default dev;
