const defaultTitle = "Admin V3"

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${defaultTitle}`
  }
  return defaultTitle
}
