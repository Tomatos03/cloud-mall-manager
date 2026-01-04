/**
 * 图片处理工具函数
 */

// 获取图片服务器基础URL
const getImageBaseURL = (): string => {
    // 如果是生产环境，使用生产环境的域名
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_IMAGE_BASE_URL || window.location.origin
    }
    // 开发环境使用 API 基础路径的域名部分
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'
    // 从 API URL 中提取域名（去掉 /manager 等路径）
    const url = new URL(apiBaseURL)
    return `${url.protocol}//${url.host}`
}

/**
 * 将相对路径转换为完整的图片URL
 * @param relativePath 相对路径，例如：/uploads/image/abc.jpg
 * @returns 完整的图片URL
 */
export const getImageURL = (relativePath: string | undefined | null): string => {
    if (!relativePath) return ''

    // 如果已经是完整URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath
    }

    // 拼接完整URL
    const baseURL = getImageBaseURL()
    // 确保路径以 / 开头
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
    return `${baseURL}${path}`
}

/**
 * 批量处理图片URL
 * @param paths 图片路径数组或逗号分隔的字符串
 * @returns 完整URL数组
 */
export const getImageURLs = (paths: string[] | string | undefined | null): string[] => {
    if (!paths) return []

    const pathArray = Array.isArray(paths) ? paths : paths.split(',').filter(Boolean)
    return pathArray.map((path) => getImageURL(path.trim()))
}
