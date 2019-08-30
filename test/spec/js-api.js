const path = require('path');
const { run } = require('./runner');

run({
    extension: '.any.js',
    base: path.resolve(__dirname, 'wasm/test/js-api'),
    expected: path.resolve(__dirname, './js-api.expected.json'),

    mapping: {
        // There is an explicit mapping because the test structure in the WASM directory differs
        // from the test structure in the official WPT repo.
        '/wasm/jsapi': path.resolve(__dirname, 'wasm/test/js-api'),
    },

    ignore: [
        // Takes too long to run. Let's revisit this once the limits are in place.
        'limits.any.js',
    ],
});
