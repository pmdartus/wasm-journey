import {
    ValueType,
    Module,
    IndexType,
    Instruction,
    UnaryInstruction,
    BinaryInstruction,
    PrimaryExpression,
    Expression,
} from './syntax';

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

// https://webassembly.github.io/spec/core/appendix/index-instructions.html
// Note: Instead of having the op codes in plain variable to avoid having to lookup those properties
// in an object which should greatly speed up the parsing by avoiding extra property lookup for each
// instruction.
const OPCODE_UNREACHABLE = 0x00;
const OPCODE_NOP = 0x01;

const OPCODE_BLOCK = 0x02;
const OPCODE_LOOP = 0x03;
const OPCODE_IF = 0x04;
const OPCODE_ELSE = 0x05;

// 0x06: illegal operation
// 0x07: illegal operation
// 0x08: illegal operation
// 0x09: illegal operation
// 0x0a: illegal operation

const OPCODE_END = 0x0b;

const OPCODE_BR = 0x0c;
const OPCODE_BR_IF = 0x0d;
const OPCODE_BR_TABLE = 0x0e;
const OPCODE_RETURN = 0x0f;

const OPCODE_CALL = 0x10;
const OPCODE_CALL_INDIRECT = 0x11;

// 0x12: illegal operation
// 0x13: illegal operation
// 0x14: illegal operation
// 0x15: illegal operation
// 0x16: illegal operation
// 0x17: illegal operation
// 0x18: illegal operation
// 0x19: illegal operation

const OPCODE_DROP = 0x1a;
const OPCODE_SELECT = 0x1b;

// 0x1c: illegal operation
// 0x1d: illegal operation
// 0x1e: illegal operation
// 0x1f: illegal operation

const OPCODE_GET_LOCAL = 0x20;
const OPCODE_SET_LOCAL = 0x21;
const OPCODE_TEE_LOCAL = 0x22;
const OPCODE_GET_GLOBAL = 0x23;
const OPCODE_SET_GLOBAL = 0x24;

// 0x25: illegal operation
// 0x26: illegal operation
// 0x27: illegal operation

const OPCODE_LOAD_u32 = 0x28;
const OPCODE_LOAD_U64 = 0x29;
const OPCODE_LOAD_F32 = 0x2a;
const OPCODE_LOAD_F64 = 0x2b;
const OPCODE_LOAD8_S_U32 = 0x2c;
const OPCODE_LOAD8_U_U32 = 0x2d;
const OPCODE_LOAD16_S_U32 = 0x2e;
const OPCODE_LOAD16_U_U32 = 0x2f;
const OPCODE_LOAD8_S_U64 = 0x30;
const OPCODE_LOAD8_U_U64 = 0x31;
const OPCODE_LOAD16_S_U64 = 0x32;
const OPCODE_LOAD16_U_U64 = 0x33;
const OPCODE_LOAD32_S_U64 = 0x34;
const OPCODE_LOAD32_U_U64 = 0x35;

const OPCODE_STORE_U32 = 0x36;
const OPCODE_STORE_U64 = 0x37;
const OPCODE_STORE_F32 = 0x38;
const OPCODE_STORE_F64 = 0x39;
const OPCODE_STORE8_U32 = 0x3a;
const OPCODE_STORE16_U32 = 0x3b;
const OPCODE_STORE8_U64 = 0x3c;
const OPCODE_STORE16_U64 = 0x3d;
const OPCODE_STORE32_U64 = 0x3e;

const OPCODE_CURRENT_MEMORY = 0x3f;
const OPCODE_GROW_MEMORY = 0x40;

const CONST_I32 = 0x41;
const CONST_I64 = 0x42;
const CONST_F32 = 0x43;
const CONST_F64 = 0x44;

const OPCODE_EQZ_I32 = 0x45;
const OPCODE_EQ_I32 = 0x46;
const OPCODE_NE_I32 = 0x47;
const OPCODE_LT_S_I32 = 0x48;
const OPCODE_LT_U_I32 = 0x49;
const OPCODE_GT_S_I32 = 0x4a;
const OPCODE_GT_U_I32 = 0x4b;
const OPCODE_LE_S_I32 = 0x4c;
const OPCODE_LE_U_I32 = 0x4d;
const OPCODE_GE_S_I32 = 0x4e;
const OPCODE_GE_U_I32 = 0x4f;

const OPCODE_EQZ_I64 = 0x50;
const OPCODE_EQ_I64 = 0x51;
const OPCODE_NE_I64 = 0x52;
const OPCODE_LT_S_I64 = 0x53;
const OPCODE_LT_U_I64 = 0x54;
const OPCODE_GT_S_I64 = 0x55;
const OPCODE_GT_U_I64 = 0x56;
const OPCODE_LE_S_I64 = 0x57;
const OPCODE_LE_U_I64 = 0x58;
const OPCODE_GE_S_I64 = 0x59;
const OPCODE_GE_U_I64 = 0x5a;

const OPCODE_EQ_F32 = 0x5b;
const OPCODE_NE_F32 = 0x5c;
const OPCODE_LT_F32 = 0x5d;
const OPCODE_GT_F32 = 0x5e;
const OPCODE_LE_F32 = 0x5f;
const OPCODE_GE_F32 = 0x60;

const OPCODE_EQ_F64 = 0x61;
const OPCODE_NE_F64 = 0x62;
const OPCODE_LT_F64 = 0x63;
const OPCODE_GT_F64 = 0x64;
const OPCODE_LE_F64 = 0x65;
const OPCODE_GE_F64 = 0x66;

const OPCODE_CLZ_I32 = 0x67;
const OPCODE_CTZ_I32 = 0x68;
const OPCODE_POPCNT_I32 = 0x69;
const OPCODE_ADD_I32 = 0x6a;
const OPCODE_SUB_I32 = 0x6b;
const OPCODE_MUL_I32 = 0x6c;
const OPCODE_DIV_S_I32 = 0x6d;
const OPCODE_DIV_U_I32 = 0x6e;
const OPCODE_REM_S_I32 = 0x6f;
const OPCODE_REM_U_I32 = 0x70;
const OPCODE_AND_I32 = 0x71;
const OPCODE_OR_I32 = 0x72;
const OPCODE_XOR_I32 = 0x73;
const OPCODE_SHL_I32 = 0x74;
const OPCODE_SHR_S_I32 = 0x75;
const OPCODE_SHR_U_I32 = 0x76;
const OPCODE_ROTL_I32 = 0x77;
const OPCODE_ROTR_I32 = 0x78;

const OPCODE_CLZ_I64 = 0x79;
const OPCODE_CTZ_I64 = 0x7a;
const OPCODE_POPCNT_I64 = 0x7b;
const OPCODE_ADD_I64 = 0x7c;
const OPCODE_SUB_I64 = 0x7d;
const OPCODE_MUL_I64 = 0x7e;
const OPCODE_DIV_S_I64 = 0x7f;
const OPCODE_DIV_U_I64 = 0x80;
const OPCODE_REM_S_I64 = 0x81;
const OPCODE_REM_U_I64 = 0x82;
const OPCODE_AND_I64 = 0x83;
const OPCODE_OR_I64 = 0x84;
const OPCODE_XOR_I64 = 0x85;
const OPCODE_SHL_I64 = 0x86;
const OPCODE_SHR_S_I64 = 0x87;
const OPCODE_SHR_U_I64 = 0x88;
const OPCODE_ROTL_I64 = 0x89;
const OPCODE_ROTR_I64 = 0x8a;

const OPCODE_ABS_F32 = 0x8b;
const OPCODE_NEG_F32 = 0x8c;
const OPCODE_cEIL_F32 = 0x8d;
const OPCODE_FLOOR_F32 = 0x8e;
const OPCODE_TRUNC_F32 = 0x8f;
const OPCODE_NEAREST_F32 = 0x90;
const OPCODE_SQRT_F32 = 0x91;
const OPCODE_ADD_F32 = 0x92;
const OPCODE_SUB_F32 = 0x93;
const OPCODE_MUL_F32 = 0x94;
const OPCODE_DIV_F32 = 0x95;
const OPCODE_MIN_F32 = 0x96;
const OPCODE_MAX_F32 = 0x97;
const OPCODE_COPYSIGN_F32 = 0x98;

const OPCODE_ABS_F64 = 0x99;
const OPCODE_NEG_F64 = 0x9a;
const OPCODE_cEIL_F64 = 0x9b;
const OPCODE_FLOOR_F64 = 0x9c;
const OPCODE_TRUNC_F64 = 0x9d;
const OPCODE_NEAREST_F64 = 0x9e;
const OPCODE_SQRT_F64 = 0x9f;
const OPCODE_ADD_F64 = 0xa0;
const OPCODE_SUB_F64 = 0xa1;
const OPCODE_MUL_F64 = 0xa2;
const OPCODE_DIV_F64 = 0xa3;
const OPCODE_MIN_F64 = 0xa4;
const OPCODE_MAX_F64 = 0xa5;
const OPCODE_COPYSIGN_F64 = 0xa6;

const OPCODE_WRAP = 0xa7;
const OPCODE_TRUNC_S_F32_I32 = 0xa8;
const OPCODE_TRUNC_U_F32_I32 = 0xa9;
const OPCODE_TRUNC_S_F64 = 0xaa;
const OPCODE_TRUNC_U_F64 = 0xab;
const OPCODE_EXTEND_S = 0xac;
const OPCODE_EXTEND_U = 0xad;
const OPCODE_TRUNC_S_F32_I64 = 0xae;
const OPCODE_TRUNC_U_F32_I64 = 0xaf;
const OPCODE_TRUNC_S_F64_I64 = 0xb0;
const OPCODE_TRUNC_U_F64_I64 = 0xb1;
const OPCODE_CONVERT_S_I32_F32 = 0xb2;
const OPCODE_CONVERT_U_I32_F32 = 0xb3;
const OPCODE_CONVERT_S_I64_F32 = 0xb4;
const OPCODE_CONVERT_U_I64_F32 = 0xb5;
const OPCODE_DEMOTE = 0xb6;
const OPCODE_CONVERT_S_I32_F64 = 0xb7;
const OPCODE_CONVERT_U_I32_F64 = 0xb8;
const OPCODE_CONVERT_S_I64_F64 = 0xb9;
const OPCODE_CONVERT_U_I64_F64 = 0xba;
const OPCODE_PROMOTE = 0xbb;

const OPCODE_REINTERPRET_F32 = 0xbc;
const OPCODE_REINTERPRET_F64 = 0xbd;
const OPCODE_REINTERPRET_I32 = 0xbe;
const OPCODE_REINTERPRET_I64 = 0xbf;

/**
 * PARSER
 */

interface Parser {
    source: DataView;
    offset: number;
}

function peakByte(parser: Parser): number {
    if (isEndOfFile(parser)) {
        throw new TypeError('Unexpected enf of file');
    }

    return parser.source.getUint8(parser.offset);
}

function consumeByte(parser: Parser): number {
    if (isEndOfFile(parser)) {
        throw new TypeError('Unexpected enf of file');
    }

    const value = parser.source.getUint8(parser.offset);
    parser.offset++;
    return value;
}

function consumeBytes(parser: Parser, count: number): number {
    let res = 0;

    for (let i = 0; i < count; i++) {
        res = (res << 8) + consumeByte(parser);
    }

    return res;
}

function isEndOfFile(parser: Parser): boolean {
    return parser.offset === parser.source.byteLength;
}

/**
 * HELPERS
 */

// TODO: Need to come back to this to make the code cleaner!
//
// Wiki: https://webassembly.github.io/spec/core/binary/values.html#integers
// Implementation borrowed from: https://www.javatips.net/api/android-libcore64-master/dex/src/main/java/com/android/dex/Leb128.java
//
// https://en.wikipedia.org/wiki/LEB128
function decodeUInt32(parser: Parser) {
    let result = 0;
    let count = 0;

    let current: number;
    do {
        current = consumeByte(parser);
        result |= (current & 0x7f) << (count * 7);
        count++;
    } while ((current & 0x80) === 0x80);

    return result;
}

function primaryExpression(opcode: number): PrimaryExpression {
    return {
        type: 'primary',
        opcode,
    };
}

function unaryInstruction(opcode: number, param: ValueType): UnaryInstruction {
    return {
        type: 'unary',
        opcode,
        param,
    };
}

/**
 * DECODE
 */

// https://webassembly.github.io/spec/core/binary/types.html#binary-valtype
function decodeValueType(parser: Parser): ValueType {
    switch (consumeByte(parser)) {
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
    const vecLength = decodeUInt32(parser);

    // TODO: Need to better understand this encoding
    for (let i = 0; i < vecLength; i++) {
        const b1 = consumeByte(parser);
        name += String.fromCharCode(b1);
    }

    return name;
}

// https://webassembly.github.io/spec/core/binary/types.html#function-types
function decodeType(parser: Parser, module: Module) {
    if (consumeByte(parser) !== FUNCTION_TYPE_PREFIX) {
        throw new Error('Invalid function type prefix');
    }

    const params: ValueType[] = [];
    const results: ValueType[] = [];

    const paramsVecSize = decodeUInt32(parser);
    for (let i = 0; i < paramsVecSize; i++) {
        const valueType = decodeValueType(parser);
        params.push(valueType);
    }

    const resultsVecSize = decodeUInt32(parser);
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
    switch (consumeByte(parser)) {
        case EXPORT_DESC_TYPE_FUNCTION:
            type = IndexType.function;
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

    const index = decodeUInt32(parser);

    module.exports.push({
        name,
        desc: {
            type,
            index,
        },
    });
}

// https://webassembly.github.io/spec/core/binary/instructions.html#control-instructions
function decodeInstruction(parser: Parser): Instruction {
    const opcode = consumeByte(parser);

    switch (opcode) {
        case OPCODE_GET_LOCAL:
            return unaryInstruction(opcode, decodeUInt32(parser));
        case OPCODE_ADD_I32:
            return primaryExpression(opcode);
        default: {
            throw new TypeError(`Invalid opcode ${opcode}`);
        }
    }
}

// https://webassembly.github.io/spec/core/binary/instructions.html#binary-expr
function decodeExpression(parser: Parser): Expression {
    const instructions: Instruction[] = [];

    while (peakByte(parser) !== OPCODE_END) {
        const instruction = decodeInstruction(parser);
        instructions.push(instruction);
    }
    
    // Eat the OPCODE_END byte if necessary.
    consumeByte(parser);

    return { instructions };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
function decodeCode(parser: Parser, module: Module) {
    const locals: ValueType[] = [];

    const localVecSize = decodeUInt32(parser);
    for (let i = 0; i < localVecSize; i++) {
        const localCount = decodeUInt32(parser);
        const valueType = decodeValueType(parser);

        for (let i = 0; i < localCount; i++) {
            locals.push(valueType);
        }
    }

    const body = decodeExpression(parser);

    module.codes.push({
        locals,
        body
    });
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-section
function decodeSection(parser: Parser, module: Module) {
    const type = consumeByte(parser);
    decodeUInt32(parser);

    switch (type) {
        // https://webassembly.github.io/spec/core/binary/modules.html#binary-typesec
        case SECTION_ID_TYPE:
            const typeVecSize = decodeUInt32(parser);
            for (let i = 0; i < typeVecSize; i++) {
                decodeType(parser, module);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-funcsec
        case SECTION_ID_FUNCTION:
            const functionVecSize = decodeUInt32(parser);
            for (let i = 0; i < functionVecSize; i++) {
                const funTypeIndex = decodeUInt32(parser);
                module.funcs.push({
                    type: IndexType.function,
                    index: funTypeIndex
                });
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
        case SECTION_ID_EXPORT:
            const exportVecSize = consumeByte(parser);
            for (let i = 0; i < exportVecSize; i++) {
                decodeExport(parser, module);
            }
            break;

        // https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
        case SECTION_ID_CODE:
            const codeVecSize = decodeUInt32(parser);
            for (let i = 0; i < codeVecSize; i++) {
                decodeUInt32(parser);
                decodeCode(parser, module);
            }
            break;

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
        codes: [],
    };

    if (consumeBytes(parser, 4) !== MAGIC_NUMBER) {
        throw new Error('Invalid magic number');
    }

    if (consumeBytes(parser, 4) !== VERSION_NUMBER) {
        throw new Error('Invalid version number');
    }

    while (!isEndOfFile(parser)) {
        decodeSection(parser, module);
    }

    return module;
}
