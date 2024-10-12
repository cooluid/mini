<template>
	<BaseLayer layerType="base">
		<div class="home">
			<MainLayout @show-settings="showSettings">
				<div class="curve-decoration">
					<svg
						class="wave wave1 fill-[rgb(101,69,241)] dark:fill-black"
						viewBox="0 0 1440 320"
						preserveAspectRatio="none"
					>
						<path
							d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,144C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
						></path>
					</svg>
					<svg
						class="wave wave2 fill-[rgb(101,69,241)] dark:fill-black"
						viewBox="0 0 1440 320"
						preserveAspectRatio="none"
					>
						<path
							d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,112C672,128,768,192,864,202.7C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
						></path>
					</svg>
				</div>
				<div class="floating-balls">
					<div class="ball ball1 bg-[rgb(93,0,253,0.5)] dark:bg-black"></div>
					<div class="ball ball2 bg-[rgb(93,0,253,0.5)] dark:bg-black"></div>
					<div class="ball ball3 bg-[rgb(93,0,253,0.5)] dark:bg-black"></div>
					<div class="ball ball4 bg-[rgb(93,0,253,0.5)] dark:bg-black"></div>
					<div class="ball ball5 bg-[rgb(93,0,253,0.5)] dark:bg-black"></div>
				</div>
			</MainLayout>
		</div>
	</BaseLayer>

	<BaseLayer layerType="modal" v-if="isSettingsVisible">
		<SettingsView
			ref="settingsViewRef"
			:settings="settings"
			@update-settings="updateSettings"
		/>
	</BaseLayer>

	<BaseLayer layerType="modal" v-if="isLogPanelVisible">
		<LogPanel ref="logPanelRef" />
	</BaseLayer>

	<BaseLayer layerType="modal" v-if="isPerformanceChartVisible">
		<PerformanceChartPanel ref="performanceMonitorPanelRef" />
	</BaseLayer>

	<BaseLayer layerType="tooltip" v-if="isUpdateComponentVisible">
		<UpdateComponent ref="updateComponentRef" />
	</BaseLayer>
</template>

<script setup lang="ts">
import { MainToRendererChannels } from "@/api/electronApiService";
import BaseLayer from "@/components/BaseLayer.vue";
import LogPanel from "@/components/LogPanel.vue";
import SettingsView from "@/components/settings/SettingsView.vue";
import UpdateComponent from "@/components/UpdateComponent.vue";
import MainLayout from "@/layout/MainLayout.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { UserSettings } from "electron/types";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { nextTick, onMounted, provide, ref } from "vue";
const settingsViewRef = ref<InstanceType<typeof SettingsView> | null>(null);
const logPanelRef = ref<InstanceType<typeof LogPanel> | null>(null);

const updateComponentRef = ref<InstanceType<typeof UpdateComponent> | null>(
	null
);

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const showSettings = () => {
	isSettingsVisible.value = true;
	nextTick(() => {
		settingsViewRef.value?.showDialog();
	});
};

const showLogsView = () => {
	isLogPanelVisible.value = true;
	nextTick(() => {
		logPanelRef.value?.showDialog();
	});
};

provide("logPanelVisible", showLogsView);

const updateSettings = async (newSettings: Partial<UserSettings>) => {
	await settingsStore.updateSettings(newSettings);
};

const checkForUpdates = (autoUpdate: boolean = true) => {
	isUpdateComponentVisible.value = true;
	nextTick(() => {
		updateComponentRef.value?.checkForUpdates(autoUpdate);
	});
};

provide("checkForUpdates", checkForUpdates);

onMounted(async () => {
	await settingsStore.loadSettings();
	window.electronAPI.on(MainToRendererChannels.TIP_MESSAGE, handleTipMessage);
});

const handleTipMessage = (event: any, type: string, message: string) => {
	switch (type) {
		case "warning":
			ElMessage.warning(message);
			break;
		case "success":
			ElMessage.success(message);
			break;
		default:
			ElMessage.info(message);
			break;
	}
};

const isSettingsVisible = ref(false);
const isLogPanelVisible = ref(false);
const isPerformanceChartVisible = ref(false);
const isUpdateComponentVisible = ref(false);
</script>

<style scoped>
.home {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.batch-progress {
	margin: 0;
}

.curve-decoration {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 28vh;
	overflow: hidden;
	pointer-events: none;
}

.wave {
	position: absolute;
	top: 0;
	left: 0;
	width: 200%;
	height: 100%;
	animation: wave 20s linear infinite;
}

.wave1 {
	animation-duration: 20s;
	animation-delay: -5s;
	opacity: 0.5;
}

.wave2 {
	animation-duration: 15s;
	animation-delay: -2s;
}

@keyframes wave {
	0% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(-50%);
	}
}

.floating-balls {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.ball {
	position: absolute;
	border-radius: 50%;
	opacity: 0.8;
	animation: float 10s infinite ease-in-out;
}

.ball1 {
	width: 50px;
	height: 50px;
	top: 20%;
	left: 10%;
	animation-duration: 12s;
}

.ball2 {
	width: 70px;
	height: 70px;
	top: 40%;
	left: 30%;
	animation-duration: 15s;
}

.ball3 {
	width: 150px;
	height: 150px;
	top: 60%;
	left: 50%;
	animation-duration: 18s;
}

.ball4 {
	width: 80px;
	height: 80px;
	top: 80%;
	left: 70%;
	animation-duration: 20s;
}

.ball5 {
	width: 60px;
	height: 60px;
	top: 50%;
	left: 90%;
	animation-duration: 22s;
}

@keyframes float {
	0% {
		transform: translateY(0) translateX(0);
	}

	50% {
		transform: translateY(-20px) translateX(20px);
	}

	100% {
		transform: translateY(0) translateX(0);
	}
}

.content-wrapper {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.decoration {
	position: absolute;
	width: 200px;
	height: 200px;
	border-radius: 50%;
	opacity: 0.6;
}

.bottom-left {
	bottom: -100px;
	left: -100px;
	background: linear-gradient(
		45deg,
		rgba(255, 160, 122, 0.7),
		rgba(111, 237, 224, 0.7)
	);
}

.bottom-right {
	bottom: -100px;
	right: -100px;
	background: linear-gradient(
		315deg,
		rgba(255, 160, 122, 0.7),
		rgba(89, 164, 125, 0.7)
	);
}

.batch-process-btn {
	margin-left: 20px;
}
</style>
