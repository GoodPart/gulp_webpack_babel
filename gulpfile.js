const { src, dest, watch, series, parallel } = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const _if = require('gulp-if');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const fileInclude = require('gulp-file-include');
const webpack = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const gulpMode = require('gulp-mode');
const mode = require('gulp-mode')();
const spritesmith = require('gulp.spritesmith');
const browserSync = require('browser-sync').create();

const paths = {
  dest: {
    root: 'dist/',
    //dest Root
  },
  src: {
    root: 'src/',
    // css: 'src/assets/css/index.less',
    css: {
      watch: 'src/**/*.less',
      build: ['src/**/*.less', '!src/components/**/*', '!**/_*/*', '!**/_*.*'],
    },
    markup: ['src/**/*.html', '!src/components/**/*'],
  },
};

//clean
const clean = () => {
  return del(['dist']);
};

const cleanImages = () => {
  return del(['dist/assets/images']);
};

const cleanFonts = () => {
  return del(['dist/assets/fonts']);
};

//css
const css = () => {
  //   return src('src/assets/css/index.less')
  return (
    src(paths.src.css.build)
      .pipe(mode.development(sourcemaps.init()))
      .pipe(less())
      .pipe(autoprefixer())
      // .pipe(rename('app.css'))
      //   .pipe(mode.production(csso()))
      .pipe(mode.development(sourcemaps.write()))
      .pipe(dest(paths.dest.root))
      .pipe(mode.development(browserSync.stream()))
  );
};

//js
const js = () => {
  return src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(
      webpack({
        mode: 'development',
        devtool: 'inline-source-map',
      })
    )
    .pipe(mode.development(sourcemaps.init({ loadMaps: true })))
    .pipe(rename('index.js'))
    .pipe(mode.production(terser({ output: { comments: false } })))
    .pipe(mode.development(sourcemaps.write()))
    .pipe(dest('dist/assets/js/'))
    .pipe(mode.development(browserSync.stream()));
};
//copy
const copyImages = () => {
  return src('src/assets/images/**/*.{jpg,jpeg,png,gif,svg}').pipe(dest('dist/assets/images'));
};

const copyFonts = () => {
  return src('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}').pipe(dest('dist/assets/fonts'));
};

//spritesmith
// const sprites = () => {
//   return src('src/assets/images/sprites/**/*.png')
//     .pipe(
//       spritesmith({
//         imgName: 'sprite.png',
//         cssName: 'sprite.css',
//         padding: 5,
//       })
//     )
//     .pipe(_if('*.css', dest('src/assets/css/base')))
//     .pipe(_if('*.css', dest('dist/assets/css/base')));
//   // .pipe(dest('dist/assets/images/sprites'))
//   // .pipe(dest('src/assets/images/sprites'));
// };

//markup
const markup = () => {
  return src(paths.src.markup)
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(dest(paths.dest.root))
    .pipe(mode.development(browserSync.stream()));
};

//watch
const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: 'dist/',
    },
  });

  watch('src/**/*.html', markup);
  watch(paths.src.css.watch, css);
  watch('src/**/*.js', js);
  //   watch('src/assets/images/sprites/**/*.png', sprites);
  watch('**/*.html').on('change', browserSync.reload);
  watch('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
  watch('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}', series(cleanFonts, copyFonts));
};

//publick
exports.default = series(clean, js, parallel(markup, css, copyImages, copyFonts), watchForChanges);
exports.build = series(clean, js, parallel(markup, css, copyImages, copyFonts));
