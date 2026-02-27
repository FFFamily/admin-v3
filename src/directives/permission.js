import { useUserStore } from "@/stores/user"

function normalizeRequired(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return [value].filter(Boolean)
}

function hasAnyPermission(userPerms, required) {
  const req = normalizeRequired(required)
  if (!req.length) return true
  if (!Array.isArray(userPerms) || !userPerms.length) return false
  const set = new Set(userPerms)
  return req.some(p => set.has(p))
}

function apply(el, binding) {
  const userStore = useUserStore()
  const required = binding.value

  // If perms aren't loaded (or backend doesn't support it yet), don't hide UI.
  if (!userStore.permsLoaded) return
  if (hasAnyPermission(userStore.perms, required)) return

  if (el?.parentNode) {
    el.parentNode.removeChild(el)
  }
}

export function setupPermissionDirective(app) {
  app.directive("permission", {
    mounted(el, binding) {
      apply(el, binding)
    },
    updated(el, binding) {
      apply(el, binding)
    }
  })
}

