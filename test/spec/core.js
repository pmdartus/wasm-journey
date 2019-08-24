const path = require('path');
const { run } = require('./runner');

run({
    extension: '.wast.js',
    base: path.resolve(__dirname, 'wasm/test/_output'),
});