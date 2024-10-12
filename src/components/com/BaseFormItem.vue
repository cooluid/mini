<template>
	<div :class="['base-form-item', sizeClass, { 'mb-4': !noMargin }]">
		<label
			v-if="label"
			:class="[
				'block font-medium mb-1 relative',
				labelSizeClass,
				{ 'text-gray-900 dark:text-white': !labelClass },
			]"
			:for="id"
		>
			{{ label }}
			<span v-if="required" class="text-red-500 ml-1">*</span>
			<span v-if="showHelpIcon" class="inline-block cursor-help relative">
				<IconItem icon="#icon-wenhao" :size="20" />
				<span class="tooltip">{{ helpText }}</span>
			</span>
		</label>
		<div :class="{ 'mt-1': label }">
			<slot :id="id"></slot>
		</div>
		<p v-if="hint" :class="['mt-1 text-xs', hintClass]">{{ hint }}</p>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import IconItem from "@/components/com/IconItem.vue";
const props = defineProps<{
	label?: string;
	id?: string;
	required?: boolean;
	hint?: string;
	size?: "small" | "medium" | "large";
	noMargin?: boolean;
	labelClass?: string;
	hintClass?: string;
	showHelpIcon?: boolean;
	helpText?: string;
}>();

const sizeClass = computed(() => {
	switch (props.size) {
		case "small":
			return "text-sm";
		case "large":
			return "text-lg";
		default:
			return "text-base";
	}
});

const labelSizeClass = computed(() => {
	switch (props.size) {
		case "small":
			return "text-xs";
		case "large":
			return "text-base";
		default:
			return "text-sm";
	}
});
</script>

<style scoped>
.tooltip {
	visibility: hidden;
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-20%);
	background-color: #333;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px 10px;
	opacity: 0;
	transition: opacity 0.3s;
	white-space: nowrap;
	font-size: 12px;
	pointer-events: none;
}

.cursor-help {
	position: relative;
}

.cursor-help:hover .tooltip {
	visibility: visible;
	opacity: 1;
}

/* 确保 tooltip 不会被裁剪 */
.base-form-item {
	overflow: visible;
}
</style>
