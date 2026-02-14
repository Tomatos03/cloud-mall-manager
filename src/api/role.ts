import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============

/**
 * 角色基本信息
 */
export interface Role {
    id: string
    name: string
    description?: string
    enable: boolean
}

/**
 * 角色表单数据
 */
export interface RoleFormData {
    name: string
    description?: string
    enabled: boolean
}

/**
 * 角色权限分配参数
 */
export interface RoleMenuAssignment {
    roleId: string
    menuIds: string[]
}

// ============ API ============

const PREFIX = '/system/role'

/**
 * 分页查询角色列表
 * @param params 分页参数（包含 roleName 搜索参数）
 */
export function fetchRoleList(params: PageParams) {
    return http.get<PageResult<Role>>(`${PREFIX}/page`, params)
}

/**
 * 添加角色
 * @param data 角色表单数据
 */
export function addRole(data: RoleFormData) {
    return http.post<Role>(`${PREFIX}`, data)
}

/**
 * 更新角色
 * @param id 角色ID
 * @param data 角色表单数据
 */
export function updateRole(id: string, data: RoleFormData) {
    return http.put<Role>(`${PREFIX}/${id}`, data)
}

/**
 * 删除角色
 * @param id 角色ID
 */
export function deleteRoleById(id: string) {
    return http.delete(`${PREFIX}/${id}`)
}

/**
 * 获取角色拥有的菜单权限ID列表
 * @param roleId 角色ID
 */
export function fetchRoleMenuIds(roleId: string) {
    return http.get<string[]>(`${PREFIX}/${roleId}/menus`)
}

/**
 * 为角色分配菜单权限
 * @param roleId 角色ID
 * @param menuIds 菜单权限ID数组
 */
export function assignRoleMenus(roleId: string, menuIds: string[]) {
    return http.post(`${PREFIX}/${roleId}/assign-menus`, menuIds)
}
