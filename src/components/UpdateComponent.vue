<template>
	<div v-if="dialogVisible"
		class="fixed inset-0 bg-white/60 dark:bg-black/10 backdrop-blur-lg flex items-center justify-center z-50">
		<div
			class="bg-[rgb(255,255,255,0.6)] dark:bg-[rgb(30,30,30,0.6)] rounded-lg shadow-lg p-1 w-100 max-w-md relative">
			<IconItem icon="#icon-guanbi" class="absolute top-2 right-2" @click="closeDialog" />
			<div class="flex flex-col items-center text-center m-3">
				<div class="flex items-center justify-center gap-2">
					<IconItem icon="#icon-gengxin" :size="25" />
					<p class="text-2xl font-bold dark:text-white">新版本可用</p>
				</div>

				<p class="text-gray-600 text-sm dark:text-white">
					我们刚刚发布了一个新版本,包含了许多新功能和改进。立即更新以体验最新版本!
				</p>
				<div class="font-bold mb-1 dark:text-white">版本 {{ newVersion }}</div>
				<div class="w-full">
					<p class="text-right text-sm text-blue-500 underline cursor-pointer" @click="manualDownload">手动下载
					</p>
				</div>

				<el-button v-if="!downloading && !downloaded && !downloadFailed" type="primary" class="w-full"
					@click="startDownload">
					下载更新
				</el-button>
				<el-progress v-if="downloading" :stroke-width="15" :percentage="downloadProgress" :indeterminate="true"
					:striped="downloadProgress < 100" :striped-flow="downloadProgress < 100"
					class="w-full mt-2"></el-progress>
				<el-button v-if="downloaded" type="success" class="w-full" @click="installUpdate">
					安装更新
				</el-button>
				<div v-if="downloadFailed" class="w-full">
					<p class="text-sm text-red-500 mb-1">下载失败,请尝试手动下载</p>
					<el-button type="primary" class="w-full" @click="manualDownload">
						前往下载页面
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { MainToRendererChannels, RendererToMainChannels } from "@/api/electronApiService";
import { useSettingsStore } from "@/stores/settingsStore";
import { UpdateCheckResult, UpdateInfo } from "electron-updater";
import { ElButton, ElMessage, ElProgress } from "element-plus";
import { onMounted, ref } from "vue";
import IconItem from "./com/IconItem.vue";

const newVersion = ref("");
const downloading = ref(false);
const updateInfo = ref<(UpdateInfo & { preferredDownload?: string }) | null>(
	null
);
const downloaded = ref(false);
const downloadFailed = ref(false);
const useStore = useSettingsStore();

const dialogVisible = ref(false);
const downloadProgress = ref(0);

const version = ref("");

const checkForUpdates = async (autoUpdate: boolean = true) => {
	dialogVisible.value = false;
	useStore.updateState = true;

	try {
		const result: UpdateCheckResult = await window.electronAPI.invoke(
			RendererToMainChannels.CHECK_FOR_UPDATES
		);

		useStore.updateState = false;
		if (result && result.updateInfo) {
			if (compareVersions(result.updateInfo.version, version.value) > 0) {
				ElMessage.success(`发现新版本：${result.updateInfo.version}`);
				newVersion.value = result.updateInfo.version;
				updateInfo.value = result.updateInfo;
				dialogVisible.value = true;
			} else {
				!autoUpdate && ElMessage.info("当前已是最新版本");
			}
		}
	} catch (error) {
		console.error("Error checking for updates:", error);
		ElMessage.error("检查更新时出错");
	}
};

const compareVersions = (v1: string, v2: string): number => {
	const parts1 = v1.split(".").map(Number);
	const parts2 = v2.split(".").map(Number);

	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		const part1 = parts1[i] || 0;
		const part2 = parts2[i] || 0;

		if (part1 > part2) return 1;
		if (part1 < part2) return -1;
	}

	return 0;
};

const startDownload = async () => {
	downloading.value = true;
	downloadFailed.value = false;
	try {
		const url = updateInfo.value?.preferredDownload;
		if (!url) {
			throw new Error("找不到更新文件");
		}
		const result = await window.electronAPI.invoke(
			RendererToMainChannels.START_UPDATE_DOWNLOAD,
			url
		);
		if (result.success) {
			downloading.value = false;
			downloaded.value = true;
			ElMessage.success("更新已下载完成");
		} else {
			throw new Error(result.error);
		}
	} catch (error) {
		ElMessage.error("下载更新时出错,请手动下载");
		downloading.value = false;
		downloadFailed.value = true;
	}
};

const manualDownload = () => {
	if (updateInfo.value?.preferredDownload) {
		window.electronAPI.invoke(RendererToMainChannels.OPEN_EXTERNAL_LINK, updateInfo.value.preferredDownload);
	} else {
		ElMessage.error("无法获取下载链接");
	}
};

const installUpdate = () => {
	window.electronAPI.invoke(RendererToMainChannels.INSTALL_UPDATE);
};

const closeDialog = () => {
	dialogVisible.value = false;
};

onMounted(async () => {
	version.value = await window.electronAPI.invoke(
		RendererToMainChannels.GET_APP_VERSION
	);

	window.electronAPI.on(MainToRendererChannels.UPDATE_DOWNLOAD_PROGRESS, (_, progress) => {
		downloading.value = true;
		downloadProgress.value = progress;
	});
});

defineExpose({ checkForUpdates });
</script>
