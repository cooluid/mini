const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SECRET_KEY = "yrcoolio.!".padEnd(32, "0");
const IV_LENGTH = 16;

const sourceDir = path.join(__dirname, "..", "dist_electron");

const excludeList = [
	"JavbusScraper.js",
	"BaseScraper.js",
	"MissavScraper.js",
	"JavdbScraper.js",
	"SupjavScraper.js",
];

function shouldExclude(filePath) {
	return excludeList.some((item) => filePath.includes(item));
}

function obfuscateFile(filePath) {
	if (shouldExclude(filePath)) {
		console.log(`Skipping obfuscation for excluded file: ${filePath}`);
		return;
	}

	const code = fs.readFileSync(filePath, "utf8");
	const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
		compact: true,
		controlFlowFlattening: false,
		deadCodeInjection: false,
		debugProtection: false,
		disableConsoleOutput: false,
		identifierNamesGenerator: "hexadecimal",
		log: false,
		renameGlobals: false,
		rotateStringArray: true,
		selfDefending: false,
		shuffleStringArray: true,
		splitStrings: false,
		stringArray: true,
		stringArrayEncoding: ["base64"],
		stringArrayThreshold: 0.75,
		transformObjectKeys: false,
		unicodeEscapeSequence: false,
		reservedNames: ["arguments"],
		reservedStrings: ["arguments"],
		target: "browser",
		// 保持现有的混淆选项不变
	});
	const obfuscatedCode = obfuscationResult.getObfuscatedCode();

	// 将混淆后的代码写入原文件
	fs.writeFileSync(filePath, obfuscatedCode);
	console.log(`File obfuscated successfully: ${filePath}`);
}

function obfuscateDirectory(dir) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			obfuscateDirectory(filePath);
		} else if (path.extname(file) === ".js" && !shouldExclude(filePath)) {
			obfuscateFile(filePath);
		}
	}
}

obfuscateDirectory(sourceDir);
console.log("Obfuscation completed successfully.");
