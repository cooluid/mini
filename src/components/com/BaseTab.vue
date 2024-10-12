<template>
	<div :class="['base-tab', { vertical }, sizeClass]" :style="customStyle">
		<ul class="tab-list" ref="tabList" role="tablist">
			<li v-for="(tab) in tabs" :key="tab.name" :class="['tab-item', { active: modelValue === tab.name }]"
				@click="changeTab(tab.name)" :style="{ fontSize: fontSize + 'px' }" role="tab"
				:aria-selected="modelValue === tab.name" :tabindex="modelValue === tab.name ? 0 : -1">
				<i v-if="tab.icon" :class="['tab-icon', tab.icon]" aria-hidden="true"></i>
				{{ tab.label }}
			</li>
			<div class="tab-slider" :style="sliderStyle"></div>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
	tabs: { name: string; label: string; component: any; icon?: string }[];
	vertical?: boolean;
	modelValue: string;
	size?: 'small' | 'medium' | 'large';
	customColor?: string;
	fontSize?: number;
}>();

const isDark = useDark();
const theme = computed(() => {
	return isDark.value ? "dark" : "light";
});

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
}>();

const tabList = ref<HTMLUListElement | null>(null);

const activeIndex = computed(() => {
	return props.tabs.findIndex((tab) => tab.name === props.modelValue);
});

const sliderStyle = computed(() => {
	if (activeIndex.value === -1) return {};
	const tabItems = tabList.value?.querySelectorAll(".tab-item");
	if (!tabItems) return {};

	const activeTab = tabItems[activeIndex.value] as HTMLLIElement;
	return {
		transform: `translateY(${activeTab.offsetTop}px)`,
		height: `${activeTab.offsetHeight}px`,
	};
});

const sizeClass = computed(() => {
	return `size-${props.size || 'medium'}`;
});

const customStyle = computed(() => {
	return props.customColor ? { '--tab-active-color': props.customColor } : {};
});

const changeTab = (tabName: string) => {
	emit("update:modelValue", tabName);
};

onMounted(() => {
	emit("update:modelValue", props.modelValue);
});

watch(() => props.modelValue, () => {
	nextTick(() => {
		const activeTab = tabList.value?.querySelector('.tab-item.active') as HTMLElement;
		if (activeTab) {
			activeTab.focus();
		}
	});
});
</script>

<style scoped>
.base-tab {
	--tab-text-color: v-bind('theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"');
	--tab-active-color: v-bind('theme === "dark" ? "#8c7dff" : "#3e2dd9"');
	--tab-hover-bg: v-bind('theme === "dark" ? "rgba(140, 125, 255, 0.1)" : "rgba(62, 45, 217, 0.1)"');
	--tab-active-bg: v-bind('theme === "dark" ? "rgba(140, 125, 255, 0.2)" : "rgba(62, 45, 217, 0.2)"');

	display: flex;
	height: 100%;
}

.vertical {
	flex-direction: column;
}

.tab-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	height: 100%;
	position: relative;
}

.tab-item {
	padding: 12px 16px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
	color: var(--tab-text-color);
	font-size: 14px;
	display: flex;
	align-items: center;
	font-weight: 500;
	/* 增加字体粗细 */
}

.tab-icon {
	margin-right: 8px;
	font-size: 16px;
}

.tab-item:hover {
	background-color: var(--tab-hover-bg);
	color: var(--tab-active-color);
}

.tab-item.active {
	color: var(--tab-active-color);
	font-weight: 600;
	/* 活跃tab使用更粗的字体 */
	background-color: var(--tab-active-bg);
	/* 添加激活状态的背景色 */
}

.size-small .tab-item {
	padding: 8px 12px;
	font-size: 12px;
}

.size-medium .tab-item {
	padding: 12px 16px;
	font-size: 14px;
}

.size-large .tab-item {
	padding: 16px 20px;
	font-size: 16px;
}

@media (max-width: 768px) {
	.tab-item {
		padding: 10px 14px;
	}
}

.tab-slider {
	position: absolute;
	left: 0;
	width: 4px;
	background-color: var(--tab-active-color);
	transition: transform 0.3s ease-out, height 0.3s ease-out;
}
</style>
