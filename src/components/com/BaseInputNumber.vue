<template>
	<div class="base-input-number" :class="[sizeClass, { 'opacity-50 cursor-not-allowed': disabled }]">
		<input type="number" :value="modelValue" @input="onInput" :min="min" :max="max" :step="step"
			:disabled="disabled" :id="id" :placeholder="placeholder" :class="[
				'bg-white/20 border border-white/30 rounded text-gray-600 dark:text-gray-300 placeholder-gray-400 px-3 focus:outline-none focus:border-primary focus:bg-white/30 w-full',
				inputSizeClass
			]" />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	id?: string;
	placeholder?: string;
	size?: 'small' | 'medium' | 'large';
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: number): void;
}>();

const onInput = (event: Event) => {
	const value = Number((event.target as HTMLInputElement).value);
	emit('update:modelValue', value);
};

const sizeClass = computed(() => {
	switch (props.size) {
		case 'small': return 'text-xs';
		case 'large': return 'text-base';
		default: return 'text-sm';
	}
});

const inputSizeClass = computed(() => {
	switch (props.size) {
		case 'small': return 'py-1';
		case 'large': return 'py-2.5';
		default: return 'py-1.5';
	}
});
</script>
