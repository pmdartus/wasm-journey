import * as structure from './structure';
import { ValueType } from './structure';
import { OpCode } from './constants';

// https://webassembly.github.io/spec/core/valid/conventions.html#context
interface Context {
    types: structure.FunctionType[];
    functions: structure.Function[];
    tables: structure.Table[];
    memories: structure.Memory[];
    globals: structure.Global[];
    locals: structure.ValueType[];
    labels: structure.ResultType[];
    return?: structure.ResultType;
}

// https://webassembly.github.io/spec/core/appendix/algorithm.html#data-structures
type Operand = ValueType | 'unknown';

interface ControlFrame {
    labelTypes: ValueType[];
    endTypes: ValueType[];
    height: number;
    unreachable: boolean;
}

interface ValidationState {
    context: Context;
    operands: Operand[];
    controls: ControlFrame[];
}

function assert(value: boolean, message?: string) {
    if (value != true) {
        throw new Error(
            'Invalid module' + (message !== undefined ? '' : ': ' + message),
        );
    }
}

function pushOperand(state: ValidationState, operand: Operand): void {
    const { operands } = state;
    operands.push(operand);
}

function popOperand(state: ValidationState, expected?: Operand): Operand {
    const { operands, controls } = state;
    const currentControlFrame = controls[controls.length - 1];

    if (expected === undefined) {
        if (
            operands.length === currentControlFrame.height &&
            currentControlFrame.unreachable
        ) {
            return 'unknown';
        }

        assert(
            operands.length !== currentControlFrame.height,
            'Operand size and control frame height have to match',
        );
        return operands.pop()!;
    } else {
        const actual = operands.pop()!;

        if (actual === 'unknown') {
            return expected;
        }
        if (expected === 'unknown') {
            return actual;
        }

        assert(
            actual === expected,
            `Non-matching value type. Expected ${expected} but received ${actual}`,
        );
        return actual;
    }
}

function pushOperands(state: ValidationState, operands: Operand[]): void {
    for (let i = 0; i < operands.length; i++) {
        pushOperand(state, operands[i]);
    }
}

function popOperands(state: ValidationState, expected: Operand[]): Operand[] {
    const result: Operand[] = [];
    for (let i = expected.length - 1; i >= 0; i--) {
        result.push(popOperand(state, expected[i]));
    }
    return result;
}

function pushControlFrame(
    state: ValidationState,
    frame: { labelTypes: ValueType[]; endTypes: ValueType[] },
): void {
    const { controls, operands } = state;
    controls.push({
        labelTypes: frame.labelTypes,
        endTypes: frame.endTypes,
        height: operands.length,
        unreachable: false,
    });
}

function popControlFrame(state: ValidationState): ValueType[] {
    const { controls, operands } = state;

    assert(controls.length !== 0, 'Control stack is empty');
    const frame = controls[controls.length - 1];

    popOperands(state, frame.endTypes);

    assert(
        operands.length === frame.height,
        "Operand size and control frame height don't match",
    );
    controls.pop();

    return frame.endTypes;
}

function unreachable(state: ValidationState): void {
    const { controls, operands } = state;

    state.operands = operands.slice(0, controls.length);
    controls[controls.length - 1].unreachable = true;
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-load
function applyLoad(
    state: ValidationState,
    type: ValueType,
    align: number,
    width: number,
): void {
    const { context } = state;

    assert(context.memories[0] !== undefined, 'No memory found');
    assert(2 ** align < width / 8, 'Invalid align');

    popOperand(state, ValueType.i32);
    pushOperand(state, type);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#id16
function applyStore(
    state: ValidationState,
    type: ValueType,
    align: number,
    width: number,
): void {
    const { context } = state;

    assert(context.memories[0] !== undefined, 'No memory found');
    assert(2 ** align < width / 8, 'Invalid align');

    popOperands(state, [ValueType.i32, type]);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-unop
function applyUnary(state: ValidationState, type: ValueType): void {
    popOperand(state, type);
    pushOperand(state, type);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-binop
function applyBinary(state: ValidationState, type: ValueType): void {
    popOperands(state, [type, type]);
    pushOperand(state, type);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-testop
function applyTest(state: ValidationState, type: ValueType): void {
    popOperand(state, type);
    pushOperand(state, ValueType.i32);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-relop
function applyComparison(state: ValidationState, type: ValueType): void {
    popOperands(state, [type, type]);
    pushOperand(state, ValueType.i32);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#valid-cvtop
function applyConversion(
    state: ValidationState,
    input: ValueType,
    output: ValueType,
): void {
    popOperand(state, input);
    pushOperand(state, output);
}

// https://webassembly.github.io/spec/core/valid/instructions.html
// https://webassembly.github.io/spec/core/appendix/algorithm.html
function applyInstruction(
    state: ValidationState,
    instruction: structure.Instruction,
): void {
    const { context } = state;
    const { opcode } = instruction;

    switch (opcode) {
        // Control flow
        case OpCode.Unreachable: {
            unreachable(state);
            break;
        }
        case OpCode.Nop: {
            return;
        }
        case OpCode.Loop: {
            const { resultTypes } = instruction as structure.BlockInstruction;
            pushControlFrame(state, {
                labelTypes: resultTypes,
                endTypes: resultTypes,
            });
            break;
        }
        case OpCode.If: {
            const { resultTypes } = instruction as structure.IfInstruction;
            popOperand(state, ValueType.i32);
            pushControlFrame(state, {
                labelTypes: resultTypes,
                endTypes: resultTypes,
            });
            break;
        }
        case OpCode.Br: {
            const { controls } = state;
            const { labelIndex } = instruction as structure.BrInstruction;
            assert(controls.length > labelIndex);
            popOperands(state, controls[labelIndex].labelTypes);
            unreachable(state);
            break;
        }
        case OpCode.BrIf: {
            const { controls } = state;
            const { labelIndex } = instruction as structure.BrInstruction;
            assert(controls.length > labelIndex, 'Invalid index');
            popOperand(state, ValueType.i32);
            popOperands(state, controls[labelIndex].labelTypes);
            pushOperands(state, controls[labelIndex].labelTypes);
            break;
        }
        case OpCode.BrTable: {
            const { controls } = state;
            const {
                labelIndexes,
                labelDefaultIndex,
            } = instruction as structure.BrTableInstruction;
            const defaultIndexTypes = controls[labelDefaultIndex].labelTypes;

            assert(controls.length > labelDefaultIndex);
            for (let i = 0; i < labelIndexes.length; i++) {
                const labelIndex = labelIndexes[i];
                assert(controls.length > labelIndex, 'Invalid index');

                const indexTypes = controls[labelIndex].labelTypes;
                assert(
                    indexTypes.length === defaultIndexTypes.length,
                    'Non matching types',
                );
                for (let j = 0; j < indexTypes.length; j++) {
                    assert(
                        indexTypes[j] === defaultIndexTypes[j],
                        'Non matching types',
                    );
                }
            }

            popOperand(state, ValueType.i32);
            popOperands(state, defaultIndexTypes);
            unreachable(state);
            break;
        }
        case OpCode.Return: {
            const { return: returnType } = context;
            assert(returnType !== undefined, 'Invalid return');
            popOperands(state, returnType!);
            unreachable(state);
            break;
        }

        // Call operators
        case OpCode.Call: {
            const { functionIndex } = instruction as structure.CallInstruction;
            const fn = context.functions[functionIndex.index];
            const type = context.types[fn.type.index];
            popOperands(state, type.params);
            pushOperands(state, type.results);
            break;
        }
        case OpCode.CallIndirect: {
            const {
                typeIndex,
            } = instruction as structure.CallIndirectInstruction;

            const table = context.tables[0];
            assert(table !== undefined, 'No table found');
            assert(
                table.type.elementType === structure.ElementType.FuncRef,
                'Invalid table',
            );

            const type = context.types[typeIndex.index];
            assert(type !== undefined, 'Invalid type');
            popOperand(state, ValueType.i32);
            popOperands(state, type.params);
            pushOperands(state, type.results);
            break;
        }

        // Parametric operators
        case OpCode.Drop: {
            popOperand(state);
            break;
        }
        case OpCode.Select: {
            popOperand(state, ValueType.i32);
            const t = popOperand(state);
            popOperand(state, t);
            pushOperand(state, t);
            break;
        }

        // Variable access
        case OpCode.GetLocal: {
            const { localIndex } = instruction as structure.LocalInstruction;
            const localType = context.locals[localIndex.index];
            assert(localType !== undefined, 'Unknown local');
            pushOperand(state, localType);
            break;
        }
        case OpCode.SetLocal: {
            const { localIndex } = instruction as structure.LocalInstruction;
            const localType = context.locals[localIndex.index];
            assert(localType !== undefined, 'Unknown local');
            popOperand(state, localType);
            break;
        }
        case OpCode.TeeLocal: {
            const { localIndex } = instruction as structure.LocalInstruction;
            const localType = context.locals[localIndex.index];
            assert(localType !== undefined, 'Unknown local');
            popOperand(state, localType);
            pushOperand(state, localType);
            break;
        }
        case OpCode.GetGlobal: {
            const { globalIndex } = instruction as structure.GlobalInstruction;
            const global = context.globals[globalIndex.index];
            assert(global !== undefined, 'Unknown global');

            const globalType = global.type.valueType;
            pushOperand(state, globalType);
            break;
        }
        case OpCode.SetGlobal: {
            const { globalIndex } = instruction as structure.GlobalInstruction;
            const global = context.globals[globalIndex.index];
            assert(global !== undefined, 'Unknown global');

            const globalType = global.type.valueType;
            popOperand(state, globalType);
            break;
        }

        // Memory-related operators
        case OpCode.I32Load: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i32, align, 32);
        }
        case OpCode.I64Load: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 64);
        }
        case OpCode.F32Load: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.f32, align, 32);
        }
        case OpCode.F64Load: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.f64, align, 64);
        }
        case OpCode.I32Load8S: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i32, align, 8);
        }
        case OpCode.I32Load8U: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i32, align, 8);
        }
        case OpCode.I32Load16S: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i32, align, 16);
        }
        case OpCode.I32Load16U: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i32, align, 16);
        }
        case OpCode.I64Load8S: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 8);
        }
        case OpCode.I64Load8U: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 8);
        }
        case OpCode.I64Load16S: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 16);
        }
        case OpCode.I64Load16U: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 16);
        }
        case OpCode.I64Load32S: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 32);
        }
        case OpCode.I64Load32U: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyLoad(state, ValueType.i64, align, 32);
        }
        case OpCode.I32Store: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i32, align, 32);
        }
        case OpCode.I64Store: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i64, align, 64);
        }
        case OpCode.F32Store: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.f32, align, 32);
        }
        case OpCode.F64Store: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.f64, align, 64);
        }
        case OpCode.I32Store8: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i32, align, 8);
        }
        case OpCode.I32Store16: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i32, align, 16);
        }
        case OpCode.I64Store8: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i64, align, 8);
        }
        case OpCode.I64Store16: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i64, align, 16);
        }
        case OpCode.I64Store32: {
            const { align } = instruction as structure.MemoryInstruction;
            return applyStore(state, ValueType.i64, align, 32);
        }

        case OpCode.MemoryGrow: {
            assert(context.memories[0] !== undefined, 'No memory found');
            popOperand(state, ValueType.i32);
            pushOperand(state, ValueType.i32);
            break;
        }
        case OpCode.MemorySize: {
            assert(context.memories[0] !== undefined, 'No memory found');
            pushOperand(state, ValueType.i32);
            break;
        }

        // Constants
        case OpCode.I32Const: {
            pushOperand(state, ValueType.i32);
            break;
        }
        case OpCode.I64Const: {
            pushOperand(state, ValueType.i64);
            break;
        }
        case OpCode.F32Const: {
            pushOperand(state, ValueType.f32);
            break;
        }
        case OpCode.F64Const: {
            pushOperand(state, ValueType.f64);
            break;
        }

        // Comparison operators
        case OpCode.I32Eqz: {
            applyTest(state, ValueType.i32);
            break;
        }

        case OpCode.I32Eq:
        case OpCode.I32Ne:
        case OpCode.I32LtS:
        case OpCode.I32LtU:
        case OpCode.I32GtS:
        case OpCode.I32GtU:
        case OpCode.I32LeS:
        case OpCode.I32LeU:
        case OpCode.I32GeS:
        case OpCode.I32GeU: {
            applyComparison(state, ValueType.i32);
            break;
        }

        case OpCode.I64Eqz: {
            applyTest(state, ValueType.i32);
            break;
        }

        case OpCode.I64Eq:
        case OpCode.I64Ne:
        case OpCode.I64LtS:
        case OpCode.I64LtU:
        case OpCode.I64GtS:
        case OpCode.I64GtU:
        case OpCode.I64LeS:
        case OpCode.I64LeU:
        case OpCode.I64GeS:
        case OpCode.I64GeU: {
            applyComparison(state, ValueType.i64);
            break;
        }

        case OpCode.F32Eq:
        case OpCode.F32Ne:
        case OpCode.F32Lt:
        case OpCode.F32Gt:
        case OpCode.F32Le:
        case OpCode.F32Ge: {
            applyComparison(state, ValueType.f32);
            break;
        }

        case OpCode.F64Eq:
        case OpCode.F64Ne:
        case OpCode.F64Lt:
        case OpCode.F64Gt:
        case OpCode.F64Le:
        case OpCode.F64Ge: {
            applyComparison(state, ValueType.f64);
            break;
        }

        // Numeric operators
        case OpCode.I32Clz:
        case OpCode.I32Ctz:
        case OpCode.I32Popcnt: {
            applyUnary(state, ValueType.i32);
            break;
        }

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
        case OpCode.I32Rotr: {
            applyBinary(state, ValueType.i32);
            break;
        }

        case OpCode.I64Clz:
        case OpCode.I64Ctz:
        case OpCode.I64Popcnt: {
            applyUnary(state, ValueType.i64);
            break;
        }

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
        case OpCode.I64Rotr: {
            applyBinary(state, ValueType.i64);
            break;
        }

        case OpCode.F32Abs:
        case OpCode.F32Neg:
        case OpCode.F32Ceil:
        case OpCode.F32Floor:
        case OpCode.F32Trunc:
        case OpCode.F32Nearest: {
            applyUnary(state, ValueType.f32);
            break;
        }

        case OpCode.F32Sqrt:
        case OpCode.F32Add:
        case OpCode.F32Sub:
        case OpCode.F32Mul:
        case OpCode.F32Div:
        case OpCode.F32Min:
        case OpCode.F32Max:
        case OpCode.F32CopySign: {
            applyBinary(state, ValueType.f32);
            break;
        }

        case OpCode.F64Abs:
        case OpCode.F64Neg:
        case OpCode.F64Ceil:
        case OpCode.F64Floor:
        case OpCode.F64Trunc:
        case OpCode.F64Nearest: {
            applyUnary(state, ValueType.f64);
            break;
        }

        case OpCode.F64Sqrt:
        case OpCode.F64Add:
        case OpCode.F64Sub:
        case OpCode.F64Mul:
        case OpCode.F64Div:
        case OpCode.F64Min:
        case OpCode.F64Max:
        case OpCode.F64CopySign: {
            applyBinary(state, ValueType.f32);
            break;
        }

        // Conversions
        case OpCode.I32WrapI64: {
            applyConversion(state, ValueType.i64, ValueType.i32);
            break;
        }
        case OpCode.I32TruncSF32: {
            applyConversion(state, ValueType.f32, ValueType.i32);
            break;
        }
        case OpCode.I32TruncUF32: {
            applyConversion(state, ValueType.i32, ValueType.i32);
            break;
        }
        case OpCode.I32TruncSF64: {
            applyConversion(state, ValueType.f64, ValueType.i32);
            break;
        }
        case OpCode.I32TruncUF64: {
            applyConversion(state, ValueType.f64, ValueType.i32);
            break;
        }
        case OpCode.I64ExtendSI32: {
            applyConversion(state, ValueType.f64, ValueType.i32);
            break;
        }
        case OpCode.I64ExtendUI32: {
            applyConversion(state, ValueType.i32, ValueType.i64);
            break;
        }
        case OpCode.I64TruncSF32: {
            applyConversion(state, ValueType.f32, ValueType.i64);
            break;
        }
        case OpCode.I64TruncUF32: {
            applyConversion(state, ValueType.i64, ValueType.i64);
            break;
        }
        case OpCode.I64TruncSF64: {
            applyConversion(state, ValueType.f64, ValueType.i64);
            break;
        }
        case OpCode.I64TruncUF64: {
            applyConversion(state, ValueType.i64, ValueType.i64);
            break;
        }
        case OpCode.F32ConvertSI32: {
            applyConversion(state, ValueType.i32, ValueType.f32);
            break;
        }
        case OpCode.F32ConvertUI32: {
            applyConversion(state, ValueType.i32, ValueType.f32);
            break;
        }
        case OpCode.F32ConvertSI64: {
            applyConversion(state, ValueType.i64, ValueType.f32);
            break;
        }
        case OpCode.F32ConvertUI64: {
            applyConversion(state, ValueType.i64, ValueType.f32);
            break;
        }
        case OpCode.F32DemoteF64: {
            applyConversion(state, ValueType.f64, ValueType.f32);
            break;
        }
        case OpCode.F64ConvertSI32: {
            applyConversion(state, ValueType.i32, ValueType.f64);
            break;
        }
        case OpCode.F64ConvertUI32: {
            applyConversion(state, ValueType.i32, ValueType.f64);
            break;
        }
        case OpCode.F64ConvertSI64: {
            applyConversion(state, ValueType.i64, ValueType.f64);
            break;
        }
        case OpCode.F64ConvertUI64: {
            applyConversion(state, ValueType.i64, ValueType.f64);
            break;
        }
        case OpCode.F64PromoteF32: {
            applyConversion(state, ValueType.f32, ValueType.f64);
            break;
        }

        // Reinterpretations
        case OpCode.I32ReinterpretF32: {
            applyConversion(state, ValueType.f32, ValueType.i32);
            break;
        }
        case OpCode.I64ReinterpretF64: {
            applyConversion(state, ValueType.f64, ValueType.i64);
            break;
        }
        case OpCode.F32ReinterpretI32: {
            applyConversion(state, ValueType.i32, ValueType.f32);
            break;
        }
        case OpCode.F64ReinterpretI64: {
            applyConversion(state, ValueType.i64, ValueType.f64);
            break;
        }

        default: {
            throw new TypeError(`Invalid opcode ${opcode}`);
        }
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#limits
function validateLimit(limit: structure.Limits, range: number) {
    const { min, max } = limit;

    assert(min < range, 'Invalid limit');

    if (max !== undefined) {
        assert(max < range, 'Invalid limit');
        assert(min <= max, 'Invalid limit');
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-tabletype
function validateTableType(type: structure.TableType) {
    const { limit } = type;
    validateLimit(limit, 2 ** 32);
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-memtype
function validateMemoryType(type: structure.MemoryType) {
    validateLimit(type, 2 ** 16);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#expressions
function validateExpression(
    context: Context,
    expression: structure.Expression,
    returnType: structure.ResultType,
) {
    const { instructions } = expression;

    const state: ValidationState = {
        context,
        controls: [],
        operands: [],
    };

    pushControlFrame(state, {
        labelTypes: [],
        endTypes: returnType,
    });

    for (let i = 0; i < instructions.length; i++) {
        applyInstruction(state, instructions[i]);
    }

    popControlFrame(state);
    assert(
        state.controls.length === 0 && state.operands.length === 0,
        'Stack is not empty after invocation',
    );
}

// https://webassembly.github.io/spec/core/valid/instructions.html#constant-expressions
function validateConstantExpression(
    context: Context,
    expression: structure.Expression,
) {
    const { instructions } = expression;

    for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        const { opcode } = instruction;

        const isConstantInstruction =
            opcode === OpCode.I32Const ||
            opcode === OpCode.I64Const ||
            opcode === OpCode.F32Const ||
            opcode === OpCode.F64Const;

        const isGlobalConstantInstruction =
            opcode === OpCode.GetGlobal &&
            context.globals[
                (instruction as structure.GlobalInstruction).globalIndex.index
            ].type.mutability === structure.GlobalTypeMutability.constant;

        assert(
            isConstantInstruction || isGlobalConstantInstruction,
            'Invalid constant expression',
        );
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-functype
function validateFunctionType(
    context: Context,
    functionType: structure.FunctionType,
) {
    assert(functionType.results.length <= 1, 'Invalid function type');
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-func
function validateFunction(context: Context, fn: structure.Function) {
    const { type: typeIndex, locals, body } = fn;
    const type = context.types[typeIndex.index];

    const fnContext: Context = {
        ...context,
        locals: [...type.params, ...locals],
        labels: [type.results],
        return: type.results,
    };
    validateExpression(fnContext, body, type.results);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-table
function validateTable(context: Context, table: structure.Table) {
    const { type } = table;
    validateTableType(type);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-mem
function validateMemory(context: Context, memory: structure.Memory) {
    const { type } = memory;
    validateMemoryType(type);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-global
function validateGlobal(context: Context, global: structure.Global) {
    const { initializer, type } = global;
    validateExpression(context, initializer, [type.valueType]);
    validateConstantExpression(context, initializer);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-elem
function validateElement(context: Context, element: structure.Element) {
    const { table: tableIndex, offset, initializer } = element;
    const table = context.tables[tableIndex];

    assert(
        table.type.elementType === structure.ElementType.FuncRef,
        'Invalid table',
    );

    validateExpression(context, offset, [ValueType.i32]);
    validateConstantExpression(context, offset);

    for (let i = 0; i < initializer.length; i++) {
        const functionIndex = initializer[i];
        assert(context.functions[functionIndex] !== undefined, 'Invalid table');
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-data
function validateData(context: Context, data: structure.Data) {
    const { data: dataIndex, offset } = data;

    assert(context.memories[dataIndex] !== undefined, 'Invalid data');

    validateExpression(context, offset, [ValueType.i32]);
    validateConstantExpression(context, offset);
}

// https://webassembly.github.io/spec/core/valid/modules.html#start-function
function validateStart(context: Context, start: structure.Start) {
    const { function: functionIndex } = start;

    const fn = context.functions[functionIndex];
    assert(fn !== undefined, 'Invalid start');

    const type = context.types[fn.type.index];
    assert(
        type.params.length === 0 && type.results.length === 0,
        'Invalid start',
    );
}

function validateImport(context: Context, importedValue: structure.Import) {}

// https://webassembly.github.io/spec/core/valid/modules.html#exports
function validateExport(context: Context, exportedValue: structure.Export) {
    const exportedDescType = exportedValue.descriptor.type;
    assert(
        exportedDescType === 'function' ||
            exportedDescType === 'table' ||
            exportedDescType === 'memory' ||
            exportedDescType === 'global',
        'Invalid export',
    );
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-module
export function validate(module: structure.Module) {
    const context: Context = {
        types: module.types,
        functions: [...module.functions],
        tables: [...module.tables],
        memories: [...module.memories],
        globals: [...module.globals],
        locals: [],
        labels: [],
        return: undefined,
    };
    const contextGlobal: Context = {
        types: [],
        functions: [],
        tables: [],
        memories: [],
        globals: [...module.globals],
        locals: [],
        labels: [],
        return: undefined,
    };

    for (let i = 0; i < module.types.length; i++) {
        validateFunctionType(context, module.types[i]);
    }
    for (let i = 0; i < module.functions.length; i++) {
        validateFunction(context, module.functions[i]);
    }
    for (let i = 0; i < module.tables.length; i++) {
        validateTable(context, module.tables[i]);
    }
    for (let i = 0; i < module.memories.length; i++) {
        validateMemory(context, module.memories[i]);
    }
    for (let i = 0; i < module.globals.length; i++) {
        validateGlobal(contextGlobal, module.globals[i]);
    }
    for (let i = 0; i < module.elements.length; i++) {
        validateElement(context, module.elements[i]);
    }
    for (let i = 0; i < module.datas.length; i++) {
        validateData(context, module.datas[i]);
    }
    if (module.start !== undefined) {
        validateStart(context, module.start);
    }
    for (let i = 0; i < module.imports.length; i++) {
        validateImport(context, module.imports[i]);
    }
    for (let i = 0; i < module.exports.length; i++) {
        validateExport(context, module.exports[i]);
    }

    assert(context.tables.length <= 1, 'Invalid number of tables');
    assert(context.memories.length <= 1, 'Invalid number of memories');

    for (let i = 0; i < module.exports.length; i++) {
        for (let j = i + 1; j < module.exports.length; j++) {
            assert(
                module.exports[i].name !== module.exports[j].name,
                'Duplicate export name',
            );
        }
    }
}
