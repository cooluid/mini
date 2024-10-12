<template>
	<div
		class="bg-[rgb(101,69,241)] dark:bg-black backdrop-blur-10 w-full h-10 relative flex items-center justify-between"
	>
		<div class="left-section">
			<div class="drag-area"></div>
		</div>
		<div class="right-section">
			<IconItem
				icon="#icon-shezhi"
				:size="20"
				@click="$emit('show-settings')"
				class="no-drag"
			/>
			<IconItem
				:icon="themeIcon"
				:size="18"
				@click="setTheme"
				class="no-drag"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import IconItem from "@/components/com/IconItem.vue";
import { useDark, useToggle } from "@vueuse/core";
import { computed } from "vue";

const emit = defineEmits(["show-settings"]);

const isDark = useDark();
const toggleDark = useToggle(isDark);
const themeIcon = computed(() =>
	isDark.value ? "#icon-a-zu4" : "#icon-icon_qingtian"
);
const setTheme = () => {
	toggleDark();
};

// 移除了 showSettings 函数，直接在模板中触发事件
</script>

<style scoped>
.left-section {
	flex-grow: 1;
	height: 100%;
	-webkit-app-region: drag;
}

.right-section {
	display: flex;
	align-items: center;
	gap: 10px;
	padding-right: 10px;
}

.no-drag {
	-webkit-app-region: no-drag;
}
</style>
