import { ValueType, Module, Index, IndexType } from './syntax';

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

// https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
const EXPORT_DESC_TYPE_FUNCTION = 0x00;
const EXPORT_DESC_TYPE_TABLE = 0x01;
const EXPORT_DESC_TYPE_MEMORY = 0x02;
const EXPORT_DESC_TYPE_GLOBAL = 0x03;

// https://webassembly.github.io/spec/core/binary/instructions.html#binary-expr
const OPCODE_END = 0x0b;

const OPCODE_UNREACHABLE = 0x00;
const OPCODE_NOP = 0x01;

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

// https://webassembly.github.io/spec/core/binary/values.html#binary-name
function decodeName(parser: Parser): string {
    let name: string = '';
    const vecLength = consumeUInt8(parser);
    
    // TODO: Need to better understand this encoding
    for (let i = 0; i < vecLength; i++) {
        const b1 = consumeUInt8(parser);
        name += String.fromCharCode(b1);
    }

    return name;
}

// https://webassembly.github.io/spec/core/binary/types.html#function-types
function decodeType(parser: Parser, module: Module) {
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

// https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
function decodeExport(parser: Parser, module: Module) {
    const name = decodeName(parser);
    
    let type: IndexType;
    switch (consumeUInt8(parser)) {
        case EXPORT_DESC_TYPE_FUNCTION:
            type = IndexType.function
            break;
        
        case EXPORT_DESC_TYPE_TABLE:
            type = IndexType.table;
        
        case EXPORT_DESC_TYPE_MEMORY:
            type = IndexType.memory;

        case EXPORT_DESC_TYPE_GLOBAL:
            type = IndexType.global;

        default:
            throw new Error('Invalid export descriptor type');
    }

    // TODO: Something need to be done here when the size of the `u32` is large.
    const index = consumeUInt8(parser);

    module.exports.push({
        name,
        desc: {
            type,
            index,
        }
    })
}

function decodeExpression(parser: Parser) {
    const instructions = [];
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
function decodeCode(parser: Parser, module: Module) {
    const locals: ValueType[] = [];

    const localVecSize = consumeUInt8(parser);
    for (let i = 0; i < localVecSize; i++) {
        // TODO: u32
        const localCount = consumeUInt8(parser);
        const valueType = decodeValueType(parser);

        for (let i = 0; i < localCount; i++) {
            locals.push(valueType);
        }
    }

    const expression = decodeExpression(parser);
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-section
function decodeSection(parser: Parser, module: Module) {
    const type = consumeUInt8(parser);

    // TODO: Something need to be done here when the size of the `u32` is large.
    // For now we don't care about it.
    consumeUInt8(parser);

    console.log(type)

    switch (type) {
        // https://webassembly.github.io/spec/core/binary/modules.html#binary-typesec
        case SECTION_ID_TYPE:
            const typeVecSize = consumeUInt8(parser);
            for (let i = 0; i < typeVecSize; i++) {
                decodeType(parser, module);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-funcsec
        case SECTION_ID_FUNCTION:
            const functionVecSize = consumeUInt8(parser);
            for (let i = 0; i < functionVecSize; i++) {
                // TODO: Something for u32
                const typeIndex = consumeUInt8(parser);
                module.funcs.push(typeIndex);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
        case SECTION_ID_EXPORT:
            const exportVecSize = consumeUInt8(parser);
            for (let i = 0; i < exportVecSize; i++) {
                decodeExport(parser, module);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
        case SECTION_ID_CODE:
            const codeVecSize = consumeUInt8(parser);
            for (let i = 0; i < codeVecSize; i++) {
                // codeSize: Not needed for the actually parsing but can be used for validate purposes.
                consumeUInt8(parser);
                decodeCode(parser, module);
            }

        default:
            throw new Error('Unknown section type');
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
    decodeSection(parser, module);
    decodeSection(parser, module);
    decodeSection(parser, module);

    return module;
}
