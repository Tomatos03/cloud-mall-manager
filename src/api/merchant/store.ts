import { http } from '@/utils/http'

const PREFIX = '/merchant'

/**
 * 店铺信息接口定义
 * 对应后端 StoreItemVO
 */
export interface StoreInfo {
    id: string          // 店铺唯一标识 ID
    name: string        // 店铺名称
    info: string        // 店铺简介/描述
    avatarUrl: string   // 店铺头像 URL
    banner?: string     // 店铺顶部横幜背景图 URL（可选）
}

/**
 * 更新店铺信息的请求载体
 */
export interface UpdateStorePayload {
    name?: string
    info?: string
    avatarUrl?: string
    banner?: string
}

/**
 * 获取当前登录商家的店铺信息
 * RESTful: GET /stores/me
 */
export function getMyStoreInfo() {
    return http.get<StoreInfo>(`${PREFIX}/store/me`)
}

/**
 * 根据店铺 ID 获取详情
 * RESTful: GET /stores/:id
 * @param id 店铺ID
 */
export function getStoreById(id: string) {
    return http.get<StoreInfo>(`${PREFIX}/store/${id}`)
}

/**
 * 更新店铺信息
 * RESTful: PATCH /stores/:id (部分更新)
 * @param id 店铺ID
 * @param data 更新的数据
 */
export function updateStore(id: string, data: UpdateStorePayload) {
    return http.patch<StoreInfo>(`${PREFIX}/store/${id}`, data)
}