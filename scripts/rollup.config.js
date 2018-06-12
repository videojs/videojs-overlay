/**
 * Rollup configuration for packaging the plugin in various formats.
 */
const plugins = require('./primed-rollup-plugins.js');
const banner = require('./banner.js').comment;

// to prevent a screen during rollup watch/build
process.stderr.isTTY = false;

let isWatch = false;

process.argv.forEach((a) => {
  if ((/-w|--watch/).test(a)) {
    isWatch = true;
  }
});

const umdGlobals = {
  'video.js': 'videojs',
  'global': 'window',
  'global/window': 'window',
  'global/document': 'document'
};
const moduleGlobals = {
  'video.js': 'videojs'
};

const builds = [{
  // umd
  input: 'src/plugin.js',
  output: {
    name: 'videojsOverlay',
    file: 'dist/videojs-overlay.js',
    format: 'umd',
    globals: umdGlobals,
    banner
  },
  external: Object.keys(umdGlobals),
  plugins: [
    plugins.resolve,
    plugins.json,
    plugins.commonjs,
    plugins.babel
  ]
}, {
  // cjs
  input: 'src/plugin.js',
  output: [{
    file: 'dist/videojs-overlay.cjs.js',
    format: 'cjs',
    globals: moduleGlobals,
    banner
  }],
  external: Object.keys(moduleGlobals).concat([
    'global',
    'global/document',
    'global/window'
  ]),
  plugins: [
    plugins.resolve,
    plugins.json,
    plugins.commonjs,
    plugins.babel
  ]
}, {
  // es
  input: 'src/plugin.js',
  output: [{
    file: 'dist/videojs-overlay.es.js',
    format: 'es',
    globals: moduleGlobals,
    banner
  }],
  external: Object.keys(moduleGlobals).concat([
    'global',
    'global/document',
    'global/window'
  ]),
  plugins: [
    plugins.resolve,
    plugins.json,
    plugins.commonjs
  ]
}];

if (!isWatch) {
  builds.push({
    // minified umd
    input: 'src/plugin.js',
    output: {
      name: 'videojsOverlay',
      file: 'dist/videojs-overlay.min.js',
      format: 'umd',
      globals: umdGlobals,
      banner
    },
    external: Object.keys(umdGlobals),
    plugins: [
      plugins.resolve,
      plugins.json,
      plugins.commonjs,
      plugins.uglify,
      plugins.babel
    ]
  });
}

export default builds;
