import { FunctionType, Module, ValueType, Export, Function, Start, Table, Memory, Global, ResultType, Expression, TableType, Limits, MemoryType, Element, ElementType, Data } from './structure';

// https://webassembly.github.io/spec/core/valid/conventions.html#context
interface Context {
    types: FunctionType[],
    functions: Function[],
    tables: Table[],
    memories: Memory[],
    globals: Global[],
    locals: ValueType[],
    labels: ResultType[],
    return?: ResultType
}

function validateLimit(limit: Limits, range: number) {
    const { min, max } = limit;

    if (min > range) {
        throw new Error('Invalid limit, min is greater than range.');
    }

    if (max !== undefined) {
        if (max > range) {
            throw new Error('Invalid limit, max is greater than range');
        }

        if (min > max) {
            throw new Error('Invalid lint, min is greater than range');
        } 
    }
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-tabletype
function validateTableType(type: TableType) {
    const { limit } = type;
    validateLimit(limit, 2 ** 32);
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-memtype
function validateMemoryType(type: MemoryType) {
    validateLimit(type, 2 ** 16)
}

// https://webassembly.github.io/spec/core/valid/instructions.html#expressions
function validateExpression(context: Context, expression: Expression) {}
function validateConstantExpression(context: Context, expression: Expression) {}

// https://webassembly.github.io/spec/core/valid/types.html#valid-functype
function validateFunctionType(context: Context, functionType: FunctionType) {
    if (functionType.results.length > 1) {
        throw TypeError("Invalid function type, can't have multiple return");
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-func
function validateFunction(context: Context, fn: Function) {
    const { type: typeIndex, locals, body } = fn;
    const type = context.types[typeIndex.index];
    
    const fnContext: Context = {
        ...context,
        locals: [...type.params, ...locals],
        labels: [type.results],
        return: type.results
    }
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
    validateMemoryType(type)
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-elem
function validateElement(context: Context, element: Element) {
    const { table: tableIndex, offset, initializer } = element;
    const table = context.tables[tableIndex];

    if (table.type.elementType !== ElementType.FuncRef) {
        throw new Error('Invalid table, unknown element type');
    }

    validateExpression(context, offset);
    validateConstantExpression(context, offset);

    for (const functionIndex of initializer) {
        if (context.functions[functionIndex] === undefined) {
            throw new Error('Invalid table, unknown function reference');
        }
    }

}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-data
function validateData(context: Context, data: Data) {
    const { data: dataIndex, offset } = data;
    
    if (context.memories[dataIndex] === undefined) {
        throw new Error('Invalid data, unknown memory')
    }

    validateExpression(context, offset);
    validateConstantExpression(context, offset);
}

// https://webassembly.github.io/spec/core/valid/modules.html#start-function
function validateStart(context: Context, start: Start) {
    const { function: functionIndex } = start;
    const fn = context.functions[functionIndex];

    if (fn === undefined) {
        throw new Error('Invalid start, unknown function')
    }

    const type = context.types[fn.type.index];

    if (type.params.length !== 0 || type.results.length !== 0) {
        throw new Error('Invalid start, start function can\'t receive parameters or return values');
    }

}

// https://webassembly.github.io/spec/core/valid/modules.html#exports
function validateExport(exportedValue: Export) {
    const exportedDescType = exportedValue.descriptor.type;
    if (
        exportedDescType !== 'function' &&
        exportedDescType !== 'table' &&
        exportedDescType !== 'memory' &&
        exportedDescType !== 'global'
    ) {
        throw new TypeError(`Invalid export type ${exportedDescType}`);
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-module
export function validate(module: Module) {
    const { exports } = module;

    const context: Context = {
        types: module.types,
        functions: [...module.functions],
        tables: [...module.tables],
        memories: [...module.memories],
        globals: [...module.globals],
        locals: [],
        labels: [],
        return: undefined
    };

    for (const functionType of module.types) {
        validateFunctionType(context, functionType);
    }

    for (const fn of module.functions) {
        validateFunction(context, fn);
    }

    for (const table of module.tables) {
        validateTable(context, table);
    }

    for (const memory of module.memories) {
        validateMemory(context, memory);
    }

    for (const global of module.globals) {
        // TODO
    }

    for (const element of module.elements) {
        validateElement(context, element);
    }

    for (const data of module.datas) {
        validateData(context, data);
    }

    if (module.start !== undefined) {
        validateStart(context, module.start);
    }

    for (const exportedValue of exports) {
        validateExport(exportedValue);
    }

    const exportLength = exports.length;
    for (let i = 0; i < exportLength; i++) {
        for (let j = i + 1; j < exportLength; j++) {
            if (exports[i].name === exports[j].name) {
                throw new TypeError(
                    `Invalid export, duplicate ${exports[j].name} export`,
                );
            }
        }
    }
}
