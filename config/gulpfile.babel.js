import gulp from 'gulp';
import runSequence from 'run-sequence';
import path from 'path';
import del from 'del';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import rename from 'gulp-rename';
import uglifyJS from 'gulp-uglify';
import uglifyCSS from 'gulp-clean-css';

// code transplantation with browser support
import es from 'event-stream';
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';

const rootPath = path.join(__dirname, '..');
const srcPath = path.join(rootPath, 'src');
const distPath = path.join(rootPath, 'dist');

gulp.task('build', () => (
  runSequence('dist:clean', 'dist:script', 'dist:styles', 'uglify:script', 'uglify:styles')
));

gulp.task('dist:clean', () => (
  del(distPath, { force: true })
));

gulp.task('dist:script', () => (
  es.merge([
    gulp.src(path.join(srcPath, 'react-leaflet-markercluster.js'))
      .pipe(babel({ presets: ['es2015', 'react'] }))
      .pipe(gulp.dest(distPath)),
    browserify(path.join(srcPath, 'react-leaflet-markercluster.js'), { debug: true })
      .transform(babelify, { presets: ['es2015', 'react'] })
      .bundle()
      .pipe(source('react-leaflet-markercluster.browser.js'))
      .pipe(gulp.dest(distPath)),
  ])
));

gulp.task('dist:styles', () => (
  gulp.src(path.join(srcPath, 'styles.scss'))
    .pipe(sass({ includePaths: [rootPath] }).on('error', sass.logError))
    .pipe(gulp.dest(distPath))
));

gulp.task('uglify:script', () => (
  gulp.src([
    path.join(distPath, 'react-leaflet-markercluster.js'),
    path.join(distPath, 'react-leaflet-markercluster.browser.js'),
  ])
    .pipe(uglifyJS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath))
));

gulp.task('uglify:styles', () => (
  gulp.src(path.join(distPath, 'styles.css'))
    .pipe(uglifyCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath))
));

gulp.task('gh-pages:clean', () => (
  del([path.join(rootPath, 'index.html'), distPath], { force: true })
));
