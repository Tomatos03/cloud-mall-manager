import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============
// User 列表项类型（完整信息）
export interface UserItem {
    id: string
    username: string
    password: string
    nickname?: string
    phone?: string
    email?: string
    avatar_url?: string
    roles?: RoleInfo[]  // RBAC角色列表
    [key: string]: string | number | undefined
}

// 分页查询返回的用户列表项（最小定义）
export interface UserListItem {
    id: string
    username: string
    roles: RoleInfo[]
}

// 用户个人资料更新类型
export interface UserProfileUpdate {
    nickname?: string
    phone?: string
    email?: string
    avatar_url?: string
}

// 添加/编辑用户的表单数据类型
export interface UserFormData {
    id?: string
    username: string
    password?: string // 编辑时密码可选
    roles: string[] // 角色 ID 列表
}

// RBAC 相关类型定义

// 列表中显示的角色信息（最小定义）
export interface RoleListItem {
    id: string
    name: string
}

// 完整的角色信息（用于角色分配对话框）
export interface RoleInfo {
    id: string
    name: string
    description?: string
    enable: boolean
}

export interface UserRoleAssignment {
    userId: string
    roleIds: string[]
}

export interface UserInfo {
    uid: string
    avatarUrl: string
    username: string
    nickname: string
    phone: string
    email: string
    resourceCodes: string[]
}

// ============ API ============

const PREFIX = '/user'

/**
 * 分页查询 User 列表
 * @param params 分页参数
 */
export function fetchUserPage(params: PageParams) {
    return http.get<PageResult<UserListItem>>(`${PREFIX}/page`, params)
}

/**
 * 根据 ID 获取用户详情
 * @param id 用户 ID
 */
export function getUserById(id: string) {
    return http.get<UserItem>(`${PREFIX}/${id}`)
}

/**
 * 添加用户
 * @param data 用户数据
 */
export function addUser(data: UserFormData) {
    return http.post<UserItem>(`${PREFIX}`, data)
}

/**
 * 更新用户
 * @param data 用户数据（包含 id）
 */
export function updateUser(data: UserFormData) {
    if (!data.id) {
        throw new Error('更新用户时必须提供 id')
    }
    return http.put<UserItem>(`${PREFIX}`, data)
}

/**
 * 删除用户
 * @param id 用户 ID
 */
export function deleteUser(id: string) {
    return http.delete(`${PREFIX}/${id}`)
}

/**
 * 重置用户密码
 * @param id 用户 ID
 * @param password 新密码
 */
export function resetUserPassword(id: string, password: string) {
    return http.put(`${PREFIX}/${id}/password`, { password })
}

/**
 * 更新用户个人资料（nickname, phone, email, avatar_url, bio）
 * @param id 用户 ID
 * @param data 个人资料更新数据
 */
export function updateUserProfile(id: string, data: UserProfileUpdate) {
    return http.put<UserItem>(`${PREFIX}/${id}/profile`, data)
}

/**
 * 获取当前登录用户信息
 */
export function getUserInfo() {
    return http.get<UserInfo>(`${PREFIX}/info`)
}

/**
 * 获取用户关联的角色列表
 * @param userId 用户 ID
 */
export function fetchUserRoles(userId: string) {
    return http.get<RoleInfo[]>(`${PREFIX}/${userId}/roles`)
}

/**
 * 为用户分配角色
 * @param userId 用户 ID
 * @param roleIds 角色 ID 列表
 */
export function assignUserRoles(userId: string, roleIds: string[]) {
    return http.post(`${PREFIX}/${userId}/roles`, { roleIds })
}
