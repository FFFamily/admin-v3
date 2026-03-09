<template>
  <div class="login-page">
    <div class="login-shell" aria-label="Login">
      <div class="form-card">
        <header class="form-head">
          <div class="brand-top" aria-label="Brand">
            <div class="brand-mark" aria-hidden="true">
              <span class="brand-mark__inner">FN</span>
            </div>
            <div class="brand-text">
              <div class="brand-name">伏宁再生资源</div>
              <div class="brand-subtitle">后台管理平台</div>
            </div>
          </div>
        </header>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          autocomplete="on"
          label-position="top"
          hide-required-asterisk
          @submit.prevent
        >
          <el-form-item v-if="step === 'credential'" label="邮箱" prop="username">
            <el-input
              ref="usernameRef"
              v-model="loginForm.username"
              placeholder="name@company.com"
              type="text"
              inputmode="email"
              autocomplete="email"
              clearable
              size="large"
            >
              <template #prefix>
                <el-icon class="field-icon"><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item v-if="step === 'credential'" label="密码" prop="password">
            <el-input
              ref="passwordRef"
              :key="passwordType"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入密码"
              autocomplete="current-password"
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="field-icon"><Lock /></el-icon>
              </template>
              <template #suffix>
                <button
                  class="pwd-toggle"
                  type="button"
                  :aria-label="passwordType === 'password' ? '显示密码' : '隐藏密码'"
                  @click="showPwd"
                >
                  <el-icon class="pwd-icon">
                    <component :is="passwordType === 'password' ? View : Hide" />
                  </el-icon>
                </button>
              </template>
            </el-input>
          </el-form-item>

          <div v-if="step === 'credential'" class="form-row" aria-label="Form options">
            <el-checkbox v-model="loginForm.remember" size="default">记住我</el-checkbox>
            <a class="forgot-link" href="#" @click.prevent="handleForgot">忘记密码？</a>
          </div>

          <el-form-item v-if="step === 'tenant'" label="选择租户">
            <el-select
              v-model="selectedTenantId"
              placeholder="请选择你要进入的租户"
              size="large"
              class="tenant-select"
              filterable
            >
              <el-option
                v-for="t in tenantOptions"
                :key="t.tenantId"
                :label="`${t.tenantName}（${t.tenantCode}）`"
                :value="t.tenantId"
              />
            </el-select>
            <div class="tenant-hint">提示：租户未开通服务或已到期将无法登录。</div>
          </el-form-item>

          <el-button
            class="login-btn"
            :loading="loading"
            type="default"
            size="large"
            @click.prevent="handleLogin"
          >
            {{ step === 'credential' ? '下一步' : '进入系统' }}
          </el-button>

          <el-button
            v-if="step === 'tenant'"
            class="back-btn"
            text
            :disabled="loading"
            @click.prevent="handleBack"
          >
            返回重新输入账号
          </el-button>
        </el-form>

        <div class="register-hint">
          <span>没有账号？</span>
          <a href="#" @click.prevent="handleRegister">联系管理员开通</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { ElMessage } from "element-plus"
import { Hide, Lock, Message, View } from "@element-plus/icons-vue"

const loginFormRef = ref(null)
const usernameRef = ref(null)
const passwordRef = ref(null)

const loginForm = reactive({
  // Keep dev convenience while avoiding prefilled prod credentials.
  username: import.meta.env.DEV ? "admin" : "",
  password: import.meta.env.DEV ? "123456" : "",
  remember: true
})

const validateUsername = (rule, value, callback) => {
  if (!value || !value.trim()) {
    callback(new Error("请输入邮箱"))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入密码"))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, trigger: "blur", validator: validateUsername }],
  password: [{ required: true, trigger: "blur", validator: validatePassword }]
}

const loading = ref(false)
const passwordType = ref("password")
const redirect = ref(undefined)
const step = ref("credential")
const selectedTenantId = ref("")

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tenantOptions = ref([])

watch(
  () => route.query.redirect,
  value => {
    redirect.value = value
  },
  { immediate: true }
)

const showPwd = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password"
  nextTick(() => {
    if (passwordRef.value?.focus) {
      passwordRef.value.focus()
    }
  })
}

onMounted(() => {
  nextTick(() => {
    if (usernameRef.value?.focus) {
      usernameRef.value.focus()
    }
  })
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    if (step.value === "credential") {
      const valid = await loginFormRef.value.validate()
      if (!valid) return

      loading.value = true
      const data = await userStore.preLogin(loginForm)
      tenantOptions.value = data?.tenants || []
      if (!tenantOptions.value.length) {
        // fallback to explicit fetch (in case backend didn't embed tenants)
        const list = await userStore.fetchTenants()
        tenantOptions.value = list || []
      }
      if (!tenantOptions.value.length) {
        ElMessage.error("该账号未加入任何可用租户")
        return
      }

      // default select: last tenant
      const last = localStorage.getItem("last_tenant_id")
      if (last && tenantOptions.value.some(t => t.tenantId === last)) {
        selectedTenantId.value = last
      } else if (tenantOptions.value.length === 1) {
        selectedTenantId.value = tenantOptions.value[0].tenantId
      }

      step.value = "tenant"
      nextTick(() => {
        // focus select by triggering click
      })
      return
    }

    if (!selectedTenantId.value) {
      ElMessage.warning("请选择租户")
      return
    }

    loading.value = true
    await userStore.selectTenant(selectedTenantId.value)
    // Eagerly verify the formal token works (and that backend has bound tenantId into token session),
    // otherwise the router guard will bounce back to /login and users won't know why.
    try {
      await userStore.getInfo()
    } catch (e) {
      userStore.resetToken()
      step.value = "credential"
      tenantOptions.value = []
      selectedTenantId.value = ""
      ElMessage.error("进入系统失败，请重新登录并选择租户")
      return
    }
    router.push({ path: redirect.value || "/" })
  } catch (error) {
    // ignore
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  step.value = "credential"
  tenantOptions.value = []
  selectedTenantId.value = ""
  userStore.resetToken()
  nextTick(() => {
    if (usernameRef.value?.focus) usernameRef.value.focus()
  })
}

const handleForgot = () => {
  ElMessage.info("请联系管理员重置密码")
}

const handleRegister = () => {
  ElMessage.info("请联系管理员开通账号")
}
</script>

<style lang="scss" scoped>
.login-page {
  // Ensure the page looks consistent even if Element Plus theme variables change.
  --sea: #1a2744;
  --login-border: rgba(226, 232, 240, 0.9);
  --login-text: #0f172a;
  --login-muted: #64748b;
  --radius: 12px;

  min-height: 100%;
  width: 100%;
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  display: flex;
  align-items: center;
}

.login-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.brand-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.brand-mark {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.06);
}

.brand-mark__inner {
  font-weight: 900;
  letter-spacing: 0.7px;
  color: var(--sea);
}

.brand-text {
  text-align: center;
}

.brand-name {
  font-weight: 800;
  font-size: 18px;
  color: var(--login-text);
  line-height: 1.1;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--login-muted);
  text-align: center;
}

.form-card {
  width: 100%;
  max-width: 420px;
  border-radius: var(--radius);
  border: 1px solid var(--login-border);
  background: #ffffff;
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.08),
    0 2px 10px rgba(15, 23, 42, 0.06);
  padding: 28px 26px 22px;
}

.form-head {
  margin-bottom: 14px;
  text-align: center;
}

.form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--login-text);
  letter-spacing: -0.2px;
}

.form-subtitle {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--login-muted);
  line-height: 1.6;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 14px;
}

.forgot-link {
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  margin-top: 6px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #f8fafc;
  color: var(--sea);
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.06);
}

.register-hint {
  margin-top: 14px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
}

.register-hint a {
  margin-left: 6px;
  color: #2563eb;
  text-decoration: none;
}

.register-hint a:hover {
  text-decoration: underline;
}

.field-icon {
  color: #64748b;
}

.pwd-toggle {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0 4px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
}

.pwd-toggle:focus-visible {
  outline: 2px solid rgba(26, 39, 68, 0.20);
  outline-offset: 2px;
}

.pwd-icon {
  color: #64748b;
}

// Element Plus refinements for an "enterprise" feel
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    line-height: 1.2;
    font-size: 12px;
    color: #334155;
    font-weight: 700;
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.95) inset;
    transition: none;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow:
      0 0 0 1px rgba(26, 39, 68, 0.18) inset,
      0 0 0 4px rgba(26, 39, 68, 0.10);
  }

  :deep(.el-input__inner) {
    color: var(--login-text);

    &::placeholder {
      color: #94a3b8;
    }
  }

  :deep(.el-form-item.is-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.55) inset;
  }

  :deep(.el-form-item__error) {
    padding-top: 6px;
  }
}

@media (max-width: 960px) {
  .login-shell {
    padding: 20px 16px;
    justify-content: center;
  }

  .form-card {
    max-width: 520px;
    padding: 26px 22px 20px;
  }
}

.tenant-select {
  width: 100%;
}

.tenant-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--login-muted);
}

.back-btn {
  margin-top: 10px;
}
</style>
