import { http } from '@/utils/http'

const PREFIX = '/admin'

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

// 分页查询参数
export interface AddressPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

// 分页响应结构
export interface AddressPageResult {
    records: AddressItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 分页查询 Address 列表
 * @param params 分页参数
 */
export function fetchAddressPage(params: AddressPageParams) {
    return http.get<AddressPageResult>(`${PREFIX}/address/page`, params)
}

/**
 * 获取单个地址详情
 * @param id 地址ID
 */
export function fetchAddressDetail(id: string) {
    return http.get<AddressItem>(`${PREFIX}/address/${id}`)
}

/**
 * 删除地址
 * @param id 地址ID
 */
export function deleteAddress(id: string) {
    return http.delete(`${PREFIX}/address/${id}`)
}

/**
 * 新增地址
 * @param data 地址数据
 */
export function addAddress(data: Partial<AddressItem>) {
    return http.post(`${PREFIX}/address`, data)
}

/**
 * 更新地址
 * @param data 地址数据
 */
export function updateAddress(id: string, data: Partial<AddressItem>) {
    return http.put(`${PREFIX}/address/${id}`, data)
}

export function setDefaultAddress(id: string) {
    return http.put(`${PREFIX}/address/${id}/default`)
}