import { http } from '@/utils/http'

export interface MenuItem {
  name: string
  path: string
  type: 'layout' | 'view'
  component: string
  redirect?: string
  children?: MenuItem[]
  meta: {
    title: string
    icon?: string
  }
}

export function fetchMenus(role: string) {
    return http.get<MenuItem[]>(`/menu/${role}`)
}
