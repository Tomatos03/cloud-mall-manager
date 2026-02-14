import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============

// Address 列表项类型
export interface AddressItem {
    id: string
    userId: string
    receiver: string
    phone: string
    regionCode: string
    detail: string
    isDefault: boolean
    [key: string]: string | number | boolean | undefined
}

// 分页查询参数直接使用 PageParams

// ============ API ============

const PREFIX = '/address'

/**
 * 分页查询 Address 列表
 * @param params 分页参数
 */
export function fetchAddressPage(params: PageParams) {
    return http.get<PageResult<AddressItem>>(`${PREFIX}/page`, params)
}

/**
 * 获取单个地址详情
 * @param id 地址ID
 */
export function fetchAddressDetail(id: string) {
    return http.get<AddressItem>(`${PREFIX}/${id}`)
}

/**
 * 删除地址
 * @param id 地址ID
 */
export function deleteAddress(id: string) {
    return http.delete(`${PREFIX}/${id}`)
}

/**
 * 新增地址
 * @param data 地址数据
 */
export function addAddress(data: Partial<AddressItem>) {
    return http.post(`${PREFIX}`, data)
}

/**
 * 更新地址
 * @param id 地址 ID
 * @param data 地址数据
 */
export function updateAddress(id: string, data: Partial<AddressItem>) {
    return http.put(`${PREFIX}/${id}`, data)
}

/**
 * 设置默认地址
 * @param id 地址ID
 */
export function setDefaultAddress(id: string) {
    return http.put(`${PREFIX}/${id}/default`)
}
