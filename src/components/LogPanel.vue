<template>
	<TransparentPanel v-model="dialogVisible" :closeOnOverlayClick="true">
		<div class="flex flex-col h-full w-full overflow-hidden">
			<header class="flex justify-between items-center p-4">
				<h2 class="text-2xl font-bold text-black dark:text-white">操作日志</h2>
				<IconItem
					title="清理日志"
					icon="#icon-clear"
					@click="clearLog"
					class="text-white px-3 py-1.5"
				/>
			</header>

			<div
				class="flex-1 bg-[rgb(31,41,55,0.05)] dark:bg-white/5 rounded-lg overflow-hidden flex flex-col mx-4 mb-4"
			>
				<div class="flex-1 overflow-y-auto overflow-x-hidden p-4">
					<p
						v-for="(log, index) in logList"
						:key="index"
						class="text-sm text-coolgray-700 dark:text-blueGray-500 border-b border-gray dark:border-blueGray-500 border-b-dashed py-1 break-words"
					>
						{{ log }}
					</p>
				</div>
			</div>
		</div>
	</TransparentPanel>
</template>

<script setup lang="ts">
import TransparentPanel from "@/components/TransparentPanel.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { computed, ref } from "vue";
import IconItem from "./com/IconItem.vue";

const dialogVisible = ref(false);
const settingsStore = useSettingsStore();
const logList = computed(() => {
	return settingsStore.logs;
});

const showDialog = () => {
	dialogVisible.value = true;
};

const clearLog = () => {
	settingsStore.removeLog();
};

defineExpose({ showDialog });
</script>

<style scoped>
.break-words {
	word-wrap: break-word;
	word-break: break-all;
}
</style>
