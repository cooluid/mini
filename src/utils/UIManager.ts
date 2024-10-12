import { ref } from 'vue';

export class UIManager {
  private modals = ref<Set<string>>(new Set());
  private notifications = ref<Set<string>>(new Set());

  showModal(modalName: string) {
    this.modals.value.add(modalName);
  }

  hideModal(modalName: string) {
    this.modals.value.delete(modalName);
  }

  showNotification(notificationId: string) {
    this.notifications.value.add(notificationId);
    setTimeout(() => this.hideNotification(notificationId), 3000); // 自动隐藏
  }

  hideNotification(notificationId: string) {
    this.notifications.value.delete(notificationId);
  }

  // 可以添加更多方法来管理其他类型的UI元素
}

export const uiManager = new UIManager();