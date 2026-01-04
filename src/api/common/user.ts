import http from "@/utils/http"

interface UserInfo {
  uid: string
  avatarUrl: string
  username: string
  nickname: string
  role: string
  phone: string
  email: string
  storeId: string
  storeName: string
}

export function getUserInfo() {
  return http.get<UserInfo>('/user/info')
}
