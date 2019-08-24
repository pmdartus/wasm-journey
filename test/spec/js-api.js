// Inspired from Node WPT test runner:
// https://github.com/nodejs/node/blob/master/test/common/wpt.js

const vm = require('vm');
const fs = require('fs');
const path = require('path');

const glob = require('glob');
const chalk = require('chalk');

const { default: WebAssembly } = require('../../dist/bindings');

const SPEC_TEST_DIRECTORY = path.resolve(__dirname, 'wasm/test/');

const TEST_EXTENSION = '.any.js';
const TEST_DIRECTORY = path.resolve(SPEC_TEST_DIRECTORY, 'js-api');

const TEST_HARNESS_PATH = path.resolve(
    SPEC_TEST_DIRECTORY,
    'harness/testharness.js',
);
const TEST_HARNESS_CODE = fs.readFileSync(TEST_HARNESS_PATH, 'utf-8');

const TEST_STATUS = {
    PASS: 'PASS',
    FAILED: 'FAILED',
};

function indent(string, times) {
    const prefix = ' '.repeat(times);
    return string
        .split('\n')
        .map(l => prefix + l)
        .join('\n');
}

function createSandbox() {
    return {
        WebAssembly,
    };
}

function buildTestContext(meta, { onResult, onComplete }) {
    const sandbox = createSandbox();
    const context = vm.createContext(sandbox);

    // Evaluate the WPT test harness and add attach the test life-cycle callbacks to the evaluated
    // script.
    // https://web-platform-tests.org/writing-tests/testharness-api.html#callback-api
    vm.runInContext(TEST_HARNESS_CODE, context, {
        filename: TEST_HARNESS_PATH,
    });
    sandbox.add_result_callback(onResult);
    sandbox.add_completion_callback(onComplete);

    if (meta.script !== undefined) {
        for (const script of meta.script) {
            const filename = path.resolve(TEST_DIRECTORY, script.replace('/wasm/jsapi/', ''));
            const code = fs.readFileSync(filename, 'utf-8');

            vm.runInContext(code, context, {
                filename: filename,
            });
        }
    }

    return context;
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

function runTest(absolutePath, code, meta) {
    const results = [];

    const pass = test => {
        results.push({
            status: TEST_STATUS.PASS,
            test,
        });
    };
    const fail = test => {
        results.push({
            status: TEST_STATUS.FAILED,
            test,
        });
    };

    return new Promise(resolve => {
        const context = buildTestContext(meta, {
            onResult(test) {
                switch (test.status) {
                    case 1:
                    case 2:
                    case 3:
                        return fail(test);
                    default:
                        return pass(test);
                }
            },
            onComplete() {
                resolve(results);
            },
        });

        try {
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

function reportTest(filename, results) {
    console.log(`\n${chalk.bold(filename)}`);

    for (const result of results) {
        const { status, test } = result;
        if (status === TEST_STATUS.PASS) {
            console.log(indent(`${chalk.green('✔')} ${test.name}`, 2));
        } else if (status === TEST_STATUS.FAILED) {
            console.log(indent(`${chalk.red(`\u00D7 ${test.name}`)}`, 2));
            console.log(indent(chalk.dim(`${test.stack}\n`), 4));
        }
    }
}

function reportSuite(results) {
    const passingTests = results.filter(
        result => result.status === TEST_STATUS.PASS,
    );
    const failingTests = results.filter(
        result => result.status === TEST_STATUS.FAILED,
    );

    console.log(chalk.bold.green(`\n✔ ${passingTests.length} passing test.`));
    if (failingTests.length) {
        console.log(
            chalk.bold.red(`\u00D7 ${failingTests.length} failing test.`),
        );
    }
}

async function runTests() {
    const suiteResults = [];
    let tests = glob.sync(`**/*${TEST_EXTENSION}`, {
        cwd: TEST_DIRECTORY,
    });

    if (process.argv[2]) {
        const grep = process.argv[2];
        const test = tests.find(test => test === grep);

        if (test === undefined) {
            throw new Error(`${grep} not found`);
        }

        tests = [test];
    }

    for (const filename of tests) {
        const absolutePath = path.resolve(TEST_DIRECTORY, filename);
        const code = fs.readFileSync(absolutePath, 'utf-8');
        const meta = getMeta(code);

        const results = await runTest(absolutePath, code, meta);
        reportTest(filename, results);

        suiteResults.push(...results);
    }

    reportSuite(suiteResults);

    return suiteResults;
}

runTests()
    .then(results => {
        const failedTests = results.filter(
            result => result.status === TEST_STATUS.FAILED,
        );
        process.exit(failedTests.length);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
