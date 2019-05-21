import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const production = !process.env.ROLLUP_WATCH

export default [
    {
        input: 'src/main.js',
        output: {
            file: 'dist/main.js',
            format: 'cjs'
        }
    },
    {
        input: 'src/renderer.js',
        output: {
            file: 'dist/renderer.js',
            format: 'cjs',
            sourcemap: true,
            name: 'app'
        },
        plugins: [
            svelte({
                dev: !production,
                css: css => {
                    css.write('dist/bundle.css');
                }
            }),
            resolve(),
            commonjs(),

            // !production && livereload('public'),
            // production && terser()
        ]
    }
]