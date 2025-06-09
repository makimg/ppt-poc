import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePdfInfoStore = defineStore("usePdfInfoStore", () => {
  const pdfInfos = ref({});
  return { pdfInfos };
});
