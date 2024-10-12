<script setup lang="ts">
import BaseLayer from "@/components/BaseLayer.vue";
import Home from "@/views/Home.vue";
import { useDark } from "@vueuse/core";
import { watch } from "vue";

const isDark = useDark();

watch(
	isDark,
	(dark) => {
		if (dark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	},
	{ immediate: true }
);
</script>

<template>
	<div id="app" class="bg-white dark:bg-[#383838]">
		<BaseLayer layerType="base">
			<Home />
		</BaseLayer>
	</div>
</template>
