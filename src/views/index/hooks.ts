import { onMounted, onUnmounted } from 'vue';
export const useAddEventListener = <K extends keyof WindowEventMap>(key: K, fun: any) => {
  onMounted(() => {
    window.addEventListener(key, fun);
  });
  onUnmounted(() => {
    window.removeEventListener(key, fun);
  });
};
