import request from "@/api/request"

export function getAnnouncementPage(params) {
  return request({
    url: "/admin/announcement/page",
    method: "get",
    params
  })
}

export function getAnnouncementDetail(id) {
  return request({
    url: `/admin/announcement/${id}`,
    method: "get"
  })
}

export function createAnnouncement(data) {
  return request({
    url: "/admin/announcement/create",
    method: "post",
    data
  })
}

export function updateAnnouncement(id, data) {
  return request({
    url: `/admin/announcement/update/${id}`,
    method: "put",
    data
  })
}

export function updateAnnouncementStatus(id, status) {
  return request({
    url: `/admin/announcement/status/${id}`,
    method: "put",
    params: { status }
  })
}

export function deleteAnnouncement(id) {
  return request({
    url: `/admin/announcement/delete/${id}`,
    method: "delete"
  })
}

export function getHomeAnnouncements(params) {
  return request({
    url: "/admin/announcement/home",
    method: "get",
    params
  })
}
