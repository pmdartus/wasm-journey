import {
    FunctionType,
    Module,
    ValueType,
    Export,
    Function,
    Start,
    Table,
    Memory,
    Global,
    ResultType,
    Expression,
    TableType,
    Limits,
    MemoryType,
    Element,
    ElementType,
    Data,
    Import,
    GlobalInstruction,
    GlobalTypeMutability,
    Instruction,
} from './structure';
import { OpCode } from './constants';

// https://webassembly.github.io/spec/core/valid/conventions.html#context
interface Context {
    types: FunctionType[];
    functions: Function[];
    tables: Table[];
    memories: Memory[];
    globals: Global[];
    locals: ValueType[];
    labels: ResultType[];
    return?: ResultType;
}

function assert(value: boolean, message?: string) {
    if (value != true) {
        throw new Error(
            'Invalid module' + (message !== undefined ? '' : ': ' + message),
        );
    }
}

function validateLimit(limit: Limits, range: number) {
    const { min, max } = limit;

    assert(min < range, 'Invalid limit');

    if (max !== undefined) {
        assert(max < range, 'Invalid limit');
        assert(min <= max, 'Invalid limit');
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-tabletype
function validateTableType(type: TableType) {
    const { limit } = type;
    validateLimit(limit, 2 ** 32);
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-memtype
function validateMemoryType(type: MemoryType) {
    validateLimit(type, 2 ** 16);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#instruction-sequences
function validateInstructionSequence(context: Context, instructions: Instruction[]) {
    if (instructions.length === 0) {
        return;
    }
}

// https://webassembly.github.io/spec/core/valid/instructions.html#expressions
function validateExpression(context: Context, expression: Expression) {
    validateInstructionSequence(context, expression.instructions);
}

// https://webassembly.github.io/spec/core/valid/instructions.html#constant-expressions
function validateConstantExpression(context: Context, expression: Expression) {
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
                (instruction as GlobalInstruction).globalIndex.index
            ].type.mutability === GlobalTypeMutability.constant;

        assert(isConstantInstruction || isGlobalConstantInstruction, 'Invalid constant expression');
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-functype
function validateFunctionType(context: Context, functionType: FunctionType) {
    assert(functionType.results.length <= 1, 'Invalid function type');
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-func
function validateFunction(context: Context, fn: Function) {
    const { type: typeIndex, locals, body } = fn;
    const type = context.types[typeIndex.index];

    const fnContext: Context = {
        ...context,
        locals: [...type.params, ...locals],
        labels: [type.results],
        return: type.results,
    };
    validateExpression(fnContext, body);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-table
function validateTable(context: Context, table: Table) {
    const { type } = table;
    validateTableType(type);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-mem
function validateMemory(context: Context, memory: Memory) {
    const { type } = memory;
    validateMemoryType(type);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-global
function validateGlobal(context: Context, global: Global) {
    const { initializer } = global;
    validateExpression(context, initializer);
    validateConstantExpression(context, initializer);
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-elem
function validateElement(context: Context, element: Element) {
    const { table: tableIndex, offset, initializer } = element;
    const table = context.tables[tableIndex];

    assert(table.type.elementType === ElementType.FuncRef, 'Invalid table');

    validateExpression(context, offset);
    validateConstantExpression(context, offset);

    for (const functionIndex of initializer) {
        assert(context.functions[functionIndex] !== undefined, 'Invalid table');
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-data
function validateData(context: Context, data: Data) {
    const { data: dataIndex, offset } = data;

    assert(context.memories[dataIndex] !== undefined, 'Invalid data');

    validateExpression(context, offset);
    validateConstantExpression(context, offset);
}

// https://webassembly.github.io/spec/core/valid/modules.html#start-function
function validateStart(context: Context, start: Start) {
    const { function: functionIndex } = start;

    const fn = context.functions[functionIndex];
    assert(fn !== undefined, 'Invalid start');

    const type = context.types[fn.type.index];
    assert(
        type.params.length === 0 && type.results.length === 0,
        'Invalid start',
    );
}

function validateImport(context: Context, importedValue: Import) {}

// https://webassembly.github.io/spec/core/valid/modules.html#exports
function validateExport(context: Context, exportedValue: Export) {
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
export function validate(module: Module) {
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
