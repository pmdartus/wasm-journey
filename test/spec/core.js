const path = require('path');
const { run } = require('./runner');

run({
    extension: '.wast.js',
    base: path.resolve(__dirname, 'wasm/test/_output'),

    expected: {
        'address.wast.js': [
            ['#1 module successfully instantiated', 'FAIL'],
            ['#2 A wast module that must return a particular value.', 'FAIL'],
            ['#3 A wast module that must return a particular value.', 'FAIL'],
            ['#4 A wast module that must return a particular value.', 'FAIL'],
            ['#5 A wast module that must return a particular value.', 'FAIL'],
            ['#6 A wast module that must return a particular value.', 'FAIL'],
            ['#7 A wast module that must return a particular value.', 'FAIL'],
            ['#8 A wast module that must return a particular value.', 'FAIL'],
            ['#9 A wast module that must return a particular value.', 'FAIL'],
            ['#10 A wast module that must return a particular value.', 'FAIL'],
            ['#11 A wast module that must return a particular value.', 'FAIL'],
            ['#12 A wast module that must return a particular value.', 'FAIL'],
            ['#13 A wast module that must return a particular value.', 'FAIL'],
            ['#14 A wast module that must return a particular value.', 'FAIL'],
            ['#15 A wast module that must return a particular value.', 'FAIL'],
            ['#16 A wast module that must return a particular value.', 'FAIL'],
            ['#17 A wast module that must return a particular value.', 'FAIL'],
            ['#18 A wast module that must return a particular value.', 'FAIL'],
            ['#19 A wast module that must return a particular value.', 'FAIL'],
            ['#20 A wast module that must return a particular value.', 'FAIL'],
            ['#21 A wast module that must return a particular value.', 'FAIL'],
            ['#22 A wast module that must return a particular value.', 'FAIL'],
            ['#23 A wast module that must return a particular value.', 'FAIL'],
            ['#24 A wast module that must return a particular value.', 'FAIL'],
            ['#25 A wast module that must return a particular value.', 'FAIL'],
            ['#26 A wast module that must return a particular value.', 'FAIL'],
            ['#27 A wast module that must return a particular value.', 'FAIL'],
            ['#28 A wast module that must return a particular value.', 'FAIL'],
            ['#29 A wast module that must return a particular value.', 'FAIL'],
            ['#30 A wast module that must return a particular value.', 'FAIL'],
            ['#31 A wast module that must return a particular value.', 'FAIL'],
            ['#32 A wast module that must return a particular value.', 'FAIL'],
            ['#33 A wast module that must return a particular value.', 'FAIL'],
            ['#34 A wast module that must return a particular value.', 'FAIL'],
            ['#35 A wast module that must return a particular value.', 'FAIL'],
            ['#36 A wast module that must return a particular value.', 'FAIL'],
            ['#37 A wast module that must return a particular value.', 'FAIL'],
            ['#38 A wast module that must return a particular value.', 'FAIL'],
            ['#39 A wast module that must return a particular value.', 'FAIL'],
            ['#40 A wast module that must return a particular value.', 'FAIL'],
            ['#41 A wast module that must return a particular value.', 'FAIL'],
            ['#42 A wast module that must return a particular value.', 'FAIL'],
            ['#43 A wast module that must return a particular value.', 'FAIL'],
            ['#44 A wast module that must return a particular value.', 'FAIL'],
            ['#45 A wast module that must return a particular value.', 'FAIL'],
            ['#46 A wast module that must return a particular value.', 'FAIL'],
            ['#47 A wast module that must return a particular value.', 'FAIL'],
            ['#48 A wast module that must return a particular value.', 'FAIL'],
            ['#49 A wast module that must return a particular value.', 'FAIL'],
            ['#50 A wast module that must return a particular value.', 'FAIL'],
            ['#51 A wast module that must return a particular value.', 'FAIL'],
            ['#52 A wast module that must return a particular value.', 'FAIL'],
            ['#53 A wast module that must return a particular value.', 'FAIL'],
            ['#54 A wast module that must return a particular value.', 'FAIL'],
            ['#55 A wast module that must return a particular value.', 'FAIL'],
            ['#56 A wast module that must return a particular value.', 'FAIL'],
            ['#57 A wast module that must return a particular value.', 'FAIL'],
            ['#58 A wast module that must return a particular value.', 'FAIL'],
            ['#59 A wast module that must return a particular value.', 'FAIL'],
            ['#60 A wast module that must return a particular value.', 'FAIL'],
            ['#61 A wast module that must return a particular value.', 'FAIL'],
            ['#62 A wast module that must return a particular value.', 'FAIL'],
            ['#63 A wast module that must return a particular value.', 'FAIL'],
            ['#64 A wast module that must return a particular value.', 'FAIL'],
            ['#65 A wast module that must return a particular value.', 'FAIL'],
            ['#66 A wast module that must return a particular value.', 'FAIL'],
            ['#67 A wast module that must return a particular value.', 'FAIL'],
            ['#68 A wast module that must return a particular value.', 'FAIL'],
            ['#69 A wast module that must return a particular value.', 'FAIL'],
            ['#70 A wast module that must return a particular value.', 'FAIL'],
            ['#71 A wast module that must return a particular value.', 'FAIL'],
            ['#72 A wast module that must return a particular value.', 'FAIL'],
            ['#73 A wast module that must return a particular value.', 'FAIL'],
            ['#74 A wast module that must return a particular value.', 'FAIL'],
            ['#75 A wast module that must return a particular value.', 'FAIL'],
            ['#76 A wast module that must trap at runtime.', 'FAIL'],
            ['#77 A wast module that must trap at runtime.', 'FAIL'],
            ['#78 A wast module that must trap at runtime.', 'FAIL'],
            ['#79 A wast module that must trap at runtime.', 'FAIL'],
            ['#80 A wast module that must trap at runtime.', 'FAIL'],
            ['#81 A wast module that must trap at runtime.', 'FAIL'],
            ['#82 A wast module that must trap at runtime.', 'FAIL'],
            ['#83 A wast module that must trap at runtime.', 'FAIL'],
            ['#84 A wast module that must trap at runtime.', 'FAIL'],
            ['#85 A wast module that must trap at runtime.', 'FAIL'],
            ['#86 A wast module that must trap at runtime.', 'FAIL'],
            ['#88 module successfully instantiated', 'FAIL'],
            [
                '#89 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#90 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#91 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#92 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#93 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#94 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#95 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#96 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#97 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#98 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#99 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#100 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#101 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#102 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#103 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#104 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#105 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#106 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#107 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#108 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#109 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#110 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#111 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#112 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#113 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#114 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#115 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#116 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#117 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#118 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#119 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#120 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#121 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#122 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#123 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#124 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#125 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#126 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#127 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#128 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#129 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#130 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#131 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#132 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#133 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#134 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#135 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#136 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#137 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#138 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#139 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#140 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#141 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#142 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#143 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#144 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#145 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#146 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#147 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#148 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#149 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#150 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#151 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#152 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#153 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#154 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#155 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#156 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#157 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#158 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#159 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#160 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#161 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#162 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#163 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#164 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#165 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#166 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#167 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#168 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#169 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#170 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#171 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#172 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#173 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#174 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#175 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#176 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#177 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#178 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#179 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#180 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#181 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#182 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#183 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#184 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#185 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#186 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#187 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#188 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#189 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#190 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#191 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#192 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            ['#193 A wast module that must trap at runtime.', 'FAIL'],
            ['#194 A wast module that must trap at runtime.', 'FAIL'],
            ['#195 A wast module that must trap at runtime.', 'FAIL'],
            ['#196 A wast module that must trap at runtime.', 'FAIL'],
            ['#197 A wast module that must trap at runtime.', 'FAIL'],
            ['#198 A wast module that must trap at runtime.', 'FAIL'],
            ['#199 A wast module that must trap at runtime.', 'FAIL'],
            ['#200 A wast module that must trap at runtime.', 'FAIL'],
            ['#201 A wast module that must trap at runtime.', 'FAIL'],
            ['#202 A wast module that must trap at runtime.', 'FAIL'],
            ['#203 A wast module that must trap at runtime.', 'FAIL'],
            ['#204 A wast module that must trap at runtime.', 'FAIL'],
            ['#205 A wast module that must trap at runtime.', 'FAIL'],
            ['#206 A wast module that must trap at runtime.', 'FAIL'],
            ['#207 A wast module that must trap at runtime.', 'FAIL'],
            ['#208 module successfully instantiated', 'FAIL'],
            [
                '#209 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#210 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#211 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#212 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#213 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#214 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#215 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#216 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#217 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#218 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#219 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#220 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#221 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#222 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            ['#223 A wast module that must trap at runtime.', 'FAIL'],
            ['#224 A wast module that must trap at runtime.', 'FAIL'],
            ['#225 A wast module that must trap at runtime.', 'FAIL'],
            ['#226 module successfully instantiated', 'FAIL'],
            [
                '#227 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#228 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#229 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#230 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#231 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#232 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#233 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#234 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#235 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#236 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#237 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#238 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#239 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            [
                '#240 A wast test that runs without any special assertion.',
                'FAIL',
            ],
            ['#241 A wast module that must trap at runtime.', 'FAIL'],
            ['#242 A wast module that must trap at runtime.', 'FAIL'],
            ['#243 A wast module that must trap at runtime.', 'FAIL'],
        ],
    },
});
