const bytenode = require("bytenode");
const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "..", "dist_electron");
const outputPath = path.join(__dirname, "..", "dist_electron");

function compileDirectory(dir) {
	if (!fs.existsSync(dir)) {
		console.error(`Directory does not exist: ${dir}`);
		return;
	}

	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, { recursive: true });
	}

	const files = fs.readdirSync(dir);

	for (const file of files) {
		const sourcefile = path.join(dir, file);
		const stat = fs.statSync(sourcefile);

		// !["index.js", "initApp.js"].includes(file) &&
		if (stat.isDirectory()) {
			compileDirectory(sourcefile);
		} else if (
			file.endsWith(".js") &&
			!process.env.SKIP_BYTECODE &&
			file === "JavbusScraper.js"
		) {
			const relativePath = path.relative(sourcePath, dir);
			const outputDir = path.join(outputPath, relativePath);

			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			const outputFile = path.join(outputDir, `${path.parse(file).name}.jsc`);
			try {
				console.log(`Compiling: ${sourcefile}`);

				// 读取原始 JS 文件内容
				const originalContent = fs.readFileSync(sourcefile, "utf8");

				// 确保文件有正确的导出
				const modifiedContent = `
					${originalContent}
					if (typeof JavbusScraper !== 'undefined') {
						module.exports = { JavbusScraper: JavbusScraper };
					} else {
						console.error('JavbusScraper is undefined');
					}
				`;

				// 写入临时文件
				const tempFile = sourcefile + ".temp";
				fs.writeFileSync(tempFile, modifiedContent);

				// 编译临时文件
				const result = bytenode.compileFile({
					filename: tempFile,
					output: outputFile,
					compileAsModule: true,
					electron: true, // 添加这个选项
				});

				// 删除临时文件
				fs.unlinkSync(tempFile);

				console.log(`Compilation result:`, result);
				console.log(`Compiled: ${sourcefile} -> ${outputFile}`);

				// 验证生成的 .jsc 文件
				const jscStats = fs.statSync(outputFile);
				console.log(`JSC file size: ${jscStats.size} bytes`);

				// 读取前20个字节并以十六进制形式输出
				const fd = fs.openSync(outputFile, "r");
				const buffer = Buffer.alloc(20);
				fs.readSync(fd, buffer, 0, 20, 0);
				fs.closeSync(fd);
				console.log(`JSC file first 20 bytes: ${buffer.toString("hex")}`);

				// 在开发模式下保留原始 JS 文件
				if (process.env.NODE_ENV !== "production") {
					fs.copyFileSync(sourcefile, path.join(outputDir, file));
					console.log(
						`Copied original JS file: ${sourcefile} -> ${path.join(
							outputDir,
							file
						)}`
					);
				} else {
					fs.unlinkSync(sourcefile);
					console.log(`Removed original JS file: ${sourcefile}`);
				}
			} catch (error) {
				console.error(`Error compiling ${sourcefile}:`, error);
				// 如果编译失败，保留原始 JS 文件
				fs.copyFileSync(sourcefile, path.join(outputDir, file));
				console.log(
					`Copied original JS file due to compilation error: ${sourcefile} -> ${path.join(
						outputDir,
						file
					)}`
				);
			}
		}
	}
}

function compileFile(filePath) {
	const relativePath = path.relative(sourcePath, filePath);
	const outputFile = path.join(outputPath, relativePath.replace(".js", ".jsc"));

	bytenode.compileFile({
		filename: filePath,
		output: outputFile,
		compileAsModule: true,
	});

	console.log(`Compiled File: ${filePath} -> ${outputFile}`);
}

compileDirectory(sourcePath);
console.log("Bytecode compilation completed.");
