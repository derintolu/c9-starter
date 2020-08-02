// Defining requirements
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const rimraf = require("gulp-rimraf");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const autoprefixer = require("gulp-autoprefixer");
const webpack_stream = require("webpack-stream");
const webpack_config = require("./webpack.config.js");
const merge = require("merge-stream");

// Configuration file to keep your code DRY
const cfg = require("./buildconfig.json");
const paths = cfg.paths;

const scriptMain = paths.js + "/main.js";
const scriptDist = paths.dist + "/js";
const styleDist = paths.dist + "/css";

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task("watch", function () {
	// This happens once on running 'gulp watch'
	gulp.series("webpack-once", "styles", "scripts")(function (err) {
		if (err) {
			console.log(err);
		}
	});
	// These happen each time a watched file is saved
	gulp.watch(scriptMain, function () {
		gulp.series("webpack-watch", "scripts")(function (err) {
			if (err) {
				console.log(err);
			}
		});
	});
	gulp.watch(
		[paths.styles + "/**/*.scss", paths.client + "/*.scss"],
		gulp.series('styles')
	);
	// Inside the watch task.
	gulp.watch(paths.img + "/**", gulp.series('imagemin-watch'));
});

// Removes all files in the /dist directory. Runs at start of 'gulp watch'
gulp.task("dropdist", function () {
	return gulp
		.src(paths.dist + "/**/*", {
			read: false
		}) // Much faster
		.pipe(rimraf());
});

// Bundle Javascript modules once. Runs at start of 'gulp watch'
gulp.task("webpack-once", function () {
	webpack_config.watch = false;
	return gulp
		.src(scriptMain)
		.pipe(webpack_stream(webpack_config))
		.on("error", function handleError() {
			this.emit("end"); // Recover from errors
		})
		.pipe(gulp.dest(scriptDist));
});

// Bundle Javascript modules on source file save
gulp.task("webpack-watch", function () {
	return (
		gulp
		.src(scriptMain)
		.pipe(webpack_stream(webpack_config))
		// .pipe(gzip())
		.on("error", function handleError() {
			this.emit("end"); // Recover from errors
		})
		.pipe(gulp.dest(scriptDist))
	);
});

// Uglifies and concat all JS files into one
gulp.task("scripts", function () {
	var scripts = [
		paths.node + "/babel-polyfill/dist/polyfill.js",

		paths.node + "/bootstrap/dist/js/bootstrap.min.js",

		paths.node + "/magnific-popup/dist/jquery.magnific-popup.js",

		// main.bundle.js is generated by 'gulp webpack-once' and 'gulp webpack-watch'
		scriptDist + "/main.bundle.js"
	];
	return (
		gulp
		.src(scripts)
		.pipe(concat("theme.min.js"))
		.pipe(uglify())
		.on("error", function handleError() {
			this.emit("end"); // Recover from errors
		})
		.pipe(gulp.dest(scriptDist))
	);
	// gulp.src(scripts)
	// 	.pipe(concat("theme.min.js"))
	// 	.on("error", function handleError(err) {
	// 		console.log(err);
	// 		this.emit("end"); // Recover from errors
	// 	})
	// 	.pipe(uglify())
	// 	.on("error", function handleError(err) {
	// 		console.log(err);
	// 		this.emit("end"); // Recover from errors
	// 	})
	// 	.pipe(gulp.dest(scriptDist))
	// 	.on("error", function handleError(err) {
	// 		console.log(err);
	// 		this.emit("end"); // Recover from errors
	// 	});

});

// Run:
// gulp styles
// Runs gulp sass then gulp minify
gulp.task("styles", function (callback) {
	gulp.series("sass", "minifycss")(callback);
});

// Object for describing multiple source/destinations for compiling scss assets (allows for maintaining)

// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task("sass", function () {
	let srcDests = [{
			src: paths.styles + "/*.scss",
			dest: styleDist
		},
		{
			src: paths.client + "/client.scss",
			dest: paths.client + "/dist"
		},
		{
			src: paths.client + "/client-editor.scss",
			dest: paths.client + "/dist"
		}
	];
	var streams = srcDests.map(function (srcDest) {
		return gulp
			.src(srcDest.src)
			.pipe(
				plumber({
					errorHandler: function (err) {
						console.log(err);
						this.emit("end");
					}
				})
			)
			.pipe(sourcemaps.init({
				loadMaps: true
			}))
			.pipe(sass({
				errLogToConsole: true
			}))
			.pipe(autoprefixer("last 2 versions"))
			.pipe(sourcemaps.write(undefined, {
				sourceRoot: null
			}))
			.pipe(gulp.dest(srcDest.dest));
	});

	return merge(streams);
});

gulp.task("minifycss", function () {
	let srcDests = [{
			src: [
				styleDist + "/theme.css",
				styleDist + "/custom-editor-style.css"
			],
			dest: styleDist
		},
		{
			src: paths.client + "/dist/client.css",
			dest: paths.client + "/dist"
		},
		{
			src: paths.client + "/dist/client-editor.css",
			dest: paths.client + "/dist"
		}
	];
	var streams = srcDests.map(function (srcDest) {
		return gulp
			.src(srcDest.src)
			.pipe(sourcemaps.init({
				loadMaps: true
			}))
			.pipe(cleanCSS({
				compatibility: "*"
			}))
			.pipe(
				plumber({
					errorHandler: function (err) {
						console.log(err);
						this.emit("end");
					}
				})
			)
			.pipe(rename({
				suffix: ".min"
			}))
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest(srcDest.dest));
	});
	return merge(streams);
});

// Run:
// gulp imagemin
// Running image optimizing task
gulp.task("imagemin", function () {
	gulp.src(paths.img + "/**")
		.pipe(imagemin())
		.pipe(gulp.dest(paths.img));
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 *
 * @verbose
 */
gulp.task("imagemin-watch", gulp.series('imagemin'), function () {
	browserSync.reload();
});

// Run:
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task("browser-sync", function () {
	browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptions);
});

// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task("watch-bs", gulp.parallel('browser-sync', 'watch', 'scripts'), function () {});
