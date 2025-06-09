import { defineStore } from "pinia";
import { ref } from "vue";

export const addMarkStores = defineStore("addMarkStores", () => {
  const markList = ref([]);
  const markLoading = ref(false);
  const markPage = ref(0);
  const markInfo = ref({});
  const dialogFormVisible = ref(false);
  return { markList, markLoading, markPage, markInfo, dialogFormVisible };
});
