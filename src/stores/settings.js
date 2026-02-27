import { defineStore } from "pinia"

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    showSettings: false,
    fixedHeader: false,
    sidebarLogo: false
  }),
  actions: {
    changeSetting({ key, value }) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value
      }
    }
  }
})
