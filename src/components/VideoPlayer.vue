<template>
	<div class="w-full h-auto">
		<video
			ref="videoElement"
			class="video-js vjs-custom-theme"
			:id="playerId"
		></video>
	</div>
</template>

<script setup lang="ts">
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

// Props 传入数据
const props = defineProps<{
	options: {
		sources: Array<{ src: string; type: string }>;
		autoplay: boolean;
		controls: boolean;
		fluid: boolean;
	};
}>();

const emit = defineEmits(["error"]);

// DOM 引用
const videoElement = ref<HTMLVideoElement | null>(null);
const playerId = ref(`video-player-${Date.now()}`);

// Video.js 实例
let player: any = null;

// 循环的起始点
const loopStart = ref<number | null>(null);
const loopEnd = ref<number | null>(null);

// 挂载时初始化 Video.js
onMounted(() => {
	if (videoElement.value) {
		player = videojs(videoElement.value, props.options);

		// 添加事件监听
		player.on("timeupdate", handleLoop);
		player.on("error", (error: any) => emit("error", error));

		// 全局键盘事件监听
		window.addEventListener("keydown", handleKeyPress);
	}
});

// 清理事件与播放器
onBeforeUnmount(() => {
	if (player) {
		player.dispose();
	}
	window.removeEventListener("keydown", handleKeyPress);
});

// 监听视频源变化
watch(
	() => props.options.sources,
	(newSources) => {
		if (player && newSources.length > 0) {
			player.src(newSources);
		}
	}
);

// 处理键盘事件
const handleKeyPress = (event: KeyboardEvent) => {
	if (!player) return;

	switch (event.key) {
		case "[": // 设置 A 点
			setLoopPoint("A");
			break;
		case "]": // 设置 B 点
			setLoopPoint("B");
			break;
		case "p":
		case "P": // 取消循环
			cancelLoop();
			break;
	}
};

// 设置 A/B 点
const setLoopPoint = (point: "A" | "B") => {
	if (player) {
		const currentTime = player.currentTime();
		if (point === "A") {
			loopStart.value = currentTime;
		} else if (point === "B") {
			loopEnd.value = currentTime;
		}
	}
};

// 取消循环
const cancelLoop = () => {
	loopStart.value = null;
	loopEnd.value = null;
};

// 处理 AB 循环逻辑
const handleLoop = () => {
	if (player && loopStart.value !== null && loopEnd.value !== null) {
		if (player.currentTime() >= loopEnd.value) {
			player.currentTime(loopStart.value);
		}
	}
};
</script>
