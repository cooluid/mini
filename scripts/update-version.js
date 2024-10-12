const fs = require("fs");
const path = require("path");

const updateVersion = async () => {
	const { Octokit } = await import("@octokit/rest");
	const octokit = new Octokit({ auth: process.env.GH_TOKEN });

	// 读取 CHANGELOG.md
	const changelogPath = path.join(__dirname, "..", "CHANGELOG.md");
	const changelog = fs.readFileSync(changelogPath, "utf-8");

	// 提取最新版本的更新日志
	const latestVersionRegex = /## \[\d+\.\d+\.\d+\][\s\S]*?(?=\n## \[|$)/;
	const latestVersionMatch = changelog.match(latestVersionRegex);

	if (!latestVersionMatch) {
		// console.error("无法在 CHANGELOG.md 中找到最新版本信息");
		process.exit(1);
	}

	const latestVersionInfo = latestVersionMatch[0].trim();

	// 提取版本号
	const versionMatch = latestVersionInfo.match(/## \[(\d+\.\d+\.\d+)\]/);
	if (!versionMatch) {
		console.error("无法提取版本号");
		process.exit(1);
	}

	const newVersion = versionMatch[1];

	// 检查版本是否已存在
	try {
		const { data: releases } = await octokit.repos.listReleases({
			owner: "yrcoolio",
			repo: "vio",
		});

		const existingRelease = releases.find(
			(release) => release.tag_name === `v${newVersion}`
		);
		if (existingRelease) {
			console.error(`版本 ${newVersion} 已经存在，无法重复发布。`);
			process.exit(1);
		}
	} catch (error) {
		console.error("检查现有版本时出错:", error);
		process.exit(1);
	}

	// 更新 package.json
	const packageJsonPath = path.join(__dirname, "..", "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	packageJson.version = newVersion;

	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

	// 生成最新版本的更新日志
	const latestChangelogPath = path.join(__dirname, "..", "CHANGELOG-latest.md");
	fs.writeFileSync(latestChangelogPath, latestVersionInfo);

	console.log(`版本已更新至 ${newVersion}`);
	console.log("已生成最新版本的更新日志");

	// 使用 GitHub API 设置发布说明
	try {
		await octokit.repos.createRelease({
			owner: "yrcoolio",
			repo: "vio",
			tag_name: `v${newVersion}`,
			name: `v${newVersion}`,
			body: latestVersionInfo,
			draft: false,
			prerelease: false,
		});
		console.log(`版本 ${newVersion} 的发布说明已更新`);
	} catch (error) {
		console.error("更新发布说明时出错:", error);
		process.exit(1);
	}
};

updateVersion().catch(console.error);
