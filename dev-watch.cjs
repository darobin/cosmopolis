/* eslint-disable global-require */
/* global require, process, __dirname */
const { join } = require('path');
const { readdirSync } = require('fs');

// Electronmon insists on being magic and detecting which files should trigger a render reload versus
// a process restart. Unfortunately, the ESM magic gets in the way of the Electronmon magic and it
// sees only a fraction of of the restart files. This file is meant to be added so that it gets
// required by the subprocess so that it can simulate discovering the files which we know are
// restart files.
// `electronmon --trace-warnings --require ./dev-watch.cjs .`

const appDir = join(__dirname, 'app');
const appLibDir = join(appDir, 'lib');
const files = readdirSync(appDir).filter(n => /\.c?js$/.test(n)).map(n => join(appDir, n));
files.push(...readdirSync(appLibDir).filter(n => /\.c?js$/.test(n)).map(n => join(appLibDir, n)));

files.forEach(file => process.send({ type: 'discover', file }));
