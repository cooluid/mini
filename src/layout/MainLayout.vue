<template>
	<div class="main-layout">
		<!-- <header> -->
		<!-- 现有的头部内容 -->
		<!-- <el-button @click="showLogs">显示日志</el-button>
        </header> -->
		<Header @show-settings="$emit('show-settings')" />
		<div class="main-content">
			<slot />
		</div>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import Footer from "./Footer.vue";
import Header from "./Header.vue";

defineEmits(["show-settings"]);
// const showLogs = inject('showLogs') as () => void;
</script>
<style scoped>
.main-layout {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
}

.main-content {
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	position: relative;
}
</style>
