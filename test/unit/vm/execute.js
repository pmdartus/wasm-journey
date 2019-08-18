const assert = require('assert');

const { readExample } = require('../shared');
const {
    module_decode,
    module_instantiate,
    store_init,
} = require('../../../dist/vm/main');

describe('execute', () => {
    it('add.wasm', () => {
        const input = readExample('add.wasm');

        const module = module_decode(input);
        const store = store_init();

        const instance = module_instantiate(store, module);
        assert.deepEqual(instance, {
            exports: [
                {
                    name: 'add',
                    value: {
                        address: 0,
                        type: 'function',
                    },
                },
            ],
            functionAddress: [
                {
                    address: 0,
                    type: 'function',
                },
            ],
            types: [
                {
                    params: [0, 0],
                    results: [0],
                },
            ],
        });
    });
});
