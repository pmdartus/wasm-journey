import {
    ValueType,
    Module,
    Expression,
    FunctionType,
    Export,
    FunctionIndex,
    TypeIndex,
    Instruction,
} from './structure';
import {
    MAGIC_NUMBER,
    VERSION_NUMBER,
    TypeCode,
    SectionId,
    OpCode,
    ExportKind,
} from './constants';

/**
 * PARSER
 */

interface Parser {
    source: DataView;
    offset: number;
}

function peakByte(parser: Parser): number | null {
    if (isEndOfFile(parser)) {
        return null;
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

/**
 * DECODE
 */

// https://webassembly.github.io/spec/core/binary/types.html#binary-valtype
function decodeValueType(parser: Parser): ValueType {
    switch (consumeByte(parser)) {
        case TypeCode.I32:
            return ValueType.i32;

        case TypeCode.I64:
            return ValueType.i64;

        case TypeCode.F32:
            return ValueType.f32;

        case TypeCode.F64:
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
function decodeType(parser: Parser): FunctionType {
    if (consumeByte(parser) !== TypeCode.Func) {
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

    return {
        params,
        results,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-typesec
function decodeTypeSection(parser: Parser): FunctionType[] {
    const types: FunctionType[] = [];

    if (peakByte(parser) !== SectionId.Type) {
        return types;
    }
    const _sectionId = consumeByte(parser);
    const _sectionSize = decodeUInt32(parser);

    const typeVecSize = decodeUInt32(parser);
    for (let i = 0; i < typeVecSize; i++) {
        types.push(decodeType(parser));
    }

    return types;
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-funcsec
function decodeFunctionSection(parser: Parser): TypeIndex[] {
    const functions: TypeIndex[] = [];

    if (peakByte(parser) !== SectionId.Function) {
        return functions;
    }
    const _sectionId = consumeByte(parser);
    const _sectionSize = decodeUInt32(parser);

    const functionVecSize = decodeUInt32(parser);
    for (let i = 0; i < functionVecSize; i++) {
        const funTypeIndex = decodeUInt32(parser);
        functions.push({
            type: 'type',
            index: funTypeIndex,
        });
    }

    return functions;
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
function decodeExport(parser: Parser): Export {
    const name = decodeName(parser);

    const type = consumeByte(parser);
    const index = decodeUInt32(parser);

    let descriptor: FunctionIndex;
    switch (type) {
        case ExportKind.Function:
            descriptor = {
                type: 'function',
                index,
            };
            break;

        default:
            throw new Error('Invalid export descriptor type');
    }

    return {
        name,
        descriptor,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-exportsec
function decodeExportSection(parser: Parser): Export[] {
    const exports: Export[] = [];

    if (peakByte(parser) !== SectionId.Export) {
        return exports;
    }
    const _sectionId = consumeByte(parser);
    const _sectionSize = decodeUInt32(parser);

    const exportVecSize = consumeByte(parser);
    for (let i = 0; i < exportVecSize; i++) {
        exports.push(decodeExport(parser));
    }

    return exports;
}

// https://webassembly.github.io/spec/core/binary/instructions.html#control-instructions
function decodeInstruction(parser: Parser): Instruction {
    const opcode = consumeByte(parser);

    switch (opcode) {
        case OpCode.GetLocal:
        case OpCode.SetLocal:
        case OpCode.TeeLocal:
        case OpCode.GetGlobal:
        case OpCode.SetGlobal:
            return {
                opcode,
                index: decodeUInt32(parser),
            };

        case OpCode.I32Add:
            return {
                opcode,
            };

        default: {
            throw new TypeError(`Invalid opcode ${opcode}`);
        }
    }
}

// https://webassembly.github.io/spec/core/binary/instructions.html#binary-expr
function decodeExpression(parser: Parser): Expression {
    const instructions: Instruction[] = [];

    while (peakByte(parser) !== OpCode.End) {
        const instruction = decodeInstruction(parser);
        instructions.push(instruction);
    }

    const _opCodeEnd = consumeByte(parser);

    return { instructions };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
function decodeCode(
    parser: Parser,
): {
    locals: ValueType[];
    body: Expression;
} {
    const _codeSize = decodeUInt32(parser);

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
    return {
        locals,
        body,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-codesec
function decodeCodeSection(
    parser: Parser,
): {
    locals: ValueType[];
    body: Expression;
}[] {
    const codes: {
        locals: ValueType[];
        body: Expression;
    }[] = [];

    if (peakByte(parser) !== SectionId.Code) {
        return codes;
    }
    const _sectionId = consumeByte(parser);
    const _sectionSize = decodeUInt32(parser);

    const codeVecSize = decodeUInt32(parser);
    for (let i = 0; i < codeVecSize; i++) {
        codes.push(decodeCode(parser));
    }

    return codes;
}

export function decode(source: ArrayBuffer): Module {
    const parser: Parser = {
        source: new DataView(source),
        offset: 0,
    };

    if (consumeBytes(parser, 4) !== MAGIC_NUMBER) {
        throw new Error('Invalid magic number');
    }

    if (consumeBytes(parser, 4) !== VERSION_NUMBER) {
        throw new Error('Invalid version number');
    }

    const types = decodeTypeSection(parser);
    const functions = decodeFunctionSection(parser);
    const exports = decodeExportSection(parser);
    const codes = decodeCodeSection(parser);

    return {
        types,
        functions: functions.map((type, index) => {
            return {
                type,
                ...codes[index],
            };
        }),
        tables: [],
        memories: [],
        globals: [],
        elements: [],
        datas: [],
        imports: [],
        exports,
    };
}
