import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import typescript from '@rollup/plugin-typescript';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import fs from 'fs';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

// Function to copy translation files
function copyTranslations() {
  return {
    name: 'copy-translations',
    buildEnd() {
      const srcDir = path.join('src', 'i18n', 'locales');
      const destDir = path.join('dist', 'locales');
      
      // Create the destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy all JSON files from src/i18n/locales to dist/locales
      fs.readdirSync(srcDir)
        .filter(file => file.endsWith('.json'))
        .forEach(file => {
          fs.copyFileSync(
            path.join(srcDir, file),
            path.join(destDir, file)
          );
        });
    }
  };
}

const extensions = ['.ts', '.tsx'];

const indexConfig = {
  context: 'this',
  plugins: [
    resolve({ extensions, browser: true }),
    commonjs(),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        'solid',
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
      ],
      extensions,
    }),
    postcss({
      plugins: [autoprefixer(), tailwindcss()],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: true,
      inject: false,
    }),
    typescript(),
    typescriptPaths({ preserveExtensions: true }),
    copyTranslations(),
    terser({ output: { comments: false } }),
    ...(isDev
      ? [
          serve({
            open: true,
            verbose: true,
            contentBase: ['dist', 'public', 'src/i18n'],  // Add src/i18n to contentBase
            host: 'localhost',
            port: 5678,
          }),
          livereload({ watch: ['dist', 'src/i18n/locales'] }),  // Watch translation files
        ]
      : []),
  ],
};

const configs = [
  {
    ...indexConfig,
    input: './src/web.ts',
    output: {
      file: 'dist/web.js',
      format: 'es',
    },
  },
  {
    ...indexConfig,
    input: './src/web.ts',
    output: {
      file: 'dist/web.umd.js',
      format: 'umd',
      name: 'FlowiseEmbed',
    },
  },
];

export default configs;
