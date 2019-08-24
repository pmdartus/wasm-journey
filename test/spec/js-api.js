const path = require('path');
const { run } = require('./runner');

run({
    extension: '.any.js',
    base: path.resolve(__dirname, 'wasm/test/js-api'),
    mapping: {
        // There is an explicit mapping because the test structure in the WASM directory differs
        // from the test structure in the official WPT repo. 
        '/wasm/jsapi': path.resolve(__dirname, 'wasm/test/js-api')
    },
});