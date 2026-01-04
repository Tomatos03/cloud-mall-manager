import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { http } from '@/utils/http'

/**
 * 用户响应DTO - 只包含通用字段
 */
export interface ResponseDTO {
    token: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
    username: string
    password: string
}

/**
 * 登录：返回用户响应DTO
 */
export function login(params: LoginParams) {
    return http.post<ResponseDTO>('/auth/login', params)
}

/**
 * 注销（仅清理本地数据）
 */
export function logout() {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    userStore.clearUser()
    permissionStore.clear()
    localStorage.removeItem('token')
    return Promise.resolve()
}
