import {
    ValueType,
    Module,
    Expression,
    FunctionType,
    Export,
    FunctionIndex,
    TypeIndex,
    Instruction,
    CustomSection,
    Byte,
    Import,
    Table,
    Memory,
    Global,
    Data,
    TableIndex,
    MemoryIndex,
    GlobalIndex,
    TableType,
    ElementType,
    Limits,
    MemoryType,
    GlobalType,
    Index,
    Element,
    Start,
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
        throw new TypeError('Unexpected end of file');
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

// https://webassembly.github.io/spec/core/binary/conventions.html#vectors
function decodeVector<T>(parser: Parser, itemCallback: () => T): T[] {
    const items: T[] = [];
    const length = decodeUInt32(parser);

    for (let i = 0; i < length; i++) {
        items.push(itemCallback());
    }

    return items;
}

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
    const chars = decodeVector(parser, () => {
        const byte = consumeByte(parser);
        return String.fromCharCode(byte);
    });

    return chars.join('');
}

// https://webassembly.github.io/spec/core/binary/types.html#limits
function decodeLimits(parser: Parser): Limits {
    const limitTypeCode = consumeByte(parser);

    switch (limitTypeCode) {
        case 0x00:
            return {
                min: decodeUInt32(parser),
            };

        case 0x01:
            return {
                min: decodeUInt32(parser),
                max: decodeUInt32(parser),
            };

        default:
            throw new Error(`Invalid limit type ${limitTypeCode}`);
    }
}

// https://webassembly.github.io/spec/core/binary/modules.html#sections
function decodeSection<T>(
    parser: Parser,
    sectionId: SectionId,
    sectionCallback: (size: number) => T,
): T | undefined {
    if (peakByte(parser) !== sectionId) {
        return;
    }

    // Consume the section id if it matches.
    consumeByte(parser);

    const size = decodeUInt32(parser);
    const endOffset = parser.offset + size;

    const res = sectionCallback(size);

    // Assert the section has the expected size.
    if (parser.offset !== endOffset) {
        throw new Error('Invalid section size');
    }

    return res;
}

// https://webassembly.github.io/spec/core/binary/modules.html#custom-section
function decodeCustomSections(parser: Parser, customs: CustomSection[]): void {
    while (peakByte(parser) === SectionId.Custom) {
        decodeSection(parser, SectionId.Custom, size => {
            const sectionEndOffset = parser.offset + size;

            const name = decodeName(parser);
            const bytes: Byte[] = [];

            while (parser.offset < sectionEndOffset) {
                const byte = consumeByte(parser);
                bytes.push(byte);
            }

            customs.push({
                name,
                bytes,
            });
        });
    }
}

// https://webassembly.github.io/spec/core/binary/types.html#function-types
function decodeType(parser: Parser): FunctionType {
    if (consumeByte(parser) !== TypeCode.Func) {
        throw new Error('Invalid function type prefix');
    }

    const params = decodeVector(parser, () => {
        return decodeValueType(parser);
    });

    const results = decodeVector(parser, () => {
        return decodeValueType(parser);
    });

    return {
        params,
        results,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-typesec
function decodeTypeSection(parser: Parser): FunctionType[] {
    return (
        decodeSection(parser, SectionId.Type, () => {
            return decodeVector(parser, () => {
                return decodeType(parser);
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/modules.html#import-section
function decodeImportSection(parser: Parser): Import[] {
    return (
        decodeSection(parser, SectionId.Import, () => {
            return decodeVector(parser, () => {
                const module = decodeName(parser);
                const name = decodeName(parser);

                const typeCode = consumeByte(parser);
                const index = decodeUInt32(parser);

                let descriptor:
                    | FunctionIndex
                    | TableIndex
                    | MemoryIndex
                    | GlobalIndex;
                switch (typeCode) {
                    case 0x00:
                        descriptor = {
                            type: 'function',
                            index,
                        };
                        break;

                    case 0x01:
                        descriptor = {
                            type: 'table',
                            index,
                        };
                        break;

                    case 0x02:
                        descriptor = {
                            type: 'memory',
                            index,
                        };
                        break;

                    case 0x03:
                        descriptor = {
                            type: 'global',
                            index,
                        };
                        break;

                    default:
                        throw new Error(`Invalid descriptor type ${typeCode}`);
                }

                return {
                    module,
                    name,
                    descriptor,
                };
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-funcsec
function decodeFunctionSection(parser: Parser): TypeIndex[] {
    return (
        decodeSection(parser, SectionId.Function, () => {
            return decodeVector(parser, () => {
                const funTypeIndex = decodeUInt32(parser);
                return {
                    type: 'type',
                    index: funTypeIndex,
                };
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-tabletype
function decodeTableType(parser: Parser): TableType {
    let elementType: ElementType;

    const elementTypeCode = consumeByte(parser);
    switch (elementTypeCode) {
        case 0x70:
            elementType = ElementType.FuncRef;
            break;
        default:
            throw new Error(`Invalid element type`);
    }

    const limit = decodeLimits(parser);

    return {
        elementType,
        limit,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#table-section
function decodeTableSection(parser: Parser): Table[] {
    return (
        decodeSection(parser, SectionId.Table, () => {
            return decodeVector(parser, () => {
                const type = decodeTableType(parser);
                return { type };
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-memtype
function decodeMemoryType(parser: Parser): MemoryType {
    return decodeLimits(parser);
}

// https://webassembly.github.io/spec/core/binary/modules.html#memory-section
function decodeMemorySection(parser: Parser): Memory[] {
    return (
        decodeSection(parser, SectionId.Memory, () => {
            return decodeVector(parser, () => {
                const type = decodeMemoryType(parser);
                return { type };
            });
        }) || []
    );
}

function decodeGlobalType(parser: Parser): GlobalType {
    const valueType = decodeValueType(parser);

    let mutability: 'constant' | 'variable';
    const mutabilityCode = consumeByte(parser);
    switch (mutabilityCode) {
        case 0x00:
            mutability = 'constant';
            break;

        case 0x01:
            mutability = 'variable';

        default:
            throw new Error(`Invalid mutability code ${mutabilityCode}`);
    }

    return {
        valueType,
        mutability,
    };
}

// https://webassembly.github.io/spec/core/binary/modules.html#global-section
function decodeGlobalSection(parser: Parser): Global[] | undefined {
    return decodeSection(parser, SectionId.Global, () => {
        return decodeVector(parser, () => {
            const type = decodeGlobalType(parser);
            const initializer = decodeExpression(parser);

            return {
                type,
                initializer,
            };
        });
    });
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
    return (
        decodeSection(parser, SectionId.Export, () => {
            return decodeVector(parser, () => {
                return decodeExport(parser);
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/modules.html#start-section
function decodeStartSection(parser: Parser): Start | undefined {
    return decodeSection(parser, SectionId.Start, () => {
        const index = decodeUInt32(parser);
        return {
            function: index,
        };
    });
}

// https://webassembly.github.io/spec/core/binary/modules.html#element-section
function decodeElementSection(parser: Parser): Element[] {
    return (
        decodeSection(parser, SectionId.Elem, () => {
            return decodeVector(parser, () => {
                const table = decodeUInt32(parser);
                const offset = decodeExpression(parser);

                const initializer = decodeVector(parser, () => {
                    return decodeUInt32(parser);
                });

                return {
                    table,
                    offset,
                    initializer,
                };
            });
        }) || []
    );
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
    return (
        decodeSection(parser, SectionId.Code, () => {
            return decodeVector(parser, () => {
                return decodeCode(parser);
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/modules.html#data-section
function decodeDataSection(parser: Parser): Data[] {
    return (
        decodeSection(parser, SectionId.Data, () => {
            return decodeVector(parser, () => {
                const data = decodeUInt32(parser);
                const offset = decodeExpression(parser);
                const initializer = decodeVector(parser, () => {
                    return consumeByte(parser);
                });

                return {
                    data,
                    offset,
                    initializer,
                };
            });
        }) || []
    );
}

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
export function decode(source: ArrayBuffer): Module {
    const parser: Parser = {
        source: new DataView(source),
        offset: 0,
    };
    const customs: CustomSection[] = [];

    if (consumeBytes(parser, 4) !== MAGIC_NUMBER) {
        throw new Error('Invalid magic number');
    }

    if (consumeBytes(parser, 4) !== VERSION_NUMBER) {
        throw new Error('Invalid version number');
    }

    // Custom sections can be injected at any place in the section sequence. While other sections
    // can only appear once in a predefined order.
    decodeCustomSections(parser, customs);
    const types = decodeTypeSection(parser) || [];
    decodeCustomSections(parser, customs);
    const imports = decodeImportSection(parser) || [];
    decodeCustomSections(parser, customs);
    const functions = decodeFunctionSection(parser) || [];
    decodeCustomSections(parser, customs);
    const tables = decodeTableSection(parser) || [];
    decodeCustomSections(parser, customs);
    const memories = decodeMemorySection(parser) || [];
    decodeCustomSections(parser, customs);
    const globals = decodeGlobalSection(parser) || [];
    decodeCustomSections(parser, customs);
    const exports = decodeExportSection(parser) || [];
    decodeCustomSections(parser, customs);
    const start = decodeStartSection(parser);
    decodeCustomSections(parser, customs);
    const elements = decodeElementSection(parser) || [];
    decodeCustomSections(parser, customs);
    const codes = decodeCodeSection(parser);
    decodeCustomSections(parser, customs);
    const datas = decodeDataSection(parser);
    decodeCustomSections(parser, customs);

    if (!isEndOfFile(parser)) {
        throw new Error('Unexpected end of file');
    }

    const normalizedFunctions = functions.map((type, index) => {
        return {
            type,
            ...codes[index],
        };
    });

    const module: Module = {
        customs,
        types,
        functions: normalizedFunctions,
        tables,
        memories,
        globals,
        start,
        elements,
        datas,
        imports,
        exports,
    };

    return module;
}
