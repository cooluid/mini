<template>
	<TransparentPanel v-model="dialogVisible" :closeOnOverlayClick="true">
		<div class="flex flex-col h-full">
			<h2 class="text-2xl pl-4 font-bold mb-4 text-black dark:text-white">
				设置
			</h2>

			<div class="flex flex-1 overflow-hidden">
				<div class="w-1/4 p-4">
					<BaseTab
						:tabs="tabs"
						:vertical="true"
						v-model="activeTab"
						size="medium"
						class="settings-tab"
					/>
				</div>

				<div class="w-3/4 overflow-hidden rounded-lg">
					<div
						class="bg-[rgb(31,41,55,0.05)] dark:bg-[rgb(152,152,152,0.05)] h-full overflow-y-auto p-6"
					>
						<component :is="activeComponent" v-model="form" />
					</div>
				</div>
			</div>

			<div class="flex justify-end p-4 mt-4">
				<BaseButton
					variant="secondary"
					@click="dialogVisible = false"
					class="mr-4"
					size="medium"
					>取消
				</BaseButton>
				<BaseButton variant="primary" size="medium" @click="saveSettings"
					>确定</BaseButton
				>
			</div>
		</div>
	</TransparentPanel>
</template>

<script setup lang="ts">
import { UserSettings } from "../../../electron/types";
import { ElMessage } from "element-plus";
import { computed, ref, watch } from "vue";
import AboutSettings from "./AboutSettings.vue";
const props = defineProps<{
	settings: UserSettings;
}>();

const form = ref<UserSettings>(
	props.settings ? { ...props.settings } : ({} as UserSettings)
);

const emit = defineEmits<{
	(e: "update-settings", settings: UserSettings): void;
}>();

const dialogVisible = ref(false);
const activeTab = ref("basic");

const tabs = [{ name: "about", label: "关于", component: AboutSettings }];

const activeComponent = computed(() => {
	return tabs.find((tab) => tab.name === activeTab.value)?.component;
});

watch(
	() => props.settings,
	(newSettings) => {
		Object.assign(form.value, newSettings);
	},
	{ deep: true }
);

const showDialog = () => {
	dialogVisible.value = true;
};

const saveSettings = () => {
	emit("update-settings", form.value);
	ElMessage.success("设置已保存");
	dialogVisible.value = false;
};

defineExpose({ showDialog });
</script>

<style scoped>
.scroll-view {
	background-color: rgba(152, 152, 152, 0.05);
	border-radius: 12px;
}
</style>
