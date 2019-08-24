const path = require('path');
const { run } = require('./runner');

run({
    extension: '.wast.js',
    base: path.resolve(__dirname, 'wasm/test/_output'),

    failures: {
        'skip-stack-guard-page.wast.js': [
            '#3 Test that a WebAssembly code exhauts the stack space',
            '#4 Test that a WebAssembly code exhauts the stack space',
            '#5 Test that a WebAssembly code exhauts the stack space',
            '#6 Test that a WebAssembly code exhauts the stack space',
            '#7 Test that a WebAssembly code exhauts the stack space',
            '#8 Test that a WebAssembly code exhauts the stack space',
            '#9 Test that a WebAssembly code exhauts the stack space',
            '#10 Test that a WebAssembly code exhauts the stack space',
            '#11 Test that a WebAssembly code exhauts the stack space',
            '#12 Test that a WebAssembly code exhauts the stack space',
        ]
    }
});