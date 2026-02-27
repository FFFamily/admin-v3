import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { setupPermission } from './permission'
import DictPlugin from './utils/dict'
import SvgIcon from './components/SvgIcon/index.vue'
import { setupPermissionDirective } from './directives/permission'

import './icons'
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(DictPlugin)
app.component('svg-icon', SvgIcon)

setupPermissionDirective(app)

// Element Plus message/confirm helpers for Options API usage
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$msgbox = ElMessageBox
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$prompt = ElMessageBox.prompt
// Element UI legacy compatibility: this.$loading({...}).close()
app.config.globalProperties.$loading = ElLoading.service

setupPermission(router)

app.mount('#app')
