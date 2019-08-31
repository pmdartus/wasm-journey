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
    Element,
    Start,
    GlobalTypeMutability,
} from './structure';

import {
    MAGIC_NUMBER,
    VERSION_NUMBER,
    TypeCode,
    SectionId,
    OpCode,
    ExportKind,
    ImportKind,
} from './constants';

//#region Parser
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
//#endregion Parser

//#region Conventions
// https://webassembly.github.io/spec/core/binary/conventions.html#vectors
function decodeVector<T>(parser: Parser, itemCallback: () => T): T[] {
    const items: T[] = [];
    const length = decodeUInt32(parser);

    for (let i = 0; i < length; i++) {
        items.push(itemCallback());
    }

    return items;
}
//#endregion Conventions

//#region Values
/**
 * LEB128 stance for Little Endian Base 218 which is a variable length code compression for integer.
 * More details: https://en.wikipedia.org/wiki/LEB128
 */

const NUMBER_OF_BYTES_U32 = 4; // 32/8
const NUMBER_OF_BYTES_U64 = 8; // 64/8

// Base on the specification, integer encoding must not exceed ceil(N/7)
// https://webassembly.github.io/spec/core/binary/values.html#integers
const MAX_NUMBER_OF_BYTE_U32 = 5;   // ceil(32/7)
const MAX_NUMBER_OF_BYTE_U64 = 10;  // ceil(64/7)

// https://en.wikipedia.org/wiki/LEB128#Decode_unsigned_integer
function decodeUnsignedLeb128(parser: Parser, maxByteNumber: number): number {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
        byte = consumeByte(parser);
        
        // Extract the low order 7 bits of byte, left shift the byte and add them to the current
        // result.
        result |= (byte & 0x7f) << (shift * 7);

        // Increase the shift by one.
        shift++;

        // Repeat until the highest order bit (0x80) is 0.
    } while ((byte & 0x80) === 0x80);

    // Assert that the number of consumed bytes is not higher than the expected encoding size.
    if (shift > maxByteNumber) {
        throw new Error('Integer is too long.');
    }

    return result;
}

function decodeSignedLeb128(parser: Parser, byteSize: number, maxByteSize: number): number {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
        byte = consumeByte(parser);
        
        // Extract the low order 7 bits of byte, left shift the byte and add them to the current
        // result.
        result |= (byte & 0x7f) << (shift * 7);

        // Increase the shift by one.
        shift++;

        // Repeat until the highest order bit (0x80) is 0.
    } while ((byte & 0x80) === 0x80);

    // Sign bit of byte is second high order bit (0x40).
    if (shift < byteSize && (byte & 0x40) === 0x40) {
        result |= ~0 << (shift * 7);
    }

    if (shift > maxByteSize) {
        throw new Error('Integer is too long.');
    }

    return result;
}

function decodeUInt32(parser: Parser): number {
    return decodeUnsignedLeb128(parser, MAX_NUMBER_OF_BYTE_U32);
}
function decodeInt32(parser: Parser): number {
    return decodeSignedLeb128(parser, NUMBER_OF_BYTES_U32, MAX_NUMBER_OF_BYTE_U32);
}
function decodeInt64(parser: Parser): number {
    return decodeSignedLeb128(parser, NUMBER_OF_BYTES_U64, MAX_NUMBER_OF_BYTE_U64)
}
function decodeFloat32(parser: Parser): number {
    // TODO
    return 0;
}
function decodeFloat64(parser: Parser): number {
    // TODO
    return 0;
}

function decodeContinutationByte(parser: Parser): Byte {
    const byte = consumeByte(parser);

    // Throw an error if the byte doesn't have the right prefix.
    // All the continutation bytes should have the same format: 10xxxxxx
    if ((byte & 0xc0) !== 0x80) {
        throw new Error('Invalid continuation byte');
    }

    // Return the meaningful part of the continuation byte by masking the prefix.
    return byte & 0x3f;
}

// https://webassembly.github.io/spec/core/binary/values.html#binary-name
//
// The higher bits in the first byte contains a mask describing the number of byte encoding the
// character. In UTF-8 characters can be encoded over 1 to 4 bytes.
function decodeName(parser: Parser): string {
    const charCodes = decodeVector(parser, () => {
        const byte1 = consumeByte(parser);

        // 1 byte sequence with no continuation byte
        // [0xxxxxxx]
        if ((byte1 & 0x80) === 0) {
            return byte1;
        }

        // 2 bytes sequence
        // [110xxxxx, 10xxxxxx]
        if ((byte1 & 0xe0) === 0xc0) {
            const byte2 = decodeContinutationByte(parser);
            return ((byte1 & 0x1f) << 6) | byte2;
        }

        // 3 bytes sequence
        // [1110xxxx, 10xxxxxx, 10xxxxxx]
        if ((byte1 & 0xf0) === 0xe0) {
            const byte2 = decodeContinutationByte(parser);
            const byte3 = decodeContinutationByte(parser);
            return ((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3;
        }

        // 4 bytes sequence
        // [11110xxx, 10xxxxxx, 10xxxxxx, 10xxxxxx]
        if ((byte1 & 0xf8) === 0xf0) {
            const byte2 = decodeContinutationByte(parser);
            const byte3 = decodeContinutationByte(parser);
            const byte4 = decodeContinutationByte(parser);
            return (
                ((byte1 & 0x07) << 18) | (byte2 << 12) | (byte3 << 6) | byte4
            );
        }

        throw new Error('Invalid UTF-8 encoding');
    });

    return charCodes.map(charCode => String.fromCharCode(charCode)).join('');
}
//#endregion Values

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
    }

    throw new Error('Invalid value type');
}

// https://webassembly.github.io/spec/core/binary/types.html#limits
function decodeLimits(parser: Parser): Limits {
    switch (consumeByte(parser)) {
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
            throw new Error(`Invalid limit type`);
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
                    case ImportKind.Function:
                        descriptor = {
                            type: 'function',
                            index,
                        };
                        break;

                    case ImportKind.Table:
                        descriptor = {
                            type: 'table',
                            index,
                        };
                        break;

                    case ImportKind.Memory:
                        descriptor = {
                            type: 'memory',
                            index,
                        };
                        break;

                    case ImportKind.Global:
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
    switch (consumeByte(parser)) {
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

    let mutability: GlobalTypeMutability;
    switch (consumeByte(parser)) {
        case 0x00:
            mutability = GlobalTypeMutability.constant;
            break;

        case 0x01:
            mutability = GlobalTypeMutability.variable;

        default:
            throw new Error(`Invalid mutability code`);
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

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
function decodeResultTypes(parser: Parser): ValueType[] {
    if (peakByte(parser) === 0x40) {
        consumeByte(parser);
        return [];
    }

    return [decodeValueType(parser)];
}

// https://webassembly.github.io/spec/core/binary/instructions.html#control-instructions
function decodeInstruction(parser: Parser): Instruction {
    const opcode = consumeByte(parser);

    switch (opcode) {
        // Control flow
        case OpCode.Unreachable:
        case OpCode.Nop: {
            return { opcode };
        }

        case OpCode.Block:
        case OpCode.Loop: {
            const resultTypes = decodeResultTypes(parser);
            const instructions: Instruction[] = [];

            while (peakByte(parser) !== OpCode.End) {
                const instruction = decodeInstruction(parser);
                instructions.push(instruction);
            }

            const _end = consumeByte(parser);

            return {
                opcode,
                resultTypes,
                instructions,
            };
        }

        case OpCode.If: {
            const resultTypes = decodeResultTypes(parser);
            const ifInstructions: Instruction[] = [];
            const elseInstructions: Instruction[] = [];

            while (
                peakByte(parser) !== OpCode.End && 
                peakByte(parser) !== OpCode.Else
            ) {
                const instruction = decodeInstruction(parser);
                ifInstructions.push(instruction);
            }

            if (peakByte(parser) === OpCode.Else) {
                const _else = consumeByte(parser);

                while (peakByte(parser) !== OpCode.End) {
                    const instruction = decodeInstruction(parser);
                    elseInstructions.push(instruction);
                }
            }

            const _end = consumeByte(parser);

            return {
                opcode,
                resultTypes,
                ifInstructions,
                elseInstructions,
            };
        }

        case OpCode.Br:
        case OpCode.BrIf: {
            return {
                opcode,
                labelIndex: decodeUInt32(parser),
            };
        }

        case OpCode.BrTable: {
            const labelIndexes = decodeVector(parser, () => {
                return decodeUInt32(parser);
            })
            const labelDefaultIndex = decodeUInt32(parser);
            return {
                opcode,
                labelIndexes,
                labelDefaultIndex
            }
        }

        case OpCode.Return: {
            return { opcode };
        }

        // Call operators
        case OpCode.Call:
            return {
                opcode,
                functionIndex: {
                    type: 'function',
                    index: decodeUInt32(parser),
                },
            };

        case OpCode.CallIndirect: {
            const index = decodeUInt32(parser);

            const suffix = decodeUInt32(parser);
            if (suffix !== OpCode.Unreachable) {
                throw new Error('Invalid call_indirect instruction');
            }

            return {
                opcode,
                typeIndex: {
                    type: 'type',
                    index,
                },
            };
        }

        // Parametric operators
        case OpCode.Drop:
        case OpCode.Select: {
            return { opcode };
        }

        // Variable access
        case OpCode.GetLocal:
        case OpCode.SetLocal:
        case OpCode.TeeLocal: {
            return {
                opcode,
                localIndex: {
                    type: 'local',
                    index: decodeUInt32(parser),
                },
            };
        }

        case OpCode.GetGlobal:
        case OpCode.SetGlobal: {
            return {
                opcode,
                globalIndex: {
                    type: 'global',
                    index: decodeUInt32(parser),
                },
            };
        }

        // Memory-related operators
        case OpCode.I32Load:
        case OpCode.I64Load:
        case OpCode.F32Load:
        case OpCode.F64Load:
        case OpCode.I32Load8S:
        case OpCode.I32Load8U:
        case OpCode.I32Load16S:
        case OpCode.I32Load16U:
        case OpCode.I64Load8S:
        case OpCode.I64Load8U:
        case OpCode.I64Load16S:
        case OpCode.I64Load16U:
        case OpCode.I64Load32S:
        case OpCode.I64Load32U:
        case OpCode.I32Store:
        case OpCode.I64Store:
        case OpCode.F32Store:
        case OpCode.F64Store:
        case OpCode.I32Store8:
        case OpCode.I32Store16:
        case OpCode.I64Store8:
        case OpCode.I64Store16:
        case OpCode.I64Store32: {
            const align = decodeUInt32(parser);
            const offset = decodeUInt32(parser);
            return {
                opcode,
                align,
                offset,
            };
        }

        case OpCode.MemoryGrow:
        case OpCode.MemorySize: {
            if (consumeByte(parser) !== OpCode.Unreachable) {
                throw new Error('Invalid memory operation');
            }

            return { opcode };
        }

        // Constants
        case OpCode.I32Const: {
            return {
                opcode,
                value: decodeInt32(parser),
            };
        }
        case OpCode.I64Const: {
            return {
                opcode,
                value: decodeInt64(parser),
            };
        }
        case OpCode.F32Const: {
            return {
                opcode,
                value: decodeFloat32(parser),
            };
        }
        case OpCode.F64Const: {
            return {
                opcode,
                value: decodeFloat64(parser),
            };
        }

        // Comparison operators
        case OpCode.I32Eqz:
        case OpCode.I32Eq:
        case OpCode.I32Ne:
        case OpCode.I32LtS:
        case OpCode.I32LtU:
        case OpCode.I32GtS:
        case OpCode.I32GtU:
        case OpCode.I32LeS:
        case OpCode.I32LeU:
        case OpCode.I32GeS:
        case OpCode.I32GeU:
        case OpCode.I64Eqz:
        case OpCode.I64Eq:
        case OpCode.I64Ne:
        case OpCode.I64LtS:
        case OpCode.I64LtU:
        case OpCode.I64GtS:
        case OpCode.I64GtU:
        case OpCode.I64LeS:
        case OpCode.I64LeU:
        case OpCode.I64GeS:
        case OpCode.I64GeU:
        case OpCode.F32Eq:
        case OpCode.F32Ne:
        case OpCode.F32Lt:
        case OpCode.F32Gt:
        case OpCode.F32Le:
        case OpCode.F32Ge:
        case OpCode.F64Eq:
        case OpCode.F64Ne:
        case OpCode.F64Lt:
        case OpCode.F64Gt:
        case OpCode.F64Le:
        case OpCode.F64Ge: {
            return { opcode };
        }

        // Numeric operators
        case OpCode.I32Clz:
        case OpCode.I32Ctz:
        case OpCode.I32Popcnt:
        case OpCode.I32Add:
        case OpCode.I32Sub:
        case OpCode.I32Mul:
        case OpCode.I32DivS:
        case OpCode.I32DivU:
        case OpCode.I32RemS:
        case OpCode.I32RemU:
        case OpCode.I32And:
        case OpCode.I32Or:
        case OpCode.I32Xor:
        case OpCode.I32Shl:
        case OpCode.I32ShrS:
        case OpCode.I32ShrU:
        case OpCode.I32Rotl:
        case OpCode.I32Rotr:
        case OpCode.I64Clz:
        case OpCode.I64Ctz:
        case OpCode.I64Popcnt:
        case OpCode.I64Add:
        case OpCode.I64Sub:
        case OpCode.I64Mul:
        case OpCode.I64DivS:
        case OpCode.I64DivU:
        case OpCode.I64RemS:
        case OpCode.I64RemU:
        case OpCode.I64And:
        case OpCode.I64Or:
        case OpCode.I64Xor:
        case OpCode.I64Shl:
        case OpCode.I64ShrS:
        case OpCode.I64ShrU:
        case OpCode.I64Rotl:
        case OpCode.I64Rotr:
        case OpCode.F32Abs:
        case OpCode.F32Neg:
        case OpCode.F32Ceil:
        case OpCode.F32Floor:
        case OpCode.F32Trunc:
        case OpCode.F32Nearest:
        case OpCode.F32Sqrt:
        case OpCode.F32Add:
        case OpCode.F32Sub:
        case OpCode.F32Mul:
        case OpCode.F32Div:
        case OpCode.F32Min:
        case OpCode.F32Max:
        case OpCode.F32CopySign:
        case OpCode.F64Abs:
        case OpCode.F64Neg:
        case OpCode.F64Ceil:
        case OpCode.F64Floor:
        case OpCode.F64Trunc:
        case OpCode.F64Nearest:
        case OpCode.F64Sqrt:
        case OpCode.F64Add:
        case OpCode.F64Sub:
        case OpCode.F64Mul:
        case OpCode.F64Div:
        case OpCode.F64Min:
        case OpCode.F64Max:
        case OpCode.F64CopySign: {
            return { opcode };
        }

        // Conversions
        case OpCode.I32WrapI64:
        case OpCode.I32TruncSF32:
        case OpCode.I32TruncUF32:
        case OpCode.I32TruncSF64:
        case OpCode.I32TruncUF64:
        case OpCode.I64ExtendSI32:
        case OpCode.I64ExtendUI32:
        case OpCode.I64TruncSF32:
        case OpCode.I64TruncUF32:
        case OpCode.I64TruncSF64:
        case OpCode.I64TruncUF64:
        case OpCode.F32ConvertSI32:
        case OpCode.F32ConvertUI32:
        case OpCode.F32ConvertSI64:
        case OpCode.F32ConvertUI64:
        case OpCode.F32DemoteF64:
        case OpCode.F64ConvertSI32:
        case OpCode.F64ConvertUI32:
        case OpCode.F64ConvertSI64:
        case OpCode.F64ConvertUI64:
        case OpCode.F64PromoteF32: {
            return { opcode };
        }

        // Reinterpretations
        case OpCode.I32ReinterpretF32:
        case OpCode.I64ReinterpretF64:
        case OpCode.F32ReinterpretI32:
        case OpCode.F64ReinterpretI64: {
            return { opcode };
        }

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
    const size = decodeUInt32(parser);
    const endOffset = size + parser.offset;

    const locals: ValueType[] = [];
    decodeVector(parser, () => {
        const localCount = decodeUInt32(parser);
        const valueType = decodeValueType(parser);

        for (let i = 0; i < localCount; i++) {
            locals.push(valueType);
        }
    });

    const body = decodeExpression(parser);

    if (endOffset !== parser.offset) {
        throw new Error('Invalid code size');
    }

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

    if (functions.length !== codes.length) {
        throw new Error('Different length for code and function section');
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
