<template>
	<div class="text-gray-600 dark:text-gray-200 flex flex-col text-sm">
		<p>酷影是一个强大的影片管理工具，具有以下功能：</p>
		<ul>
			<li>自动刮削影片信息</li>
			<li>智能重命名文件</li>
			<li>元数据管理</li>
			<li>多源数据抓取</li>
		</ul>
		<BaseButton variant="primary" @click="onFeedback"
			>有建议或问题要反馈？</BaseButton
		>
		<div class="pt-10 flex items-center gap-2">
			<p class="text-sm text-gray-600 dark:text-gray-200">
				当前版本：v{{ version }}
			</p>
			<el-button @click="onCheckForUpdates" size="small" :loading="checking"
				>检查新版本</el-button
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import { RendererToMainChannels } from "@/api/electronApiService";
import BaseButton from "@/components/com/BaseButton.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { ElButton } from "element-plus";
import { computed, inject, onMounted, ref } from "vue";
const version = ref("");
const useStore = useSettingsStore();
const checking = computed(() => useStore.updateState);

onMounted(async () => {
	version.value = await window.electronAPI.invoke(
		RendererToMainChannels.GET_APP_VERSION
	);
});

const onFeedback = () => {
	window.electronAPI.invoke(
		RendererToMainChannels.OPEN_EXTERNAL_LINK,
		"https://github.com/yrcoolio/vio/issues"
	);
};

const checkForUpdates = inject("checkForUpdates") as (
	autoUpdate: boolean
) => void;

const onCheckForUpdates = async () => {
	checkForUpdates(false);
};
</script>
