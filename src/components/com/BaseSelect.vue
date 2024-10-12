<template>
	<div
		class="base-select"
		:class="[sizeClass, { 'opacity-50 cursor-not-allowed': disabled }]"
	>
		<select
			:value="modelValue === undefined ? '' : modelValue"
			@change="onChange"
			:disabled="disabled"
			:id="id"
			:class="[
				'bg-white/10 border border-white/20 rounded text-black dark:text-white px-3 focus:outline-none focus:border-primary w-full',
				inputSizeClass,
			]"
		>
			<option
				v-for="option in options"
				:key="option.value"
				:value="option.value"
			>
				{{ option.label }}
			</option>
		</select>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	modelValue: string | number | undefined;
	options: { label: string; value: string | number }[];
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	id?: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
}>();

const onChange = (event: Event) => {
	emit("update:modelValue", (event.target as HTMLSelectElement).value);
};

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
</script>

<style scoped>
.base-select select {
	appearance: none;
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
	background-position: right 0.5rem center;
	background-repeat: no-repeat;
	background-size: 1.5em 1.5em;
	padding-right: 2.5rem;
	transition: all 0.3s ease;
}

.base-select select:focus {
	box-shadow: 0 0 0 2px rgba(62, 45, 217, 0.2);
}

.base-select select:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
