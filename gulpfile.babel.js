'use strict';

import gulp from 'gulp';
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
import gulpLoadPlugins from 'gulp-load-plugins';
const $ = gulpLoadPlugins();
// Delete stuff
import del from 'del';
// Used to run shell commands
import shell from 'shelljs';
// BrowserSync is used to live-reload your website
import browserSync from 'browser-sync';
const reload = browserSync.reload;
// Enable ES6
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
// AutoPrefixer
import autoprefixer from 'autoprefixer';
// Yargs for command line arguments
import {argv} from 'yargs';
import {stream as wiredep} from 'wiredep';

import replace from 'gulp-replace-path';
import path from 'path';

// 'gulp clean:assets' -- deletes all assets except for images
// 'gulp clean:images' -- deletes your images
// 'gulp clean:dist' -- erases the dist folder
// 'gulp clean:gzip' -- erases all the gzipped files
// 'gulp clean:metadata' -- deletes the metadata file for Jekyll
gulp.task('clean:assets', () => {
  return del(['.tmp/**/*', '!.tmp/assets', '!.tmp/assets/images', '!.tmp/assets/images/**/*', 'dist/assets', 'dist/bower_components']);
});
gulp.task('clean:images', () => {
  return del(['.tmp/assets/images', 'dist/assets/images']);
});
gulp.task('clean:dist', () => {
  return del(['dist/']);
});
gulp.task('clean:dist-local', () => {
  return del(['dist-local/**/*.*']);
});
gulp.task('clean:gzip', () => {
  return del(['dist/**/*.gz']);
});
gulp.task('clean:metadata', () => {
  return del(['src/.jekyll-metadata']);
});

// 'gulp jekyll' -- builds your site with development settings
// 'gulp jekyll --prod' -- builds your site with production settings
gulp.task('jekyll', done => {
  if (!argv.prod) {
    shell.exec('bundle exec jekyll build');
    done();
  } else if (argv.prod) {
    shell.exec('bundle exec jekyll build --config _config.yml,_config.build.yml');
    done();
  }
  reload()
});

// 'gulp doctor' -- literally just runs jekyll doctor
gulp.task('jekyll:doctor', done => {
  shell.exec('bundle exec jekyll doctor');
  done();
});

// 'gulp styles' -- creates a CSS file from your SASS, adds prefixes and
// creates a Sourcemap
// 'gulp styles --prod' -- creates a CSS file from your SASS, adds prefixes and
// then minifies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('styles', () =>
  gulp.src('src/assets/scss/main.scss')
    .pipe($.if(!argv.prod, $.sourcemaps.init()))
    .pipe($.sass({
      precision: 10,
      includePaths: ['.', 'bower_components/bootstrap-sass/assets/stylesheets/']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: 'last 5 version'})
    ]))
    .pipe($.size({
      title: 'styles',
      showFiles: true
    }))
    .pipe($.if(argv.prod, $.rename({suffix: '.min'})))
    .pipe($.if(argv.prod, $.if('*.css', $.cssnano())))
    .pipe($.if(argv.prod, $.size({
      title: 'minified styles',
      showFiles: true
    })))
    .pipe($.if(argv.prod, $.rev()))
    .pipe($.if(!argv.prod, $.sourcemaps.write()))
    .pipe($.if(argv.prod, gulp.dest('.tmp/assets/stylesheets')))
    .pipe($.if(argv.prod, $.if('*.css', $.gzip({append: true}))))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped styles',
      gzip: true,
      showFiles: true
    })))
    .pipe(gulp.dest('.tmp/assets/stylesheets'))
    .pipe($.if(!argv.prod, browserSync.stream()))
);

// 'gulp scripts' -- creates a index.js file from your JavaScript files and
// creates a Sourcemap for it
// 'gulp scripts --prod' -- creates a index.js file from your JavaScript files,
// minifies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('scripts', () =>
  // NOTE: The order here is important since it's concatenated in order from
  // top to bottom, so you want vendor scripts etc on top
  gulp.src([
    'src/assets/javascript/main.js'
  ])
    .pipe($.newer('.tmp/assets/javascript/index.js', {dest: '.tmp/assets/javascript', ext: '.js'}))
    .pipe($.if(!argv.prod, $.sourcemaps.init()))
    .pipe($.concat('index.js'))
    .pipe($.size({
      title: 'scripts',
      showFiles: true
    }))
    .pipe($.if(argv.prod, $.rename({suffix: '.min'})))
    .pipe($.if(argv.prod, $.if('*.js', $.uglify({preserveComments: 'some'}))))
    .pipe($.if(argv.prod, $.size({
      title: 'minified scripts',
      showFiles: true
    })))
    .pipe($.if(argv.prod, $.rev()))
    .pipe($.if(!argv.prod, $.sourcemaps.write('.')))
    .pipe($.if(argv.prod, gulp.dest('.tmp/assets/javascript')))
    .pipe($.if(argv.prod, $.if('*.js', $.gzip({append: true}))))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped scripts',
      gzip: true,
      showFiles: true
    })))
    .pipe(gulp.dest('.tmp/assets/javascript'))
    .pipe($.if(!argv.prod, browserSync.stream()))
);

var notifier = require('node-notifier');
// Standard handler
var standardHandler = function (err) {
  // Notification
  // var notifier = new notification();
  notifier.notify({ message: 'Error: ' + err.message });
  // Log to console
  $.util.log($.util.colors.red('Error'), err.message);
}

// Es6 browserify and babel
// enable module system
gulp.task('es6', () =>

  browserify({
    entries: 'src/assets/javascript/es6/main.js',
      debug: true
    })
    .transform(babelify)
    .on('error', standardHandler)
    .bundle()
    .on('error', standardHandler)
    .pipe(source('main.js'))
    .pipe(gulp.dest('src/assets/javascript/'))
);

// 'gulp inject:head' -- injects our style.css file into the head of our HTML
gulp.task('inject:head', () =>
  gulp.src('src/_includes/head.html')
    .pipe($.inject(gulp.src('.tmp/assets/stylesheets/*.css',
                            {read: false}), {ignorePath: '.tmp'}))
    .pipe(gulp.dest('src/_includes'))
);

// 'gulp inject:footer' -- injects our index.js file into the end of our HTML
gulp.task('inject:footer', () =>
  gulp.src('src/_includes/scripts.html')
    .pipe($.inject(gulp.src('.tmp/assets/javascript/*.js',
                            {read: false}), {ignorePath: '.tmp'}))
    .pipe(gulp.dest('src/_includes'))
);

// Combine svg files and inject it into pages
gulp.task('svg', () => {
    var svgs = gulp
        .src('src/assets/images/svg/*.svg')
        .pipe($.svgmin())
        .pipe($.svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src('src/_includes/svgs.html')
        .pipe($.inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('src/_includes'));
});

// 'gulp images' -- optimizes and caches your images
gulp.task('images', () =>
  gulp.src('src/assets/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('.tmp/assets/images'))
    .pipe($.size({title: 'images'}))
);

// 'gulp fonts' -- copies your fonts to the temporary assets folder
gulp.task('fonts', () =>
  gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('.tmp/assets/fonts'))
    .pipe($.size({title: 'fonts'}))
);

// 'gulp html' -- does nothing
// 'gulp html --prod' -- minifies and gzips our HTML files
gulp.task('html', () =>
  gulp.src('dist/**/*.html')
    .pipe($.if(argv.prod, $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true
    })))
    .pipe($.if(argv.prod, $.size({title: 'optimized HTML'})))
    .pipe($.if(argv.prod, gulp.dest('dist')))
    .pipe($.if(argv.prod, $.gzip({append: true})))
    .pipe($.if(argv.prod, $.size({
      title: 'gzipped HTML',
      gzip: true
    })))
    .pipe($.if(argv.prod, gulp.dest('dist')))
);

// 'gulp lint' -- check your JS for formatting errors using XO Space
gulp.task('lint', () =>
  gulp.src([
    'gulpfile.babel.js',
    '.tmp/assets/javascript/*.js',
    '!.tmp/assets/javascript/*.min.js'
  ])
  .pipe($.eslint())
  .pipe($.eslint.formatEach())
  .pipe($.eslint.failOnError())
);

// 'gulp serve' -- open up your website in your browser and watch for changes
// in all your files and update them when needed
gulp.task('serve', () => {
  browserSync({
    // tunnel: true,
    // open: false,
    server: {
      baseDir: ['.tmp', 'dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // Watch various files for changes and do the needful
  gulp.watch(['src/**/*.md', 'src/**/*.html', 'src/**/*.yml'], gulp.series('jekyll'));
  gulp.watch(['src/**/*.xml', 'src/**/*.txt'], gulp.series('jekyll'));
  gulp.watch('src/assets/javascript/es6/**/*.js', gulp.series('es6', 'scripts'));
  gulp.watch('src/assets/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('src/assets/images/svg/*.svg', gulp.series('svg'));
  gulp.watch('src/assets/images/**/*', gulp.series('images', reload));
  gulp.watch('bower.json', gulp.series('wiredep', 'fonts'));
});

// inject bower components
gulp.task('wiredep', () =>
  gulp.src('src/assets/scss/**/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('src/assets/scss')),

  gulp.src('src/_includes/head.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('src/_includes')),

  gulp.src('src/_includes/scripts.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('src/_includes'))
);

// 'gulp assets' -- cleans out your assets and rebuilds them
// 'gulp assets --prod' -- cleans out your assets and rebuilds them with
// production settings
gulp.task('assets', gulp.series(
  gulp.series('clean:assets'),
  gulp.series('es6'),
  gulp.parallel('styles', 'scripts', 'fonts', 'images', 'svg')
));

// 'gulp assets:copy' -- copies the assets into the dist folder, needs to be
// done this way because Jekyll overwrites the whole folder otherwise
gulp.task('assets:copy', () =>
  gulp.src('.tmp/assets/**/*')
    .pipe(gulp.dest('dist/assets'))
);

// 'gulp' -- cleans your assets and gzipped files, creates your assets and
// injects them into the templates, then builds your site, copied the assets
// into their directory and serves the site
// 'gulp --prod' -- same as above but with production settings
gulp.task('default', gulp.series(
  gulp.series('clean:assets', 'clean:gzip'),
  gulp.series('assets', 'inject:head', 'inject:footer'),
  gulp.series('jekyll', 'assets:copy', 'html'),
  gulp.series('serve')
));

// Copy Bower Files
gulp.task('bower:copy', () =>
  gulp.src('bower_components/**/*')
  .pipe(gulp.dest('.tmp/bower_components'))
  .pipe(gulp.dest('dist/bower_components'))
);

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
gulp.task('build', gulp.series(
  gulp.series('clean:assets', 'clean:gzip'),
  gulp.series('assets', 'inject:head', 'inject:footer'),
  gulp.series('jekyll', 'bower:copy', 'assets:copy', 'html')
));

//Prepare assets for the local build, we currently have an issue with one of the folders
gulp.task('build-local-prepare', () =>

  gulp.src('bower_components/**/*')
  .pipe(gulp.dest('dist-local/bower_components')),

  gulp.src('.tmp/assets/images/**/*')
    .pipe(gulp.dest('dist-local/assets/images/')),

  gulp.src(['.tmp/assets/javascript/**/*'])
  .pipe(replace('/bower_components', 'bower_components'))
  .pipe(replace('/assets', 'assets'))
  .pipe(gulp.dest('dist-local/assets/javascript/')),

  gulp.src(['.tmp/assets/stylesheets/**/*'])
  .pipe(replace('/bower_components', 'bower_components'))
  .pipe(replace('/assets', 'assets'))
  .pipe(gulp.dest('dist-local/assets/stylesheets/')),

  gulp.src(['dist/pages/**/*'])
    .pipe(replace('/bower_components', 'bower_components'))
    .pipe(replace('/assets', 'assets'))
    .pipe(gulp.dest('dist-local/'))
);


// 'gulp clean' -- erases your assets and gzipped files
gulp.task('clean', gulp.series('clean:assets', 'clean:images', 'clean:gzip'));

// 'gulp rebuild' -- WARNING: Erases your assets and built site, use only when
// you need to do a complete rebuild
gulp.task('rebuild', gulp.series('clean:dist', 'clean:assets',
'clean:images', 'clean:metadata'));

// 'gulp check' -- checks your Jekyll configuration for errors and lint your JS
gulp.task('check', gulp.series('jekyll:doctor', 'lint'));
