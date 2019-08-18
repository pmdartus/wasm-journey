const assert = require('assert');

const { module_decode, module_validate } = require('../../../dist/vm/main');
const { readExample } = require('../shared');

describe('validate', () => {
    it('add.wasm', () => {
        const input = readExample('add.wasm');
        const module = module_decode(input);

        assert.doesNotThrow(() => {
            module_validate(module);
        });
    });
});
