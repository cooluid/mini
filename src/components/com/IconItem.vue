<template>
	<svg class="icon-item" aria-hidden="true" :width="size" :height="size">
		<use :xlink:href="icon"></use>
	</svg>
</template>

<script setup lang="ts">
defineProps({
	icon: String,
	size: {
		type: Number,
		default: 20,
	},
});
</script>

<style scoped>
.icon-item {
	fill: currentColor;
	overflow: hidden;
	transition: color 0.3s ease-in-out;
}

.icon-item:hover {
	cursor: pointer;
}
</style>
