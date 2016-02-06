import budo from 'budo';
import {exec} from 'child_process';
import path from 'path';
import util from 'util';

/* eslint no-console: 0 */

const pkg = require(path.join(__dirname, '../package.json'));

// Replace "%s" tokens with the plugin name in a string.
const nameify = (str) =>
  str.replace(/%s/g, pkg.name.split('/').reverse()[0]);

// Normalize strings to arrays and filter out empties.
const normalize = (obj) =>
  (typeof obj === 'string' ? [obj] : obj).filter(Boolean);

const server = budo({
  port: 9999,
  stream: process.stdout
});

/**
 * Execute CLI command(s) and reload the given file(s) or everything if none
 * are given.
 *
 * @param  {String|Array} cmd
 *         Can be an array of commands, which will be run in order.
 * @param  {String|Array} [outfile]
 *         If not given, triggers a hard reload.
 * @param  {String} [message]
 */
const recompile = (cmd, outfile, message) => {
  cmd = normalize(cmd);
  outfile = normalize(outfile);

  if (message) {
    console.log('Re-compiling %s', message);
  }

  exec(cmd.join(' && '), (err, stdout) => {
    if (err) {
      console.error(err.stack);
    } else if (outfile.length) {
      console.log('Reloading "%s"', outfile.join('", "'));
      outfile.forEach(server.reload);
    } else {
      console.log('Hard reload!');
      server.reload();
    }
  });
};

/**
 * A collection of functions which are mapped to strings that are used to
 * generate RegExp objects. If a filepath matches the RegExp, the function
 * will be used to handle that watched file.
 *
 * @type {Object}
 */
const handlers = {

  /**
   * Handler for JavaScript source.
   *
   * @param  {String} event
   * @param  {String} file
   */
  '^src/.+\.js$'(event, file) {
    const outfiles = [
      nameify('dist/%s.js'),
      nameify('dist/%s.min.js'),
      'test/dist/bundle.js'
    ];

    recompile(
      ['npm run build:js', 'npm run build:test'],
      outfiles,
      'javascript and tests'
    );
  },

  /**
   * Handler for JavaScript tests.
   *
   * @param  {String} event
   * @param  {String} file
   */
  '^test/.+\.test\.js$'(event, file) {
    recompile('npm run build:test', 'test/dist/bundle.js', 'tests');
  },

  /**
   * Handler for language JSON files.
   *
   * @param  {String} event
   * @param  {String} file
   */
  '^lang/.+\.json$'(event, file) {
    const outfile = util.format('dist/lang/%s.js', path.basename(file, '.json'));

    recompile('npm run build:lang', outfile, 'languages');
  },

  /**
   * Handler for Sass source.
   *
   * @param  {String} event
   * @param  {String} file
   */
  '^src/.+\.scss$'(event, file) {
    recompile('npm run build:css', nameify('dist/%s.css'), 'sass');
  }
};

/**
 * Finds the first handler function for the file that matches a RegExp
 * derived from the keys.
 *
 * @param  {String} file
 * @return {Function|Undefined}
 */
const findHandler = (file) => {
  const keys = Object.keys(handlers);

  for (let i = 0; i < keys.length; i++) {
    let regex = new RegExp(keys[i]);

    if (regex.test(file)) {
      return handlers[keys[i]];
    }
  }
};

server
  .live()
  .watch([
    'index.html',
    'lang/*.json',
    'src/**/*.{scss,js}',
    'test/**/*.test.js',
    'test/index.html'
  ])
  .on('watch', (event, file) => {
    const handler = findHandler(file);

    console.log('Detected a "%s" event in "%s"', event, file);

    if (handler) {
      handler(event, file);
    } else {
      console.log('Unmatched file, hard reload!', event, file);
      server.reload();
    }
  });
