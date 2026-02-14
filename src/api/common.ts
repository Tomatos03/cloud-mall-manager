import { http } from '@/utils/http'

// ============ 图片相关 ============

/**
 * 本地图片项类型
 */
export interface Image {
    uid?: number
    name?: string
    url: string
}

/**
 * 上传图片（multipart/form-data）
 * @param formData FormData 包含 file 字段
 */
export function uploadImage(formData: FormData) {
    return http.post<Image>('/file/upload/image', formData, {
        headers: {
            'Content-Type': 'image/*',
        },
    })
}

// ============ 分页通用对象 ============

export interface PageParams {
    page: number
    pageSize: number
    [key: string]: unknown
}

export interface PageResult<T> {
    records: T[]
    total: number
    page: number
    pageSize: number
}
