const path = require('path');
const { run } = require('./runner');

run({
    extension: '.wast.js',
    base: path.resolve(__dirname, 'wasm/test/_output'),
    expected: path.resolve(__dirname, './core.expected.json'),

    ignore: [
        // Ignore all the float32, float64 and int64 related tests since it is no implemented yet.
        '**/float*',
        '**/f64*',
        '**/f32*',
        '**/i64*',
    ],
});
