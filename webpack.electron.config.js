const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
	const isProduction = argv.mode === "production";
	return {
		mode: isProduction ? "production" : "development",
		target: "electron-main",
		entry: "./electron/index.ts",
		output: {
			path: path.resolve(__dirname, "dist_electron"),
			filename: "index.js",
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [
						{
							loader: "ts-loader",
							options: {
								configFile: "tsconfig.electron.json",
							},
						},
					],
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: [".ts", ".js"],
			alias: {
				"@electron": path.resolve(__dirname, "electron"),
			},
			fallback: {
				path: require.resolve("path-browserify"),
				fs: false,
				child_process: false,
				net: false,
				tls: false,
				bufferutil: false,
				"utf-8-validate": false,
				http: false,
				https: false,
				zlib: false,
				stream: false,
			},
		},
		optimization: isProduction
			? {
					minimize: true,
					minimizer: [
						new TerserPlugin({
							terserOptions: {
								compress: {
									drop_console: true, // 移除 console 语句
									dead_code: true,
									conditionals: true,
									evaluate: true,
									booleans: true,
									loops: true,
									unused: true,
									hoist_funs: true,
									keep_fargs: false,
									hoist_vars: true,
									if_return: true,
									join_vars: true,
									side_effects: true,
									warnings: false,
								},
								mangle: true, // 混淆变量名
								output: {
									comments: false, // 移除注释
								},
							},
						}),
					],
					splitChunks: {
						chunks: "all",
						name: "main",
					},
			  }
			: {},
		node: {
			__dirname: false,
			__filename: false,
			global: true,
		},
		ignoreWarnings: [
			{
				module: /node_modules\/cosmiconfig/,
				message: /Critical dependency/,
			},

			{
				module: /node_modules\/@types\/node/,
				message: /Critical dependency/,
			},
			{
				module: /node_modules\/import-fresh/,
				message: /Critical dependency/,
			},
			{
				module: /node_modules\/picocolors/,
				message: /Critical dependency/,
			},
			{
				module: /node_modules\/typescript/,
				message: /Critical dependency/,
			},
			{
				module: /node_modules\/yargs-parser/,
				message: /Critical dependency/,
			},
			{
				module: /node_modules\/yargs/,
				message: /Critical dependency/,
			},
		],
		externals: {
			puppeteer: 'require("puppeteer")',
		},
	};
};
