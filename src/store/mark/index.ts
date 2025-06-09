import { eventBus } from "@/utils/eventBus";
import { defineStore } from "pinia";

export const useMarkStore = defineStore("mark", {
  state: () => ({
    currentMark: null,
  }),
  actions: {
    setCurrentMark(mark: any) {
      this.currentMark = mark;
      eventBus.emit("mark:click", mark);
    },
    getCurrentMark() {
      return this.currentMark;
    },
  },
});
