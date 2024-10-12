<template>
	<button
		class="rounded-md text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md whitespace-nowrap"
		:class="[
			variantClass,
			sizeClass,
			{ 'opacity-50 cursor-not-allowed': disabled || loading },
		]" :disabled="disabled || loading">
		<template v-if="loading">
			<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			{{ loadingText || "加载中..." }}
		</template>
		<slot v-else></slot>
	</button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	variant: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	loading?: boolean;
	loadingText?: string;
}>();

const variantClass = computed(() => ({
	"bg-primary hover:bg-primary/80 text-white focus:ring-primary/50":
		props.variant === "primary",
	"bg-white/20 hover:bg-white/20 text-white focus:ring-white/30":
		props.variant === "secondary",
	"bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50":
		props.variant === "danger",
	"bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/50":
		props.variant === "success",
	"bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400/50":
		props.variant === "warning",
	"bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400/50":
		props.variant === "info",
}));

const sizeClass = computed(() => ({
	"text-xs px-3 py-1": props.size === "small",
	"text-sm px-4 py-1.5": props.size === "medium" || !props.size,
	"text-base px-5 py-2": props.size === "large",
}));
</script>

<style scoped>
button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
}
</style>
