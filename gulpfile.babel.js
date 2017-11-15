import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
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
  appDir: './',
  devImages: 'images/rawimages/*.{jpg,jpeg,png,svg}',
  appImages: 'images/',
  devVendors: ['javascripts/vendor/jquery/jquery.min.js', 'javascripts/vendor/bootstrap/popper.min.js', 'javascripts/vendor/bootstrap/bootstrap.min.js'],
  devScripts: 'javascripts/app.js',
  appScripts: 'javascripts/',
  devStyles: 'stylesheets/scss/**/*.scss',
  appStyles: 'stylesheets/css/',
  devHtml: 'templates/**/*.twig',
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
  return gulp.src(paths.devStyles)
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
    .pipe(gulp.dest(paths.appStyles));
}


// Javascript Task
export function scripts() {
  return gulp.src(paths.devScripts, {
      sourcemaps: true
    })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(paths.appScripts));
}

export function vendors() {
  return gulp.src(paths.devVendors)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest(paths.appScripts));
}


// Compress Images Task
export function images() {
  return gulp.src(paths.devImages, {
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
    .pipe(gulp.dest(paths.appImages));
}


// Templates to HTML Task
export function html() {
  return gulp.src(paths.devHtml)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(twig())
    .pipe(gulp.dest(paths.appDir));
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
      baseDir: paths.appDir
    },
    open: false,
    notify: false
  });
  done();
}


// Watch Task
function watch() {
  gulp.watch(paths.devHtml, gulp.series(html, reload));
  gulp.watch(paths.devScripts, gulp.series(scripts, reload));
  gulp.watch(paths.devStyles, gulp.series(styles, reload));
  gulp.watch(paths.devImages, gulp.series(images, reload));
}


const dev = gulp.series(html, scripts, styles, images, vendors, serve, watch);
gulp.task('serve', dev);

export default dev;
