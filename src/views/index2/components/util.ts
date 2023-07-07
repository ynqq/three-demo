import { ref } from 'vue';

export const showModel = ref(false);
export function handleShowModel() {
  showModel.value = true;
}
export function handleHideModel() {
  showModel.value = false;
}
