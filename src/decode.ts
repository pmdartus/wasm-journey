import { ValueType, Module } from './syntax';

const MAGIC_NUMBER = 0x0061736d;
const VERSION_NUMBER = 0x01000000;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-section
const SECTION_ID_CUSTOM = 0;
const SECTION_ID_TYPE = 1;
const SECTION_ID_IMPORT = 2;
const SECTION_ID_FUNCTION = 3;
const SECTION_ID_TABLE = 4;
const SECTION_ID_MEMORY = 5;
const SECTION_ID_GLOBAL = 6;
const SECTION_ID_EXPORT = 7;
const SECTION_ID_START = 8;
const SECTION_ID_ELEMENT = 9;
const SECTION_ID_CODE = 10;
const SECTION_ID_DATA = 11;

// https://webassembly.github.io/spec/core/binary/types.html#function-types
const FUNCTION_TYPE_PREFIX = 0x60;

// https://webassembly.github.io/spec/core/binary/types.html#binary-valtype
const VALUE_TYPE_I32 = 0x7f;
const VALUE_TYPE_I64 = 0x7e;
const VALUE_TYPE_F32 = 0x7d;
const VALUE_TYPE_F64 = 0x7c;

interface Parser {
    source: DataView;
    offset: number;
}

function consumeUInt8(parser: Parser): number {
    const value = parser.source.getUint8(parser.offset);
    parser.offset++;
    return value;
}

function consumeUInt32(parser: Parser): number {
    const value = parser.source.getUint32(parser.offset);
    parser.offset += 4;
    return value;
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-valtype
function decodeValueType(parser: Parser): ValueType {
    switch (consumeUInt8(parser)) {
        case VALUE_TYPE_I32:
            return ValueType.i32;

        case VALUE_TYPE_I64:
            return ValueType.i64;

        case VALUE_TYPE_F32:
            return ValueType.f32;

        case VALUE_TYPE_F64:
            return ValueType.f64;

        default:
            throw new Error('Invalid value type');
    }
}

// https://webassembly.github.io/spec/core/binary/types.html#function-types
function decodeTypeSection(parser: Parser, module: Module) {
    if (consumeUInt8(parser) !== FUNCTION_TYPE_PREFIX) {
        throw new Error('Invalid function type prefix');
    }

    const params: ValueType[] = [];
    const results: ValueType[] = [];

    const paramsVecSize = consumeUInt8(parser);
    for (let i = 0; i < paramsVecSize; i++) {
        const valueType = decodeValueType(parser);
        params.push(valueType);
    }

    const resultsVecSize = consumeUInt8(parser);
    for (let i = 0; i < resultsVecSize; i++) {
        const valueType = decodeValueType(parser);
        results.push(valueType);
    }

    module.types.push({
        params,
        results,
    });
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-section
function decodeSection(parser: Parser, module: Module) {
    const type = consumeUInt8(parser);

    // TODO: Something need to be done here when the size of the `u32` is large.
    // For now we don't care about it.
    consumeUInt8(parser);

    switch (type) {
        // https://webassembly.github.io/spec/core/binary/modules.html#binary-typesec
        case SECTION_ID_TYPE:
            const typeVecSize = consumeUInt8(parser);
            for (let i = 0; i < typeVecSize; i++) {
                decodeTypeSection(parser, module);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
        case SECTION_ID_EXPORT:
            const exportVecSize = consumeUInt8(parser);
            for (let i = 0; i < exportVecSize; i++) {}
            break;

        default:
            break;
    }
}

export function decode(source: ArrayBuffer): Module {
    const parser: Parser = {
        source: new DataView(source),
        offset: 0,
    };

    const module: Module = {
        exports: [],
        funcs: [],
        types: [],
    };

    if (consumeUInt32(parser) !== MAGIC_NUMBER) {
        throw new Error('Invalid magic number');
    }

    if (consumeUInt32(parser) !== VERSION_NUMBER) {
        throw new Error('Invalid version number');
    }

    decodeSection(parser, module);

    return module;
}
