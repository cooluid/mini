<template>
	<div
		class="base-switch"
		:class="{ 'opacity-50 cursor-not-allowed': disabled }"
	>
		<span
			v-if="inactiveText"
			class="switch-label mr-2"
			:class="{ 'text-active': !modelValue }"
		>
			{{ inactiveText }}
		</span>
		<label class="switch" :class="sizeClass">
			<input
				type="checkbox"
				:checked="modelValue"
				@change="onChange"
				:disabled="disabled"
			/>
			<span class="slider" :style="sliderStyle"></span>
		</label>
		<span
			v-if="activeText"
			class="switch-label ml-2"
			:class="{ 'text-active': modelValue }"
		>
			{{ activeText }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	modelValue: boolean;
	activeText?: string;
	inactiveText?: string;
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	color?: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void;
	(e: "change", value: boolean): void;
}>();

const onChange = (event: Event) => {
	if (!props.disabled) {
		emit("update:modelValue", (event.target as HTMLInputElement).checked);
		emit("change", (event.target as HTMLInputElement).checked);
	}
};

const sizeClass = computed(() => props.size || "medium");

const sliderStyle = computed(() => ({
	"--switch-color": props.color || "#3498db",
}));
</script>

<style scoped>
.base-switch {
	display: inline-flex;
	align-items: center;
}

.switch-label {
	font-size: 14px;
	color: #666;
	transition: color 0.3s;
}

.text-active {
	color: var(--switch-color, #3498db);
	font-weight: 500;
}

.switch {
	position: relative;
	display: inline-block;
	width: 50px;
	height: 26px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.3s;
	border-radius: 26px;
}

.slider:before {
	position: absolute;
	content: "";
	height: 20px;
	width: 20px;
	left: 3px;
	bottom: 3px;
	background-color: white;
	transition: 0.3s;
	border-radius: 50%;
}

input:checked + .slider {
	background-color: var(--switch-color);
}

input:checked + .slider:before {
	transform: translateX(24px);
}

.switch.small {
	width: 40px;
	height: 22px;
}

.switch.small .slider:before {
	height: 16px;
	width: 16px;
}

.switch.small input:checked + .slider:before {
	transform: translateX(18px);
}

.switch.large {
	width: 60px;
	height: 32px;
}

.switch.large .slider:before {
	height: 26px;
	width: 26px;
}

.switch.large input:checked + .slider:before {
	transform: translateX(28px);
}
</style>
