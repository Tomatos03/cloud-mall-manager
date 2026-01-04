import { http } from '@/utils/http'

export interface UploadResponse {
    url: string
}

/**
 * 上传图片（multipart/form-data）
 * @param formData FormData 包含 file 字段
 */
export function uploadImage(formData: FormData) {
    return http.post<UploadResponse>('/file/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
