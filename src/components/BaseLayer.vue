<template>
	<div :style="{ zIndex: zIndex }">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { layerManager, LayerType } from "@/utils/LayerManager";
import { computed } from "vue";

const props = defineProps<{
	layerType: LayerType;
}>();

const zIndex = computed(() => {
	return layerManager.getZIndex(props.layerType);
});
</script>
