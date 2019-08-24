// Inspired from Node WPT test runner:
// https://github.com/nodejs/node/blob/master/test/common/wpt.js

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const glob = require('glob');
const chalk = require('chalk');

const PASS = 'PASS';
const FAILED = 'FAILED';

const TEST_DIR = path.resolve(__dirname, '../wasm/test');

// Note: Using an up to date version of the WPT test harness supporting a non browser environment.
// The test harness in the web assembly submodule is not up to date.
// https://github.com/web-platform-tests/wpt/commit/cb9176baeb50e0ee5a010218388e8120c09bab0f
const WPT_HARNESS_PATH = path.resolve(__dirname, './testharness.js');
const WPT_HARNESS_CODE = fs.readFileSync(WPT_HARNESS_PATH, 'utf-8');

const JS_HARNESS_PATH = path.resolve(TEST_DIR, 'harness/async_index.js');
const JS_HARNESS_CODE = fs.readFileSync(JS_HARNESS_PATH, 'utf-8');

function indent(string, times) {
    const prefix = ' '.repeat(times);
    return string
        .split('\n')
        .map(l => prefix + l)
        .join('\n');
}

function getAbsolutePath(filename, config) {
    const { mapping = {} } = config;

    for (const [key, value] of Object.entries(mapping)) {
        if (filename.startsWith(key)) {
            return filename.replace(key, value);
        }
    }

    return path.resolve(config.base, filename);
}

function getContent(filename, config) {
    return fs.readFileSync(getAbsolutePath(filename, config), 'utf-8');
}

function getMeta(code) {
    const matches = code.match(/\/\/ META: .+/g);
    if (!matches) {
        return {};
    } else {
        const result = {};
        for (const match of matches) {
            const parts = match.match(/\/\/ META: ([^=]+?)=(.+)/);
            const key = parts[1];
            const value = parts[2];
            if (key === 'script') {
                if (result[key]) {
                    result[key].push(value);
                } else {
                    result[key] = [value];
                }
            } else {
                result[key] = value;
            }
        }
        return result;
    }
}

function getTests(config) {
    const { extension, base } = config;

    const files = glob.sync(`**/*${extension}`, {
        cwd: base,
    });

    if (process.argv[2]) {
        const grep = process.argv[2];
        const match = files.find(filename => filename === grep);

        if (match === undefined) {
            throw new Error(`${grep} not found`);
        }

        return [match];
    } else {
        return files;
    }
}

function reportTest(filename, results) {
    console.log(`\n${chalk.bold(filename)}`);

    for (const result of results) {
        const { status, test } = result;
        if (status === PASS) {
            console.log(indent(`${chalk.green('✔')} ${test.name}`, 2));
        } else if (status === FAILED) {
            console.log(indent(`${chalk.red(`\u00D7 ${test.name}`)}`, 2));
            console.log(indent(chalk.dim(`${test.stack}\n`), 4));
        }
    }
}

function reportTests(results) {
    const passingTests = results.filter(result => result.status === PASS);
    const failingTests = results.filter(result => result.status === FAILED);

    console.log(chalk.bold.green(`\n✔ ${passingTests.length} passing test.`));
    if (failingTests.length) {
        console.log(
            chalk.bold.red(`\u00D7 ${failingTests.length} failing test.`),
        );
    }
}

function buildTestContext(config, meta, { onResult, onComplete }) {
    const sandbox = {
        WebAssembly,
    };
    const context = vm.createContext(sandbox);

    // Evaluate the WPT test harness and attach the lifecycle callback on it
    // https://web-platform-tests.org/writing-tests/testharness-api.html#callback-api
    vm.runInContext(WPT_HARNESS_CODE, context, {
        filename: WPT_HARNESS_PATH,
    });
    sandbox.add_result_callback(onResult);
    sandbox.add_completion_callback(onComplete);

    // Evaluate the javascript harness code. It's a share library with helper functions used
    // by all the WASM tests.
    vm.runInContext(JS_HARNESS_CODE, context, {
        filename: JS_HARNESS_PATH,
    });

    // Load all the scripts referenced via the META annotations.
    // https://web-platform-tests.org/writing-tests/testharness.html#including-other-javascript-resources-in-auto-generated-boilerplate-tests
    if (meta.script !== undefined) {
        for (const script of meta.script) {
            const code = getContent(script, config);
            const filename = getAbsolutePath(script, config);

            vm.runInContext(code, context, {
                filename: filename,
            });
        }
    }

    return context;
}

function runTest(filename, config) {
    const absolutePath = getAbsolutePath(filename, config);
    const code = getContent(filename, config);
    const meta = getMeta(code, config);

    const results = [];

    const pass = test => {
        results.push({
            filename,
            status: PASS,
            test,
        });
    };
    const fail = test => {
        results.push({
            filename,
            status: FAILED,
            test,
        });
    };

    return new Promise(resolve => {
        const callbacks = {
            onResult(test) {
                switch (test.status) {
                    case 1: // failure
                    case 2: // timeout
                    case 3: // incomplete
                        return fail(test);
                    default:
                        return pass(test);
                }
            },
            onComplete() {
                resolve(results);
            },
        };

        try {
            const context = buildTestContext(config, meta, callbacks);
            vm.runInContext(code, context, {
                filename: absolutePath,
            });
        } catch (err) {
            fail({
                name: '',
                message: err.message,
                stack: err.stack,
            });
            resolve(results);
        }
    });
}

async function runTests(config) {
    const tests = getTests(config);
    const results = [];

    for (const filename of tests) {
        const res = await runTest(filename, config);
        results.push(...res);

        reportTest(filename, res);
    }

    reportTests(results);

    return results;
}

async function run(config) {
    let code;

    try {
        const results = await runTests(config);
        code = results.filter(result => result.status === FAILED);
    } catch (err) {
        console.error(err);
    }

    process.exit(code);
}

module.exports = {
    run,
};