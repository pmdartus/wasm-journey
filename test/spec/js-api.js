const path = require('path');
const { run } = require('./runner');

run({
    extension: '.any.js',
    base: path.resolve(__dirname, 'wasm/test/js-api'),
    mapping: {
        // There is an explicit mapping because the test structure in the WASM directory differs
        // from the test structure in the official WPT repo.
        '/wasm/jsapi': path.resolve(__dirname, 'wasm/test/js-api'),
    },

    ignore: [
        // Takes too long to run. Let's revisit this once the limits are in place.
        'limits.any.js',
    ],
    expected: {
        'constructor/instantiate-bad-imports.any.js': [
            [
                'WebAssembly.instantiate(module): Non-object imports argument: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object imports argument: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object module: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object module: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Non-object module: true',
                'FAIL',
            ],
            ['WebAssembly.instantiate(module): Non-object module: ""', 'FAIL'],
            [
                'WebAssembly.instantiate(module): Non-object module: symbol "Symbol()"',
                'FAIL',
            ],
            ['WebAssembly.instantiate(module): Non-object module: 1', 'FAIL'],
            ['WebAssembly.instantiate(module): Non-object module: 0.1', 'FAIL'],
            ['WebAssembly.instantiate(module): Non-object module: NaN', 'FAIL'],
            [
                'WebAssembly.instantiate(module): Missing imports argument',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Imports argument with missing property: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Imports argument with missing property: empty object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Imports argument with missing property: wrong property',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing an i64 global',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a function with an incorrectly-typed value: object "[object Object]"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: WebAssembly.Global',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: WebAssembly.Global.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing a global with an incorrectly-typed value: Object.create(WebAssembly.Global.prototype)',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: WebAssembly.Memory',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: WebAssembly.Memory.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing memory with an incorrectly-typed value: Object.create(WebAssembly.Memory.prototype)',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: WebAssembly.Table',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: WebAssembly.Table.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(module): Importing table with an incorrectly-typed value: Object.create(WebAssembly.Table.prototype)',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object imports argument: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object module: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object module: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Non-object module: true',
                'FAIL',
            ],
            ['WebAssembly.instantiate(buffer): Non-object module: ""', 'FAIL'],
            [
                'WebAssembly.instantiate(buffer): Non-object module: symbol "Symbol()"',
                'FAIL',
            ],
            ['WebAssembly.instantiate(buffer): Non-object module: 1', 'FAIL'],
            ['WebAssembly.instantiate(buffer): Non-object module: 0.1', 'FAIL'],
            ['WebAssembly.instantiate(buffer): Non-object module: NaN', 'FAIL'],
            [
                'WebAssembly.instantiate(buffer): Missing imports argument',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Imports argument with missing property: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Imports argument with missing property: empty object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Imports argument with missing property: wrong property',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing an i64 global',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a function with an incorrectly-typed value: object "[object Object]"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: WebAssembly.Global',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: WebAssembly.Global.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing a global with an incorrectly-typed value: Object.create(WebAssembly.Global.prototype)',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: WebAssembly.Memory',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: WebAssembly.Memory.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing memory with an incorrectly-typed value: Object.create(WebAssembly.Memory.prototype)',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: WebAssembly.Table',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: WebAssembly.Table.prototype',
                'FAIL',
            ],
            [
                'WebAssembly.instantiate(buffer): Importing table with an incorrectly-typed value: Object.create(WebAssembly.Table.prototype)',
                'FAIL',
            ],
        ],
        'constructor/instantiate.any.js': [
            ['getter order for imports object: BufferSource argument', 'FAIL'],
            ['getter order for imports object: Module argument', 'FAIL'],
            ['imports: BufferSource argument', 'FAIL'],
            ['imports: Module argument', 'FAIL'],
            ['No imports: BufferSource argument', 'FAIL'],
            ['No imports: Module argument', 'FAIL'],
            ['exports and imports: BufferSource argument', 'FAIL'],
            ['exports and imports: Module argument', 'FAIL'],
            ['Synchronous options handling: Buffer argument', 'FAIL'],
            ['Synchronous options handling: Module argument', 'FAIL'],
        ],
        'global/constructor.any.js': [
            ['length', 'FAIL'],
            ['No arguments', 'FAIL'],
            ['Invalid descriptor argument', 'FAIL'],
            ['Invalid type argument', 'FAIL'],
            ['Order of evaluation', 'FAIL'],
            ['i64 with default', 'FAIL'],
            ['Default value for type i32', 'FAIL'],
            ['Explicit value undefined for type i32', 'FAIL'],
            ['Explicit value null for type i32', 'FAIL'],
            ['Explicit value true for type i32', 'FAIL'],
            ['Explicit value false for type i32', 'FAIL'],
            ['Explicit value 2 for type i32', 'FAIL'],
            ['Explicit value "3" for type i32', 'FAIL'],
            ['Explicit value object with toString for type i32', 'FAIL'],
            ['Explicit value object with valueOf for type i32', 'FAIL'],
            ['Default value for type f32', 'FAIL'],
            ['Explicit value undefined for type f32', 'FAIL'],
            ['Explicit value null for type f32', 'FAIL'],
            ['Explicit value true for type f32', 'FAIL'],
            ['Explicit value false for type f32', 'FAIL'],
            ['Explicit value 2 for type f32', 'FAIL'],
            ['Explicit value "3" for type f32', 'FAIL'],
            ['Explicit value object with toString for type f32', 'FAIL'],
            ['Explicit value object with valueOf for type f32', 'FAIL'],
            ['Default value for type f64', 'FAIL'],
            ['Explicit value undefined for type f64', 'FAIL'],
            ['Explicit value null for type f64', 'FAIL'],
            ['Explicit value true for type f64', 'FAIL'],
            ['Explicit value false for type f64', 'FAIL'],
            ['Explicit value 2 for type f64', 'FAIL'],
            ['Explicit value "3" for type f64', 'FAIL'],
            ['Explicit value object with toString for type f64', 'FAIL'],
            ['Explicit value object with valueOf for type f64', 'FAIL'],
            ['Stray argument', 'FAIL'],
        ],
        'global/toString.any.js': [
            ['Object.prototype.toString on an Global', 'FAIL'],
        ],
        'global/value-get-set.any.js': [
            ['Branding', 'FAIL'],
            ['Immutable i32 (missing)', 'FAIL'],
            ['Immutable i32 (undefined)', 'FAIL'],
            ['Immutable i32 (null)', 'FAIL'],
            ['Immutable i32 (false)', 'FAIL'],
            ['Immutable i32 (empty string)', 'FAIL'],
            ['Immutable i32 (zero)', 'FAIL'],
            ['Mutable i32 (true)', 'FAIL'],
            ['Mutable i32 (one)', 'FAIL'],
            ['Mutable i32 (string)', 'FAIL'],
            ['Mutable i32 (true on prototype)', 'FAIL'],
            ['Immutable f32 (missing)', 'FAIL'],
            ['Immutable f32 (undefined)', 'FAIL'],
            ['Immutable f32 (null)', 'FAIL'],
            ['Immutable f32 (false)', 'FAIL'],
            ['Immutable f32 (empty string)', 'FAIL'],
            ['Immutable f32 (zero)', 'FAIL'],
            ['Mutable f32 (true)', 'FAIL'],
            ['Mutable f32 (one)', 'FAIL'],
            ['Mutable f32 (string)', 'FAIL'],
            ['Mutable f32 (true on prototype)', 'FAIL'],
            ['Immutable f64 (missing)', 'FAIL'],
            ['Immutable f64 (undefined)', 'FAIL'],
            ['Immutable f64 (null)', 'FAIL'],
            ['Immutable f64 (false)', 'FAIL'],
            ['Immutable f64 (empty string)', 'FAIL'],
            ['Immutable f64 (zero)', 'FAIL'],
            ['Mutable f64 (true)', 'FAIL'],
            ['Mutable f64 (one)', 'FAIL'],
            ['Mutable f64 (string)', 'FAIL'],
            ['Mutable f64 (true on prototype)', 'FAIL'],
            ['i64 with default', 'FAIL'],
            ['Calling setter without argument', 'FAIL'],
            ['Stray argument', 'FAIL'],
        ],
        'global/valueOf.any.js': [
            ['Branding', 'FAIL'],
            ['Stray argument', 'FAIL'],
        ],
        'instance/constructor-bad-imports.any.js': [
            [
                'new WebAssembly.Instance(module): Non-object imports argument: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: true',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: ""',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: 1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: 0.1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object imports argument: NaN',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object module: undefined',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object module: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object module: true',
                'FAIL',
            ],
            ['new WebAssembly.Instance(module): Non-object module: ""', 'FAIL'],
            [
                'new WebAssembly.Instance(module): Non-object module: symbol "Symbol()"',
                'FAIL',
            ],
            ['new WebAssembly.Instance(module): Non-object module: 1', 'FAIL'],
            [
                'new WebAssembly.Instance(module): Non-object module: 0.1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Non-object module: NaN',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Imports argument with missing property: empty object',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Imports argument with missing property: wrong property',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing an i64 global',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a function with an incorrectly-typed value: object "[object Object]"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: WebAssembly.Global',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: WebAssembly.Global.prototype',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing a global with an incorrectly-typed value: Object.create(WebAssembly.Global.prototype)',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: WebAssembly.Memory',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: WebAssembly.Memory.prototype',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing memory with an incorrectly-typed value: Object.create(WebAssembly.Memory.prototype)',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: undefined',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: null',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: true',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: ""',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: symbol "Symbol()"',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: 1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: 0.1',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: NaN',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: plain object',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: WebAssembly.Table',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: WebAssembly.Table.prototype',
                'FAIL',
            ],
            [
                'new WebAssembly.Instance(module): Importing table with an incorrectly-typed value: Object.create(WebAssembly.Table.prototype)',
                'FAIL',
            ],
        ],
        'memory/buffer.any.js': [['Branding', 'FAIL']],
        'memory/constructor.any.js': [
            ['Order of evaluation for descriptor', 'FAIL'],
            ['Non-zero initial', 'FAIL'],
        ],
        'instance/constructor.any.js': [
            ['length', 'FAIL'],
            ['getter order for imports object', 'FAIL'],
            ['imports', 'FAIL'],
            ['No imports', 'FAIL'],
            ['exports and imports', 'FAIL'],
            ['Order of evaluation for descriptor', 'FAIL'],
            ['Non-zero initial', 'FAIL'],
        ],
        'instance/exports.any.js': [['Branding', 'FAIL']],
        'memory/grow.any.js': [
            ['Missing arguments', 'FAIL'],
            ['Branding', 'FAIL'],
            ['Zero initial', 'FAIL'],
            ['Zero initial with valueOf', 'FAIL'],
            ['Non-zero initial', 'FAIL'],
            ['Zero initial with respected maximum', 'FAIL'],
            ['Zero initial with respected maximum grown twice', 'FAIL'],
            ['Zero initial growing too much', 'FAIL'],
            ['Out-of-range argument: undefined', 'FAIL'],
            ['Out-of-range argument: NaN', 'FAIL'],
            ['Out-of-range argument: Infinity', 'FAIL'],
            ['Out-of-range argument: -Infinity', 'FAIL'],
            ['Out-of-range argument: -1', 'FAIL'],
            ['Out-of-range argument: 4294967296', 'FAIL'],
            ['Out-of-range argument: 68719476736', 'FAIL'],
            ['Out-of-range argument: "0x100000000"', 'FAIL'],
            ['Out-of-range argument: object "[object Object]"', 'FAIL'],
            ['Stray argument', 'FAIL'],
        ],
        'module/customSections.any.js': [
            ['Custom sections with surrogate pairs', 'FAIL'],
            ['Custom sections with U+FFFD', 'FAIL'],
        ],
        'module/exports.any.js': [['exports', 'FAIL']],
        'module/imports.any.js': [
            ['Missing arguments', 'FAIL'],
            ['Non-Module arguments', 'FAIL'],
            ['imports', 'FAIL'],
        ],
        'table/constructor.any.js': [
            ['No arguments', 'FAIL'],
            ['Empty descriptor', 'FAIL'],
            ['Invalid descriptor argument', 'FAIL'],
            ['Undefined initial value in descriptor', 'FAIL'],
            ['Undefined element value in descriptor', 'FAIL'],
            ['Out-of-range initial value in descriptor: NaN', 'FAIL'],
            ['Out-of-range maximum value in descriptor: NaN', 'FAIL'],
            ['Out-of-range initial value in descriptor: Infinity', 'FAIL'],
            ['Out-of-range maximum value in descriptor: Infinity', 'FAIL'],
            ['Out-of-range initial value in descriptor: -Infinity', 'FAIL'],
            ['Out-of-range maximum value in descriptor: -Infinity', 'FAIL'],
            ['Out-of-range initial value in descriptor: -1', 'FAIL'],
            ['Out-of-range maximum value in descriptor: -1', 'FAIL'],
            ['Out-of-range initial value in descriptor: 4294967296', 'FAIL'],
            ['Out-of-range maximum value in descriptor: 4294967296', 'FAIL'],
            ['Out-of-range initial value in descriptor: 68719476736', 'FAIL'],
            ['Out-of-range maximum value in descriptor: 68719476736', 'FAIL'],
            ['Initial value exceeds maximum', 'FAIL'],
            ['Basic (non-zero)', 'FAIL'],
            ['Type conversion for descriptor.element', 'FAIL'],
            ['Order of evaluation for descriptor', 'FAIL'],
        ],
        'table/get-set.any.js': [
            ['Missing arguments: get', 'FAIL'],
            ['Branding: get', 'FAIL'],
            ['Missing arguments: set', 'FAIL'],
            ['Branding: set', 'FAIL'],
            ['Basic', 'FAIL'],
            ['Growing', 'FAIL'],
            ['Setting out-of-bounds', 'FAIL'],
            ['Setting non-function', 'FAIL'],
            ['Setting non-wasm function', 'FAIL'],
            ['Setting non-wasm arrow function', 'FAIL'],
            ['Order of argument conversion', 'FAIL'],
            ['Stray argument', 'FAIL'],
            ['Getting out-of-range argument: undefined', 'FAIL'],
            ['Setting out-of-range argument: undefined', 'FAIL'],
            ['Getting out-of-range argument: NaN', 'FAIL'],
            ['Setting out-of-range argument: NaN', 'FAIL'],
            ['Getting out-of-range argument: Infinity', 'FAIL'],
            ['Setting out-of-range argument: Infinity', 'FAIL'],
            ['Getting out-of-range argument: -Infinity', 'FAIL'],
            ['Setting out-of-range argument: -Infinity', 'FAIL'],
            ['Getting out-of-range argument: -1', 'FAIL'],
            ['Setting out-of-range argument: -1', 'FAIL'],
            ['Getting out-of-range argument: 4294967296', 'FAIL'],
            ['Setting out-of-range argument: 4294967296', 'FAIL'],
            ['Getting out-of-range argument: 68719476736', 'FAIL'],
            ['Setting out-of-range argument: 68719476736', 'FAIL'],
            ['Getting out-of-range argument: "0x100000000"', 'FAIL'],
            ['Setting out-of-range argument: "0x100000000"', 'FAIL'],
            ['Getting out-of-range argument: object "[object Object]"', 'FAIL'],
            ['Setting out-of-range argument: object "[object Object]"', 'FAIL'],
        ],
        'table/grow.any.js': [
            ['Missing arguments', 'FAIL'],
            ['Branding', 'FAIL'],
            ['Basic', 'FAIL'],
            ['Reached maximum', 'FAIL'],
            ['Exceeded maximum', 'FAIL'],
            ['Stray argument', 'FAIL'],
            ['Out-of-range argument: undefined', 'FAIL'],
            ['Out-of-range argument: NaN', 'FAIL'],
            ['Out-of-range argument: Infinity', 'FAIL'],
            ['Out-of-range argument: -Infinity', 'FAIL'],
            ['Out-of-range argument: -1', 'FAIL'],
            ['Out-of-range argument: 4294967296', 'FAIL'],
            ['Out-of-range argument: 68719476736', 'FAIL'],
            ['Out-of-range argument: "0x100000000"', 'FAIL'],
            ['Out-of-range argument: object "[object Object]"', 'FAIL'],
        ],
        'table/length.any.js': [
            ['Branding', 'FAIL'],
            ['Stray argument', 'FAIL'],
            ['Setting (sloppy mode)', 'FAIL'],
            ['Setting (strict mode)', 'FAIL'],
        ],
    },
});
