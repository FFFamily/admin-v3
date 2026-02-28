// Permission helpers for menu/page visibility and route guarding.
//
// Convention:
// - Menu/page permission codes are stored in ad_permission.code as: `menu:${fullPath}`
// - Button/API permission codes keep their own format, e.g. `user:create`

export function joinRoutePath(basePath, routePath) {
  if (!routePath) return basePath || "/"
  if (routePath.startsWith("/")) return routePath
  const base = (basePath || "").endsWith("/") ? (basePath || "").slice(0, -1) : basePath || ""
  return `${base}/${routePath}`.replace(/\/+/g, "/")
}

export function menuPermCodeByPath(path) {
  return `menu:${path}`
}

export function hasCode(perms, code) {
  if (!code) return false
  if (!Array.isArray(perms) || !perms.length) return false
  return perms.includes(code)
}

export function hasMenuPerm(perms, path) {
  if (!path) return false
  const p = String(path)
  const withSlash = p.startsWith("/") ? p : `/${p}`
  const withoutSlash = withSlash.replace(/^\//, "")
  // Support both `menu:/xxx` and legacy `menu:xxx` styles.
  return (
    hasCode(perms, menuPermCodeByPath(withSlash)) ||
    hasCode(perms, menuPermCodeByPath(withoutSlash))
  )
}

export function hasAnyMenuPermCode(perms) {
  if (!Array.isArray(perms) || !perms.length) return false
  return perms.some(p => typeof p === "string" && p.startsWith("menu:"))
}

function collectMenuPaths(routes, basePath = "", out = []) {
  if (!Array.isArray(routes)) return out
  for (const r of routes) {
    if (!r || isHidden(r)) continue
    const fullPath = joinRoutePath(basePath, r.path)
    if (hasTitle(r)) out.push(fullPath)
    collectMenuPaths(r.children || [], fullPath, out)
  }
  return out
}

// Whether perms contain at least one `menu:*` code that matches known frontend routes.
// This protects against "menu codes exist but don't match any route", which would otherwise cause redirect loops.
export function hasAnyMenuPermForRoutes(routes, perms) {
  const paths = collectMenuPaths(routes, "")
  return paths.some(p => hasMenuPerm(perms, p))
}

function fallbackHomeOnlyRoutes(routes) {
  // Keep the root route (Layout + dashboard child). Sidebar will render only "首页".
  return (routes || []).filter(r => r && r.path === "/")
}

function isHidden(route) {
  return !!route?.hidden
}

function hasTitle(route) {
  return !!route?.meta?.title
}

// Returns a cloned route tree suitable for Sidebar rendering.
// - Hides any menu node without permission AND without any permitted children.
// - Hidden routes are removed from the Sidebar tree.
export function filterRoutesForSidebar(routes, perms, permsLoaded, basePath = "", parentVisible = false) {
  if (!Array.isArray(routes)) return []
  // If perms aren't loaded (or backend doesn't support it), keep showing all menus.
  if (!permsLoaded) return routes

  // If backend doesn't send any menu:* codes (or they don't match current frontend routes),
  // fallback to showing only "首页" to avoid empty sidebar / redirect loops.
  if (
    basePath === "" &&
    (!hasAnyMenuPermCode(perms) || !hasAnyMenuPermForRoutes(routes, perms))
  ) {
    return fallbackHomeOnlyRoutes(routes)
  }

  const out = []

  for (const r of routes) {
    if (!r) continue
    if (isHidden(r)) continue

    const fullPath = joinRoutePath(basePath, r.path)
    const children = filterRoutesForSidebar(r.children || [], perms, permsLoaded, fullPath, false)

    const selfIsMenu = hasTitle(r)
    const selfAllowed = selfIsMenu ? hasMenuPerm(perms, fullPath) : false

    // Keep containers if they still have visible children.
    const keep = selfIsMenu ? selfAllowed || children.length > 0 : children.length > 0
    if (!keep) continue

    out.push({ ...r, children })
  }

  return out
}

export function findFirstMenuPath(routes, basePath = "") {
  if (!Array.isArray(routes)) return ""
  for (const r of routes) {
    if (!r || isHidden(r)) continue
    const fullPath = joinRoutePath(basePath, r.path)
    if (hasTitle(r)) return fullPath
    const hit = findFirstMenuPath(r.children || [], fullPath)
    if (hit) return hit
  }
  return ""
}

// Route access check:
// - If perms aren't loaded, allow.
// - Otherwise require menu permission for `to.path`, or for `to.meta.activeMenu` (hidden/detail pages).
export function isRouteAllowedByMenu(to, perms, permsLoaded, routes) {
  // Allow root; router will redirect to a concrete page.
  if (to?.path === "/") return true

  if (!permsLoaded) return true

  // If backend doesn't send any menu:* codes (or they don't match current frontend routes),
  // only allow visiting dashboard.
  if (!hasAnyMenuPermCode(perms) || (routes && !hasAnyMenuPermForRoutes(routes, perms))) {
    return to?.path === "/dashboard"
  }

  const p = to?.path
  const activeMenu = to?.meta?.activeMenu
  if (activeMenu && hasMenuPerm(perms, activeMenu)) return true
  if (p && hasMenuPerm(perms, p)) return true
  // Allow pure redirect/container routes (e.g. /admin) if any matched record has redirect.
  if (Array.isArray(to?.matched) && to.matched.some(r => !!r?.redirect)) return true
  return false
}
