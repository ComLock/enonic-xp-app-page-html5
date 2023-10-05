/* eslint-disable no-console */
//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {globSync} from 'glob';
import path from 'path';

//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
//const MODE = 'development';
const MODE = 'production';

const JS_EXTENSION_GLOB_BRACE = '*.{ts,es,es6,mjs,jsx,flow,js}';
const ASSETS_PATH_GLOB_BRACE = '{site/assets,assets}';

const SRC_DIR = 'src/main/resources';
const DST_DIR = 'build/resources/main';

const context = path.resolve(__dirname, SRC_DIR);
const extensions = ['.ts', '.es', '.js', '.json']; // used in resolve
const outputPath = path.join(__dirname, DST_DIR);

//──────────────────────────────────────────────────────────────────────────────
// Functions
//──────────────────────────────────────────────────────────────────────────────
//const toStr = v => JSON.stringify(v, null, 4);
const dict = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })));

//──────────────────────────────────────────────────────────────────────────────
// Server-side Javascript
//──────────────────────────────────────────────────────────────────────────────
const ALL_JS_ASSETS_GLOB = `${SRC_DIR}/${ASSETS_PATH_GLOB_BRACE}/**/${JS_EXTENSION_GLOB_BRACE}`;
//console.log(`ALL_JS_ASSETS_GLOB:${toStr(ALL_JS_ASSETS_GLOB)}`);

const ALL_JS_ASSETS_FILES = globSync(ALL_JS_ASSETS_GLOB);
//console.log(`ALL_JS_ASSETS_FILES:${toStr(ALL_JS_ASSETS_FILES)}`);

const SERVER_JS_FILES = globSync(`${SRC_DIR}/**/${JS_EXTENSION_GLOB_BRACE}`, {
	ignore: ALL_JS_ASSETS_FILES
});
//console.log(`SERVER_JS_FILES:${toStr(SERVER_JS_FILES)}`);

const SERVER_JS_ENTRY = dict(SERVER_JS_FILES.map((k) => [
	k.replace(`${SRC_DIR}/`, '').replace(/\.[^.]*$/, ''), // name
	`.${k.replace(`${SRC_DIR}`, '')}` // source relative to context
]));
//console.log(`SERVER_JS_ENTRY:${toStr(SERVER_JS_ENTRY)}`);

const SERVER_JS_CONFIG = {
	context,
	entry: SERVER_JS_ENTRY,
	externals: [
		/^\//
	],
	devtool: false, // Don't waste time generating sourceMaps
	mode: MODE,
	module: {
		rules: [{
			test: /\.(ts|es6?|js)$/, // Will need js for node module depenencies
			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: false,
					plugins: [
						'@babel/plugin-transform-arrow-functions',
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-export-default-from',
						'@babel/plugin-proposal-export-namespace-from',
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-syntax-dynamic-import', // Allow parsing of import()
						'@babel/plugin-syntax-throw-expressions',
						'@babel/plugin-transform-block-scoped-functions',
						'@babel/plugin-transform-block-scoping',
						'@babel/plugin-transform-classes',
						'@babel/plugin-transform-computed-properties',
						'@babel/plugin-transform-destructuring',
						'@babel/plugin-transform-duplicate-keys',
						'@babel/plugin-transform-for-of',
						'@babel/plugin-transform-function-name',
						'@babel/plugin-transform-instanceof',
						'@babel/plugin-transform-literals',
						'@babel/plugin-transform-new-target',
						'@babel/plugin-transform-member-expression-literals',
						'@babel/plugin-transform-modules-commonjs',
						'@babel/plugin-transform-object-assign',
						'@babel/plugin-transform-object-super',
						'@babel/plugin-transform-parameters',
						'@babel/plugin-transform-property-literals',
						'@babel/plugin-transform-property-mutators',
						'@babel/plugin-transform-reserved-words',
						'@babel/plugin-transform-shorthand-properties',
						'@babel/plugin-transform-spread',
						'@babel/plugin-transform-sticky-regex',
						'@babel/plugin-transform-template-literals',
						'@babel/plugin-transform-typeof-symbol',
						'@babel/plugin-transform-unicode-escapes',
						'@babel/plugin-transform-unicode-regex',
						'array-includes',
						'optimize-starts-with'
					],
					presets: [
						'@babel/preset-typescript',
						[
							'@babel/preset-env',
							{
								corejs: 3, // Needed when useBuiltIns: usage

								// Enables all transformation plugins and as a result,
								// your code is fully compiled to ES5
								forceAllTransforms: true,

								targets: {
									esmodules: false, // Enonic XP doesn't support ECMAScript Modules

									// https://node.green/
									node: '0.10.48'
									//node: '5.12.0'

								},

								//useBuiltIns: false // no polyfills are added automatically
								useBuiltIns: 'entry' // replaces direct imports of core-js to imports of only the specific modules required for a target environment
								//useBuiltIns: 'usage' // polyfills will be added automatically when the usage of some feature is unsupported in target environment
							}
						]
					]
				} // options
			}] // use
		}] // rules
	}, // module
	output: {
		path: outputPath,
		filename: '[name].js',
		libraryTarget: 'commonjs'
	}, // output
	resolve: {
		alias: {
			'/content-types': path.resolve(__dirname, SRC_DIR, 'site', 'content-types'),
			'/lib': path.resolve(__dirname, SRC_DIR, 'lib'),
			'/mixins': path.resolve(__dirname, SRC_DIR, 'site', 'mixins'),
			'/services': path.resolve(__dirname, SRC_DIR, 'services'),
			'/site': path.resolve(__dirname, SRC_DIR, 'site')
		},
		extensions
	} // resolve
};
//console.log(`SERVER_JS_CONFIG:${JSON.stringify(SERVER_JS_CONFIG, null, 4)}`);

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
const WEBPACK_CONFIG = [
	SERVER_JS_CONFIG
];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
