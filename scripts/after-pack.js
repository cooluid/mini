const fs = require("fs-extra");
const path = require("path");

exports.default = async function (context) {
	const sourceDir = path.join(
		context.appOutDir,
		"..",
		"..",
		"node_modules",
		"better-sqlite3",
		"build",
		"Release"
	);
	const destDir = path.join(
		context.appOutDir,
		"Contents",
		"Resources",
		"app.asar.unpacked",
		"node_modules",
		"better-sqlite3",
		"build",
		"Release"
	);

	await fs.ensureDir(destDir);
	await fs.copy(sourceDir, destDir);
};
