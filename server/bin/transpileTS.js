/* eslint no-console: 'off' */

module.exports = function transpileTSFiles(paths) {
  console.time('TS Compilation');

  require('ts-node').register({ transpileOnly: true });
  const result = paths.map((path) => require(path));

  console.timeEnd('TS Compilation');

  return result;
};
