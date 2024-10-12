<template>
	<div class="base-multi-select" :class="[sizeClass, { 'opacity-50 cursor-not-allowed': disabled }]"
		ref="dropdownRef">
		<div @click="toggleDropdown" :class="[
			'bg-white/5 border border-white/10 rounded text-white px-2 focus:outline-none focus:border-primary w-full cursor-pointer flex items-center justify-between',
			inputSizeClass
		]">
			<div class="flex flex-wrap gap-1 items-center">
				<span v-if="selectedLabels.length === 0" class="text-gray-400 text-xs">请选择</span>
				<span v-for="label in selectedLabels" :key="label"
					class="bg-primary/10 text-white dark:text-blue-500 px-1.5 py-0.5 rounded text-xs">
					{{ label }}
				</span>
			</div>
			<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<Transition name="fade">
			<div v-if="isOpen"
				class="absolute mt-1 w-full bg-white/90 backdrop-blur-lg border border-white/20 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
				<div class="p-1">
					<label v-for="option in options" :key="option.value"
						class="flex items-center p-1.5 hover:bg-gray-700/50 cursor-pointer text-xs text-gray-600">
						<input type="checkbox" :value="option.value" v-model="selectedValues"
							class="mr-2 form-checkbox h-3 w-3 text-primary border-gray-500 rounded bg-transparent"
							:disabled="disabled" />
						<span>{{ option.label }}</span>
					</label>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
	modelValue: string[];
	options: { label: string; value: string }[];
	size?: 'small' | 'medium' | 'large';
	disabled?: boolean;
	id?: string;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: string[]): void;
}>();

const isOpen = ref(false);
const selectedValues = ref<string[]>(props.modelValue);

const toggleDropdown = () => {
	if (!props.disabled) {
		isOpen.value = !isOpen.value;
	}
};

const selectedLabels = computed(() => {
	const ary = props.options
		.filter((option: { value: string }) => selectedValues.value.includes(option.value))
		.map((option: { label: string }) => option.label);
	return ary;
});

watch(selectedValues, (newValues) => {
	emit('update:modelValue', newValues);
});

const sizeClass = computed(() => {
	switch (props.size) {
		case 'small': return 'text-sm';
		case 'large': return 'text-lg';
		default: return 'text-base';
	}
});

const inputSizeClass = computed(() => {
	switch (props.size) {
		case 'small': return 'py-1';
		case 'large': return 'py-3';
		default: return 'py-2';
	}
});

// 添加点击外部关闭下拉框的功能
const closeDropdown = (e: MouseEvent) => {
	if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
		isOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
	document.removeEventListener('click', closeDropdown);
});

const dropdownRef = ref<HTMLElement | null>(null);
</script>

<style scoped>
.base-multi-select {
	position: relative;
	font-size: 0.875rem;
}

.base-multi-select .form-checkbox:checked {
	background-color: var(--primary-color, #3e2dd9);
	border-color: var(--primary-color, #3e2dd9);
}

.base-multi-select .form-checkbox:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(62, 45, 217, 0.2);
}

/* 自定义滚动条样式 */
.base-multi-select div::-webkit-scrollbar {
	width: 6px;
}

.base-multi-select div::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.1);
}

.base-multi-select div::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 3px;
}

.base-multi-select div::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.4);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
