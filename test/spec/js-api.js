const path = require('path');
const { run } = require('./runner');

run({
    extension: '.any.js',
    base: path.resolve(__dirname, 'wasm/test/js-api'),
    mapping: {
        // There is an explicit mapping because the test structure in the WASM directory differs
        // from the test structure in the official WPT repo. 
        '/wasm/jsapi': path.resolve(__dirname, 'wasm/test/js-api')
    },

    expected: {
        "constructor/compile.any.js": [
            [
                "Missing argument",
                "FAIL"
            ],
            [
                "Invalid arguments",
                "FAIL"
            ],
            [
                "Invalid code",
                "FAIL"
            ]
        ],
        "constructor/instantiate-bad-imports.any.js": [
            [
                "",
                "FAIL"
            ]
        ],
        "constructor/instantiate.any.js": [
            [
                "Missing arguments",
                "FAIL"
            ],
            [
                "Invalid arguments",
                "FAIL"
            ],
            [
                "Empty module without imports argument: Module argument",
                "FAIL"
            ],
            [
                "Empty module with undefined imports argument: Module argument",
                "FAIL"
            ],
            [
                "Empty module with empty imports argument: Module argument",
                "FAIL"
            ],
            [
                "getter order for imports object: BufferSource argument",
                "FAIL"
            ],
            [
                "getter order for imports object: Module argument",
                "FAIL"
            ],
            [
                "imports: Module argument",
                "FAIL"
            ],
            [
                "No imports: BufferSource argument",
                "FAIL"
            ],
            [
                "No imports: Module argument",
                "FAIL"
            ],
            [
                "exports and imports: BufferSource argument",
                "FAIL"
            ],
            [
                "exports and imports: Module argument",
                "FAIL"
            ],
            [
                "stray argument: Module argument",
                "FAIL"
            ],
            [
                "Synchronous options handling: Buffer argument",
                "FAIL"
            ],
            [
                "Synchronous options handling: Module argument",
                "FAIL"
            ],
            [
                "Invalid code",
                "FAIL"
            ]
        ],
        "constructor/validate.any.js": [
            [
                "Validating module [0 61 73 6d 1 0 0 0 0 0] in Uint8Array",
                "FAIL"
            ],
            [
                "Validating module [0 61 73 6d 1 0 0 0 0 0] in Int8Array",
                "FAIL"
            ],
            [
                "Validating module [0 61 73 6d 1 0 0 0 0 0] in Uint16Array",
                "FAIL"
            ],
            [
                "Validating module [0 61 73 6d 1 0 0 0 0 0] in Int16Array",
                "FAIL"
            ]
        ],
        "global/constructor.any.js": [
            [
                "name",
                "FAIL"
            ],
            [
                "length",
                "FAIL"
            ],
            [
                "Order of evaluation",
                "FAIL"
            ],
            [
                "i64 with default",
                "FAIL"
            ],
            [
                "Default value for type i32",
                "FAIL"
            ],
            [
                "Explicit value undefined for type i32",
                "FAIL"
            ],
            [
                "Explicit value null for type i32",
                "FAIL"
            ],
            [
                "Explicit value true for type i32",
                "FAIL"
            ],
            [
                "Explicit value false for type i32",
                "FAIL"
            ],
            [
                "Explicit value 2 for type i32",
                "FAIL"
            ],
            [
                "Explicit value \"3\" for type i32",
                "FAIL"
            ],
            [
                "Explicit value object with toString for type i32",
                "FAIL"
            ],
            [
                "Explicit value object with valueOf for type i32",
                "FAIL"
            ],
            [
                "Default value for type f32",
                "FAIL"
            ],
            [
                "Explicit value undefined for type f32",
                "FAIL"
            ],
            [
                "Explicit value null for type f32",
                "FAIL"
            ],
            [
                "Explicit value true for type f32",
                "FAIL"
            ],
            [
                "Explicit value false for type f32",
                "FAIL"
            ],
            [
                "Explicit value 2 for type f32",
                "FAIL"
            ],
            [
                "Explicit value \"3\" for type f32",
                "FAIL"
            ],
            [
                "Explicit value object with toString for type f32",
                "FAIL"
            ],
            [
                "Explicit value object with valueOf for type f32",
                "FAIL"
            ],
            [
                "Default value for type f64",
                "FAIL"
            ],
            [
                "Explicit value undefined for type f64",
                "FAIL"
            ],
            [
                "Explicit value null for type f64",
                "FAIL"
            ],
            [
                "Explicit value true for type f64",
                "FAIL"
            ],
            [
                "Explicit value false for type f64",
                "FAIL"
            ],
            [
                "Explicit value 2 for type f64",
                "FAIL"
            ],
            [
                "Explicit value \"3\" for type f64",
                "FAIL"
            ],
            [
                "Explicit value object with toString for type f64",
                "FAIL"
            ],
            [
                "Explicit value object with valueOf for type f64",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "global/toString.any.js": [
            [
                "Object.prototype.toString on an Global",
                "FAIL"
            ]
        ],
        "global/value-get-set.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Immutable i32 (missing)",
                "FAIL"
            ],
            [
                "Immutable i32 (undefined)",
                "FAIL"
            ],
            [
                "Immutable i32 (null)",
                "FAIL"
            ],
            [
                "Immutable i32 (false)",
                "FAIL"
            ],
            [
                "Immutable i32 (empty string)",
                "FAIL"
            ],
            [
                "Immutable i32 (zero)",
                "FAIL"
            ],
            [
                "Mutable i32 (true)",
                "FAIL"
            ],
            [
                "Mutable i32 (one)",
                "FAIL"
            ],
            [
                "Mutable i32 (string)",
                "FAIL"
            ],
            [
                "Mutable i32 (true on prototype)",
                "FAIL"
            ],
            [
                "Immutable f32 (missing)",
                "FAIL"
            ],
            [
                "Immutable f32 (undefined)",
                "FAIL"
            ],
            [
                "Immutable f32 (null)",
                "FAIL"
            ],
            [
                "Immutable f32 (false)",
                "FAIL"
            ],
            [
                "Immutable f32 (empty string)",
                "FAIL"
            ],
            [
                "Immutable f32 (zero)",
                "FAIL"
            ],
            [
                "Mutable f32 (true)",
                "FAIL"
            ],
            [
                "Mutable f32 (one)",
                "FAIL"
            ],
            [
                "Mutable f32 (string)",
                "FAIL"
            ],
            [
                "Mutable f32 (true on prototype)",
                "FAIL"
            ],
            [
                "Immutable f64 (missing)",
                "FAIL"
            ],
            [
                "Immutable f64 (undefined)",
                "FAIL"
            ],
            [
                "Immutable f64 (null)",
                "FAIL"
            ],
            [
                "Immutable f64 (false)",
                "FAIL"
            ],
            [
                "Immutable f64 (empty string)",
                "FAIL"
            ],
            [
                "Immutable f64 (zero)",
                "FAIL"
            ],
            [
                "Mutable f64 (true)",
                "FAIL"
            ],
            [
                "Mutable f64 (one)",
                "FAIL"
            ],
            [
                "Mutable f64 (string)",
                "FAIL"
            ],
            [
                "Mutable f64 (true on prototype)",
                "FAIL"
            ],
            [
                "i64 with default",
                "FAIL"
            ],
            [
                "Calling setter without argument",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "global/valueOf.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "instance/constructor-bad-imports.any.js": [
            [
                "new WebAssembly.Instance(module): Non-object imports argument: null",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: true",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: \"\"",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: symbol \"Symbol()\"",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: 1",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: 0.1",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object imports argument: NaN",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: undefined",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: null",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: true",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: \"\"",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: symbol \"Symbol()\"",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: 1",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: 0.1",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Non-object module: NaN",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Missing imports argument",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Imports argument with missing property: undefined",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Imports argument with missing property: empty object",
                "FAIL"
            ],
            [
                "new WebAssembly.Instance(module): Imports argument with missing property: wrong property",
                "FAIL"
            ],
            [
                "",
                "FAIL"
            ]
        ],
        "instance/constructor.any.js": [
            [
                "length",
                "FAIL"
            ],
            [
                "Calling",
                "FAIL"
            ],
            [
                "Empty module without imports argument",
                "FAIL"
            ],
            [
                "Empty module with undefined imports argument",
                "FAIL"
            ],
            [
                "Empty module with empty imports argument",
                "FAIL"
            ],
            [
                "getter order for imports object",
                "FAIL"
            ],
            [
                "imports",
                "FAIL"
            ],
            [
                "No imports",
                "FAIL"
            ],
            [
                "exports and imports",
                "FAIL"
            ],
            [
                "stray argument",
                "FAIL"
            ]
        ],
        "instance/exports.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ],
            [
                "Setting (sloppy mode)",
                "FAIL"
            ],
            [
                "Setting (strict mode)",
                "FAIL"
            ]
        ],
        "instance/toString.any.js": [
            [
                "Object.prototype.toString on an Instance",
                "FAIL"
            ]
        ],
        "interface.any.js": [
            [
                "WebAssembly: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Module: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Instance: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Memory: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Table: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Global: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.Global: prototype",
                "FAIL"
            ],
            [
                "WebAssembly.Global: prototype.constructor",
                "FAIL"
            ],
            [
                "WebAssembly.CompileError: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.CompileError: prototype",
                "FAIL"
            ],
            [
                "WebAssembly.CompileError: prototype.constructor",
                "FAIL"
            ],
            [
                "WebAssembly.LinkError: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.LinkError: prototype",
                "FAIL"
            ],
            [
                "WebAssembly.LinkError: prototype.constructor",
                "FAIL"
            ],
            [
                "WebAssembly.RuntimeError: property descriptor",
                "FAIL"
            ],
            [
                "WebAssembly.RuntimeError: prototype",
                "FAIL"
            ],
            [
                "WebAssembly.RuntimeError: prototype.constructor",
                "FAIL"
            ],
            [
                "WebAssembly.validate",
                "FAIL"
            ],
            [
                "WebAssembly.validate: name",
                "FAIL"
            ],
            [
                "WebAssembly.compile",
                "FAIL"
            ],
            [
                "WebAssembly.instantiate",
                "FAIL"
            ],
            [
                "WebAssembly.instantiate: length",
                "FAIL"
            ],
            [
                "WebAssembly.Module.exports",
                "FAIL"
            ],
            [
                "WebAssembly.Module.imports",
                "FAIL"
            ],
            [
                "WebAssembly.Module.imports: name",
                "FAIL"
            ],
            [
                "WebAssembly.Module.imports: length",
                "FAIL"
            ],
            [
                "WebAssembly.Module.customSections",
                "FAIL"
            ],
            [
                "WebAssembly.Module.customSections: name",
                "FAIL"
            ],
            [
                "WebAssembly.Module.customSections: length",
                "FAIL"
            ],
            [
                "WebAssembly.Instance.exports",
                "FAIL"
            ],
            [
                "WebAssembly.Instance.exports: getter",
                "FAIL"
            ],
            [
                "WebAssembly.Instance.exports: setter",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.grow",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.grow: name",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.grow: length",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.buffer",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.buffer: getter",
                "FAIL"
            ],
            [
                "WebAssembly.Memory.buffer: setter",
                "FAIL"
            ],
            [
                "WebAssembly.Table.grow",
                "FAIL"
            ],
            [
                "WebAssembly.Table.grow: name",
                "FAIL"
            ],
            [
                "WebAssembly.Table.grow: length",
                "FAIL"
            ],
            [
                "WebAssembly.Table.get",
                "FAIL"
            ],
            [
                "WebAssembly.Table.get: name",
                "FAIL"
            ],
            [
                "WebAssembly.Table.get: length",
                "FAIL"
            ],
            [
                "WebAssembly.Table.set",
                "FAIL"
            ],
            [
                "WebAssembly.Table.set: name",
                "FAIL"
            ],
            [
                "WebAssembly.Table.set: length",
                "FAIL"
            ],
            [
                "WebAssembly.Table.length",
                "FAIL"
            ],
            [
                "WebAssembly.Table.length: getter",
                "FAIL"
            ],
            [
                "WebAssembly.Table.length: setter",
                "FAIL"
            ],
            [
                "",
                "FAIL"
            ]
        ],
        "limits.any.js": [
            [
                "Validate types over limit",
                "FAIL"
            ],
            [
                "Compile types minimum",
                "FAIL"
            ],
            [
                "Compile types limit",
                "FAIL"
            ],
            [
                "Compile types over limit",
                "FAIL"
            ],
            [
                "Validate functions over limit",
                "FAIL"
            ],
            [
                "Compile functions minimum",
                "FAIL"
            ],
            [
                "Compile functions limit",
                "FAIL"
            ],
            [
                "Compile functions over limit",
                "FAIL"
            ],
            [
                "Validate imports over limit",
                "FAIL"
            ],
            [
                "Compile imports minimum",
                "FAIL"
            ],
            [
                "Compile imports limit",
                "FAIL"
            ],
            [
                "Compile imports over limit",
                "FAIL"
            ],
            [
                "Validate exports limit",
                "FAIL"
            ],
            [
                "Compile exports minimum",
                "FAIL"
            ],
            [
                "Compile exports limit",
                "FAIL"
            ],
            [
                "Compile exports over limit",
                "FAIL"
            ],
            [
                "Validate globals over limit",
                "FAIL"
            ],
            [
                "Compile globals minimum",
                "FAIL"
            ],
            [
                "Compile globals limit",
                "FAIL"
            ],
            [
                "Compile globals over limit",
                "FAIL"
            ],
            [
                "Validate data segments over limit",
                "FAIL"
            ],
            [
                "Compile data segments minimum",
                "FAIL"
            ],
            [
                "Compile data segments limit",
                "FAIL"
            ],
            [
                "Compile data segments over limit",
                "FAIL"
            ],
            [
                "Validate initial declared memory pages over limit",
                "FAIL"
            ],
            [
                "Compile initial declared memory pages minimum",
                "FAIL"
            ],
            [
                "Compile initial declared memory pages limit",
                "FAIL"
            ],
            [
                "Compile initial declared memory pages over limit",
                "FAIL"
            ],
            [
                "Validate maximum declared memory pages over limit",
                "FAIL"
            ],
            [
                "Compile maximum declared memory pages minimum",
                "FAIL"
            ],
            [
                "Compile maximum declared memory pages limit",
                "FAIL"
            ],
            [
                "Compile maximum declared memory pages over limit",
                "FAIL"
            ],
            [
                "Validate initial imported memory pages over limit",
                "FAIL"
            ],
            [
                "Compile initial imported memory pages minimum",
                "FAIL"
            ],
            [
                "Compile initial imported memory pages limit",
                "FAIL"
            ],
            [
                "Compile initial imported memory pages over limit",
                "FAIL"
            ],
            [
                "Validate maximum imported memory pages over limit",
                "FAIL"
            ],
            [
                "Compile maximum imported memory pages minimum",
                "FAIL"
            ],
            [
                "Compile maximum imported memory pages limit",
                "FAIL"
            ],
            [
                "Compile maximum imported memory pages over limit",
                "FAIL"
            ],
            [
                "Validate function size limit",
                "FAIL"
            ],
            [
                "Compile function size minimum",
                "FAIL"
            ],
            [
                "Compile function size limit",
                "FAIL"
            ],
            [
                "Compile function size over limit",
                "FAIL"
            ],
            [
                "Validate function locals over limit",
                "FAIL"
            ],
            [
                "Compile function locals minimum",
                "FAIL"
            ],
            [
                "Compile function locals limit",
                "FAIL"
            ],
            [
                "Compile function locals over limit",
                "FAIL"
            ],
            [
                "Validate function params over limit",
                "FAIL"
            ],
            [
                "Compile function params minimum",
                "FAIL"
            ],
            [
                "Compile function params limit",
                "FAIL"
            ],
            [
                "Compile function params over limit",
                "FAIL"
            ],
            [
                "Validate function params+locals minimum",
                "FAIL"
            ],
            [
                "Validate function params+locals limit",
                "FAIL"
            ],
            [
                "Compile function params+locals minimum",
                "FAIL"
            ],
            [
                "Compile function params+locals limit",
                "FAIL"
            ],
            [
                "Compile function params+locals over limit",
                "FAIL"
            ],
            [
                "Compile function returns minimum",
                "FAIL"
            ],
            [
                "Compile function returns limit",
                "FAIL"
            ],
            [
                "Compile function returns over limit",
                "FAIL"
            ],
            [
                "Validate initial table size over limit",
                "FAIL"
            ],
            [
                "Compile initial table size minimum",
                "FAIL"
            ],
            [
                "Compile initial table size limit",
                "FAIL"
            ],
            [
                "Compile initial table size over limit",
                "FAIL"
            ],
            [
                "Validate maximum table size over limit",
                "FAIL"
            ],
            [
                "Compile maximum table size minimum",
                "FAIL"
            ],
            [
                "Compile maximum table size limit",
                "FAIL"
            ],
            [
                "Compile maximum table size over limit",
                "FAIL"
            ],
            [
                "Validate element segments over limit",
                "FAIL"
            ],
            [
                "Compile element segments minimum",
                "FAIL"
            ],
            [
                "Compile element segments limit",
                "FAIL"
            ],
            [
                "Compile element segments over limit",
                "FAIL"
            ],
            [
                "Validate tables over limit",
                "FAIL"
            ],
            [
                "Compile tables minimum",
                "FAIL"
            ],
            [
                "Compile tables limit",
                "FAIL"
            ],
            [
                "Compile tables over limit",
                "FAIL"
            ],
            [
                "Validate memories over limit",
                "FAIL"
            ],
            [
                "Compile memories minimum",
                "FAIL"
            ],
            [
                "Compile memories limit",
                "FAIL"
            ],
            [
                "Compile memories over limit",
                "FAIL"
            ],
            [
                "Async compile types over limit",
                "FAIL"
            ],
            [
                "Async compile functions over limit",
                "FAIL"
            ],
            [
                "Async compile imports over limit",
                "FAIL"
            ],
            [
                "Async compile exports limit",
                "FAIL"
            ],
            [
                "Async compile exports over limit",
                "FAIL"
            ],
            [
                "Async compile globals over limit",
                "FAIL"
            ],
            [
                "Async compile data segments over limit",
                "FAIL"
            ],
            [
                "Async compile initial declared memory pages over limit",
                "FAIL"
            ],
            [
                "Async compile maximum declared memory pages over limit",
                "FAIL"
            ],
            [
                "Async compile initial imported memory pages over limit",
                "FAIL"
            ],
            [
                "Async compile maximum imported memory pages over limit",
                "FAIL"
            ],
            [
                "Async compile function size limit",
                "FAIL"
            ],
            [
                "Async compile function size over limit",
                "FAIL"
            ],
            [
                "Async compile function locals over limit",
                "FAIL"
            ],
            [
                "Async compile function params over limit",
                "FAIL"
            ],
            [
                "Async compile function params+locals minimum",
                "FAIL"
            ],
            [
                "Async compile function params+locals limit",
                "FAIL"
            ],
            [
                "Async compile function params+locals over limit",
                "FAIL"
            ],
            [
                "Async compile function returns over limit",
                "FAIL"
            ],
            [
                "Async compile initial table size over limit",
                "FAIL"
            ],
            [
                "Async compile maximum table size over limit",
                "FAIL"
            ],
            [
                "Async compile element segments over limit",
                "FAIL"
            ],
            [
                "Async compile tables over limit",
                "FAIL"
            ],
            [
                "Async compile memories over limit",
                "FAIL"
            ]
        ],
        "memory/buffer.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ],
            [
                "Setting (sloppy mode)",
                "FAIL"
            ],
            [
                "Setting (strict mode)",
                "FAIL"
            ]
        ],
        "memory/constructor.any.js": [
            [
                "length",
                "FAIL"
            ],
            [
                "No arguments",
                "FAIL"
            ],
            [
                "Invalid descriptor argument",
                "FAIL"
            ],
            [
                "Undefined initial value in descriptor",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: NaN",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: NaN",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: Infinity",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: Infinity",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: -Infinity",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: -Infinity",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: -1",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: -1",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: 4294967296",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: 4294967296",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: 68719476736",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: 68719476736",
                "FAIL"
            ],
            [
                "Initial value exceeds maximum",
                "FAIL"
            ],
            [
                "Order of evaluation for descriptor",
                "FAIL"
            ],
            [
                "Zero initial",
                "FAIL"
            ],
            [
                "Non-zero initial",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "memory/grow.any.js": [
            [
                "Zero initial",
                "FAIL"
            ],
            [
                "Zero initial with valueOf",
                "FAIL"
            ],
            [
                "Non-zero initial",
                "FAIL"
            ],
            [
                "Zero initial with respected maximum",
                "FAIL"
            ],
            [
                "Zero initial with respected maximum grown twice",
                "FAIL"
            ],
            [
                "Zero initial growing too much",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "memory/toString.any.js": [
            [
                "Object.prototype.toString on an Memory",
                "FAIL"
            ]
        ],
        "module/constructor.any.js": [
            [
                "Invalid arguments",
                "FAIL"
            ],
            [
                "Empty buffer",
                "FAIL"
            ],
            [
                "Prototype",
                "FAIL"
            ],
            [
                "Extensibility",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "module/customSections.any.js": [
            [
                "Missing arguments",
                "FAIL"
            ],
            [
                "Branding",
                "FAIL"
            ],
            [
                "Empty module",
                "FAIL"
            ],
            [
                "Empty module: array caching",
                "FAIL"
            ],
            [
                "Custom sections",
                "FAIL"
            ],
            [
                "Custom sections with surrogate pairs",
                "FAIL"
            ],
            [
                "Custom sections with U+FFFD",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "module/exports.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Empty module",
                "FAIL"
            ],
            [
                "Empty module: array caching",
                "FAIL"
            ],
            [
                "exports",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "module/imports.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Return type",
                "FAIL"
            ],
            [
                "Empty module",
                "FAIL"
            ],
            [
                "Empty module: array caching",
                "FAIL"
            ],
            [
                "imports",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "module/toString.any.js": [
            [
                "Object.prototype.toString on an Module",
                "FAIL"
            ]
        ],
        "table/constructor.any.js": [
            [
                "length",
                "FAIL"
            ],
            [
                "No arguments",
                "FAIL"
            ],
            [
                "Empty descriptor",
                "FAIL"
            ],
            [
                "Invalid descriptor argument",
                "FAIL"
            ],
            [
                "Undefined initial value in descriptor",
                "FAIL"
            ],
            [
                "Undefined element value in descriptor",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: NaN",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: NaN",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: Infinity",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: Infinity",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: -Infinity",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: -Infinity",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: -1",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: -1",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: 4294967296",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: 4294967296",
                "FAIL"
            ],
            [
                "Out-of-range initial value in descriptor: 68719476736",
                "FAIL"
            ],
            [
                "Out-of-range maximum value in descriptor: 68719476736",
                "FAIL"
            ],
            [
                "Initial value exceeds maximum",
                "FAIL"
            ],
            [
                "Basic (zero)",
                "FAIL"
            ],
            [
                "Basic (non-zero)",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ],
            [
                "Proxy descriptor",
                "FAIL"
            ],
            [
                "Type conversion for descriptor.element",
                "FAIL"
            ],
            [
                "Order of evaluation for descriptor",
                "FAIL"
            ]
        ],
        "table/get-set.any.js": [
            [
                "Basic",
                "FAIL"
            ],
            [
                "Growing",
                "FAIL"
            ],
            [
                "Setting out-of-bounds",
                "FAIL"
            ],
            [
                "Setting non-function",
                "FAIL"
            ],
            [
                "Setting non-wasm function",
                "FAIL"
            ],
            [
                "Setting non-wasm arrow function",
                "FAIL"
            ],
            [
                "Order of argument conversion",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "table/grow.any.js": [
            [
                "Basic",
                "FAIL"
            ],
            [
                "Reached maximum",
                "FAIL"
            ],
            [
                "Exceeded maximum",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ]
        ],
        "table/length.any.js": [
            [
                "Branding",
                "FAIL"
            ],
            [
                "Stray argument",
                "FAIL"
            ],
            [
                "Setting (sloppy mode)",
                "FAIL"
            ],
            [
                "Setting (strict mode)",
                "FAIL"
            ]
        ],
        "table/toString.any.js": [
            [
                "Object.prototype.toString on an Table",
                "FAIL"
            ]
        ]
    }
});