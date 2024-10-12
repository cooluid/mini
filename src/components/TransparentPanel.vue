<template>
	<teleport to="body">
		<div>
			<transition name=" fade">
				<div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick && close()">
					<div class="transparent-panel" @click.stop :style="panelStyle">
						<div class="overflow-hidden flex-1 w-full">
							<slot></slot>
							<IconItem class="absolute top-2 right-2" icon="#icon-guanbi" @click="close" :size="16" />
						</div>
					</div>
				</div>
			</transition>
		</div>
	</teleport>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { computed } from "vue";
import IconItem from "./com/IconItem.vue";
const props = defineProps<{
	modelValue: boolean;
	closeOnOverlayClick?: boolean;
	width?: string;
	height?: string;
	maxWidth?: string;
	maxHeight?: string;
}>();

const isDark = useDark();
const theme = computed(() => {
	return isDark.value ? "dark" : "light";
});

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void;
	(e: "close"): void;
}>();

const close = () => {
	emit("update:modelValue", false);
	emit("close");
};

const panelStyle = computed(() => ({
	width: props.width || "700px",
	height: props.height || "500px",
	maxWidth: props.maxWidth || "none",
	maxHeight: props.maxHeight || "500px",
}));
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: v-bind('theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"'
		);
}

.transparent-panel {
	display: flex;
	flex-direction: column;
	padding: 10px;
	position: relative;
	overflow: hidden;
	background: v-bind('theme === "dark" ? "rgba(30, 30, 30, 0.6)" : "rgba(255, 255, 255, 0.6)"'
		);
	backdrop-filter: blur(30px);
	border-radius: 16px;
	box-shadow: v-bind('theme === "dark" ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.1)"'
		);
	border: v-bind('theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.2)"'
		);
	max-width: 100%;
	max-height: 100%;
}
</style>
