<template>
	<div class="base-input" :class="[sizeClass, { flex: hasAppend }]">
		<input
			:type="type"
			:value="modelValue === undefined ? '' : modelValue"
			@input="handleInput"
			:class="[
				'bg-white/10 border border-white/20 text-black dark:text-white px-3 focus:outline-none focus:border-primary',
				{ rounded: !hasAppend, 'rounded-l': hasAppend },
				inputSizeClass,
			]"
			:placeholder="placeholder"
			:disabled="disabled"
			:id="id"
			:min="min"
			:max="max"
			:step="step"
		/>
		<slot name="append"></slot>
	</div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = defineProps<{
	modelValue: string | number | undefined; // 允许 undefined
	placeholder?: string;
	type?: string;
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	id?: string;
	min?: string | number; // 改为 string | number
	max?: string | number; // 改为 string | number
	step?: string | number; // 改为 string | number
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: string | number | undefined): void;
}>();

const hasAppend = computed(() => !!useSlots().append);

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

const inputSizeClass = computed(() => {
	switch (props.size) {
		case "small":
			return "py-1";
		case "large":
			return "py-3";
		default:
			return "py-2";
	}
});

const handleInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	let value: string | number | undefined = target.value;

	if (props.type === "number") {
		const numValue = target.valueAsNumber;
		value = isNaN(numValue) ? undefined : numValue;
	}

	emit("update:modelValue", value);
};
</script>

<style scoped>
.base-input input {
	width: 100%;
	transition: all 0.3s ease;
}

.base-input input:focus {
	box-shadow: 0 0 0 2px rgba(62, 45, 217, 0.2);
}

.base-input input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
