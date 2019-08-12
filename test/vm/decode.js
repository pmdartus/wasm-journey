const assert = require('assert');

const { module_decode } = require('../../dist/vm/main');
const { readExample } = require('../shared');

describe('decode', () => {
    it('add.wasm', () => {
        const input = readExample('add.wasm');
        const module = module_decode(input);

        assert.deepEqual(module, {
            types: [
                {
                    params: [0, 0],
                    results: [0],
                },
            ],
            functions: [
                {
                    type: {
                        index: 0,
                        type: 'type',
                    },
                    locals: [],
                    body: {
                        instructions: [
                            {
                                index: 0,
                                opcode: 0x20,
                            },
                            {
                                index: 1,
                                opcode: 0x20,
                            },
                            {
                                opcode: 0x6a,
                            },
                        ],
                    },
                },
            ],
            tables: [],
            memories: [],
            globals: [],
            elements: [],
            datas: [],
            imports: [],
            exports: [
                {
                    name: 'add',
                    descriptor: {
                        type: 'function',
                        index: 0,
                    },
                },
            ],
        });
    });
});
