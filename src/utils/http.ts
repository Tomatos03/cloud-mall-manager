import { useUserStore } from '@/stores/user'
import axios from 'axios'
import type {
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from 'axios'
import { ElMessage } from 'element-plus'

// 响应数据接口
export interface ResponseData<T = unknown> {
    code: number
    message: string
    data: T
}

// 业务成功码
const BIZ_SUCCESS_CODES = [200, 0]

/**
 * 图片处理逻辑：将相对路径转换为完整的图片URL
 */
const getImageBaseURL = (): string => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_IMAGE_BASE_URL || window.location.origin
    }
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'
    const urlStr = apiBaseURL.startsWith('http')
        ? apiBaseURL
        : `${window.location.origin}${apiBaseURL}`
    const url = new URL(urlStr)
    return `${url.protocol}//${url.host}`
}

/**
 * 格式化单个图片URL
 */
const formatImageUrl = (url: string): string => {
    if (typeof url !== 'string' || !url) return url
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url
    }
    const baseURL = getImageBaseURL()
    const path = url.startsWith('/') ? url : `/${url}`
    return `${baseURL}${path}`
}

// 图片相关的字段名称
const IMAGE_KEYS = ['url', 'img', 'avatarUrl', 'banner', 'goodsImg', 'imageUrl']

/**
 * 递归处理响应对象中的图片字段，将相对路径转为绝对路径
 */
const processImageUrls = (data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data

    if (Array.isArray(data)) {
        data.forEach((item) => processImageUrls(item))
        return data
    }

    const obj = data as Record<string, unknown>

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            if (IMAGE_KEYS.includes(key) && typeof value === 'string' && value) {
                if (key === 'imgList' || key === 'detailImages') {
                    obj[key] = value
                        .split(',')
                        .filter(Boolean)
                        .map((img: string) => formatImageUrl(img.trim()))
                        .join(',')
                } else {
                    obj[key] = formatImageUrl(value)
                }
            } else if (typeof value === 'object' && value !== null) {
                processImageUrls(value)
            }
        }
    }
    return data
}

/**
 * 处理 401 未授权错误
 */
const handleUnauthorized = () => {
    const userStore = useUserStore()
    userStore.clearUser()
    window.location.href = '/login'
}

/**
 * 根据 HTTP 状态码获取错误消息
 */
const getHttpErrorMessage = (status: number, errorData?: ResponseData): string => {
    switch (status) {
        case 400:
            return '请求参数错误'
        case 401:
            handleUnauthorized()
            return '未授权，请重新登录'
        case 403:
            return '拒绝访问'
        case 404:
            return '请求资源不存在'
        case 500:
            return '服务器内部错误'
        case 502:
            return '网关错误'
        case 503:
            return '服务不可用'
        case 504:
            return '网关超时'
        default:
            return errorData?.message || `请求失败(${status})`
    }
}

/**
 * 处理响应错误
 */
const handleResponseError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            return getHttpErrorMessage(error.response.status, error.response.data)
        } else if (error.request) {
            return '网络连接失败，请检查网络'
        }
    }
    return '请求失败'
}

/**
 * 为请求添加 Authorization 头
 */
const fillAuthorizationBearer = (
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

/**
 * 检查业务响应是否成功
 */
const assertBizSuccess = (res: ResponseData): void => {
    if (!BIZ_SUCCESS_CODES.includes(res.code)) {
        ElMessage.error(res.message || '请求失败')
        if (res.code === 401) {
            handleUnauthorized()
        }
        throw new Error(res.message || '请求失败')
    }
}

/**
 * 处理响应数据中的图片URL
 */
const processResponseImageUrls = (res: ResponseData): void => {
    if (res.data) {
        processImageUrls(res.data)
    }
}

/**
 * 创建 axios 实例
 */
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
    })

    // 请求拦截器
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            return fillAuthorizationBearer(config)
        },
        (error) => {
            console.error('请求错误：', error)
            return Promise.reject(error)
        },
    )

    // 响应拦截器
    instance.interceptors.response.use(
        (response: AxiosResponse<ResponseData>) => {
            const res = response.data
            assertBizSuccess(res)
            // 注意：由于后端使用 MinIO，图片 URL 已是完整路径，不需要处理
            // processResponseImageUrls(res)
            return response
        },
        (error) => {
            console.error('响应错误：', error)
            const message = handleResponseError(error)
            ElMessage.error(message)
            return Promise.reject(error)
        },
    )

    return instance
}

// 创建 axios 实例
const service = createAxiosInstance()

// HTTP 工具类
class Http {
    /**
     * GET 请求
     */
    get<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.get<ResponseData<T>>(url, { params, ...config }).then((res) => res.data)
    }

    /**
     * POST 请求
     */
    post<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.post<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * PUT 请求
     */
    put<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.put<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * PATCH 请求
     */
    patch<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.patch<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * DELETE 请求
     */
    delete<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.delete<ResponseData<T>>(url, { params, ...config }).then((res) => res.data)
    }
}

// 导出 HTTP 实例
export const http = new Http()

// 默认导出
export default http
