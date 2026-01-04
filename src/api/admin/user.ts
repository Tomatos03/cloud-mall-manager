import { http } from '@/utils/http'

const PREFIX = '/admin'

// 用户角色类型
export type UserRole = 'ADMIN' | 'NORMAL' | 'MERCHANT'

// User 列表项类型
export interface UserItem {
    id: string
    username: string
    password: string
    nickname?: string
    phone?: string
    email?: string
    avatar_url?: string
    role: UserRole
    [key: string]: string | number | undefined
}

// 用户个人资料更新类型
export interface UserProfileUpdate {
    nickname?: string
    phone?: string
    email?: string
    avatar_url?: string
}

// 分页查询参数
export interface UserPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

// 分页响应结构
export interface UserPageResult {
    records: UserItem[]
    total: number
    page: number
    pageSize: number
}

// 添加/编辑用户的表单数据类型
export interface UserFormData {
    id?: string
    username: string
    password?: string  // 编辑时密码可选
    role: UserRole
}

/**
 * 分页查询 User 列表
 * @param params 分页参数
 */
export function fetchUserPage(params: UserPageParams) {
    return http.get<UserPageResult>(`${PREFIX}/user/page`, params)
}

/**
 * 根据 ID 获取用户详情
 * @param id 用户 ID
 */
export function getUserById(id: string) {
    return http.get<UserItem>(`${PREFIX}/user/${id}`)
}

/**
 * 添加用户
 * @param data 用户数据
 */
export function addUser(data: UserFormData) {
    return http.post<UserItem>(`${PREFIX}/user`, data)
}

/**
 * 更新用户
 * @param data 用户数据（包含 id）
 */
export function updateUser(data: UserFormData) {
    if (!data.id) {
        throw new Error('更新用户时必须提供 id')
    }
    return http.put<UserItem>(`${PREFIX}/user`, data)
}

/**
 * 删除用户
 * @param id 用户 ID
 */
export function deleteUser(id: string) {
    return http.delete(`${PREFIX}/user/${id}`)
}

/**
 * 重置用户密码
 * @param id 用户 ID
 * @param password 新密码
 */
export function resetUserPassword(id: string, password: string) {
    return http.put(`${PREFIX}/user/${id}/password`, { password })
}

/**
 * 更新用户个人资料（nickname, phone, email, avatar_url, bio）
 * @param id 用户 ID
 * @param data 个人资料更新数据
 */
export function updateUserProfile(id: string, data: UserProfileUpdate) {
    return http.put<UserItem>(`${PREFIX}/user/${id}/profile`, data)
}