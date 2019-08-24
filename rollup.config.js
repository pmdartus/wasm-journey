import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/belette.ts',

    plugins: [
        typescript(),
    ],

    output: [{
        file: 'dist/esm/belette.js',
        format: 'esm',
    }, {
        file: 'dist/iife/belette.js',
        format: 'iife',
        name: 'belette'
    }]
}