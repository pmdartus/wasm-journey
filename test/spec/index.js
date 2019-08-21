const path = require('path');

const chalk = require('chalk');
const wptRunner = require('wpt-runner');

const { default: WebAssembly } = require('./dist/bindings');

const reporter = {
    startSuite(msg) {
        console.log(`\n${chalk.bold(msg)}`);
    },
    pass(msg) {
        console.log(indent(`${chalk.green('✔')} ${msg}`, 2));
    },
    fail(msg) {
        console.log(indent(`${chalk.red(`\u00D7 ${msg}`)}`, 2));
    },
    reportStack(stack) {
        console.log(indent(chalk.dim(`${stack}\n`), 4));
    },
};

function indent(string, times) {
    const prefix = ' '.repeat(times);
    return string
        .split('\n')
        .map(l => prefix + l)
        .join('\n');
}

const grep = process.argv[2];

wptRunner(path.resolve(__dirname, 'test/spec/wasm/test/js-api'), {
    rootURL: '/wasm/jsapi',
    filter(file) {
        return file.includes(grep);
    },
    setup(window) {
        window.WebAssembly = WebAssembly;
    },
    reporter,
})
    .then(failures => {
        console.log(failures)
        process.exit(failures);
    })
    .catch(e => {
        console.error(e.stack);
        process.exit(1);
    });
