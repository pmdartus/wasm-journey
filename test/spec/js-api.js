const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, workerData } = require('worker_threads');

const glob = require('glob');

const TEST_GLOB = '**/*.any.js';
const SCRIPT_PREFIX = '/wasm/jsapi/';

const TEST_DIR = path.resolve(__dirname, 'wasm/test');
const TEST_JS_API_DIR = path.resolve(__dirname, TEST_DIR, 'js-api');
const TEST_HARNESS = path.resolve(__dirname, TEST_DIR, 'harness/testharness.js');
const TEST_HARNESS_REPORT = path.resolve(__dirname, TEST_DIR, 'harness/testharnessreport.js');
const TEST_HARNESS_JS = path.resolve(__dirname, TEST_DIR, 'harness/async_index.js');

function extractScripts(file) {
    const content = fs.readFileSync(file, 'utf-8');

    return content
        .split('\n')
        .filter(line => line.startsWith('// META: script='))
        .map(line => {
            const match = /script=(.*)/.exec(line);
            const relativePath = match[1].replace(SCRIPT_PREFIX, '');
            return path.join(TEST_DIR, relativePath);
        });
}

async function runTest(file) {
    const scripts = extractScripts(file);

    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: {
                file,
                scripts,
            },
        });

        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) {
                return reject();
            }
            resolve();
        });
    });
}

function runTestSuite() {
    const relPaths = glob.sync(TEST_GLOB, {
        cwd: TEST_JS_API_DIR,
    });

    for (const relPath of relPaths) {
        it(relPath, async () => {
            const absPath = path.resolve(TEST_JS_API_DIR, relPath);
            await runTest(absPath);
        });
    }
}

function runTestWorker(config) {
    const { file, scripts } = config;

    require(TEST_HARNESS);
    require(TEST_HARNESS_REPORT);
    require(TEST_HARNESS_JS);

    for (const script of scripts) {
        require(script);
    }

    require(file);
}

if (isMainThread) {
    runTestSuite();
} else {
    const config = workerData;
    runTestWorker(config);
}
