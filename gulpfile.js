const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const clean = require('gulp-clean');
const gutil = require('gulp-util');

var {
  task,
  src,
  dest,
  watch,
  series,
  parallel
} = require('gulp');
  
// File path
const path = {
  html: {
    src: ['./src/**/*.html'],
    dest: './dist/',
  },
  assets: {
    src: ['./src/assets/**/*'],
    dest: './dist/assets/',
  },
  images: {
    src: ['./src/assets/images/**/*'],
    dest: './dist/assets/images/',
  },
  styles: {
    src: ['./src/scss/*.scss'],
    dest: './dist/css/',
  },
  scripts: {
    src: ['./src/scripts/*.js'],
    dest: './dist/scripts/',
  },
  cache: {
    src: ['./dist/**/*.html'],
    dest: './dist/',
  },
};

// Logs Messages
var messages = {
  logProcessFilesError: (processName) => {
    gutil.log(
      'running task',
      gutil.colors.white('-'),
      gutil.colors.red(processName)
    )
  },
  logProcessFiles: (processName) => {
    gutil.log(
      'running task',
      gutil.colors.white('-'),
      gutil.colors.cyan(processName)
    )
  },
  logWatchProcess: (processName) => {
    gutil.log(
      'Magic is running...',
      gutil.colors.white('-'),
      gutil.colors.green(processName)
    )
  }
}

// Copy All HTML files
task('copyhtml', () => {
  messages.logProcessFiles('copy:html')
  return src(path.html.src)
    .pipe(dest(path.html.dest));
});

// Copy Assets
task('copyassets', () => {
  messages.logProcessFiles('copy:assets')
  return src(path.assets.src)
    .pipe(dest(path.assets.dest))
});

// Minify JS
task('minifyjs', () => {
  messages.logProcessFiles('process:minifyjs')
  return src(path.scripts.src)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(path.scripts.dest));
});

// Compile SCSS
task('compilescss', () => {
  messages.logProcessFiles('process:scss')
  return src(path.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(path.styles.dest));
});

// CacheBust
task('cachebust', () => {
  messages.logProcessFiles('process:cachebust')
  return src(path.cache.src)
    .pipe(replace(/v=\d+/g, 'v=' + new Date().getTime()))
    .pipe(dest(path.cache.dest));
});


// Clean Dist Folder
task('clean', () => {
  messages.logProcessFiles('process:clean')
  return src('dist', { read: false, allowEmpty: true })
    .pipe(clean());
});

// BrowserSync
task('serve', () => {
  browserSync.init({
    server: {
        baseDir: './dist/'
    },
    port: 3000,
  });

  watch(path.assets.src, series('copyassets')).on('change', browserSync.reload);
  watch(path.styles.src, series('compilescss')).on('change', browserSync.reload);
  watch(path.scripts.src, series('minifyjs')).on('change', browserSync.reload);
  watch(path.html.src, series('copyhtml')).on('change', browserSync.reload);
});

// Build Task
task('build', series('clean', parallel('copyhtml', 'copyassets', 'compilescss', 'minifyjs'), 'cachebust'));


// Watch Task
task('watch', series(
  parallel('copyhtml', 'copyassets', 'compilescss', 'minifyjs'),
    'cachebust',
    'serve'
  )
);

// Default Task
task('default', series(
  parallel('copyhtml', 'copyassets', 'compilescss', 'minifyjs'),
    'cachebust',
    'serve'
  )
);
