import * as adminApi from './admin'
import * as merchantApi from './merchant'

export type AdminApi = typeof adminApi
export type MerchantApi = typeof merchantApi
export type ApiClient = AdminApi | MerchantApi

type Role = 'ADMIN' | 'MERCHANT'

const apiClients: Record<Role, ApiClient> = {
  ADMIN: adminApi as AdminApi,
  MERCHANT: merchantApi as MerchantApi,
}

let currentApiClient: ApiClient | null = null
let currentRole: Role | null = null

/**
 * 初始化 API Client（登录成功后调用）
 */
export function initApiClient(role: string): ApiClient {
  if (role !== 'ADMIN' && role !== 'MERCHANT') {
    throw new Error(`不支持的用户角色: ${role}`)
  }

  currentRole = role as Role
  currentApiClient = apiClients[currentRole]
  return currentApiClient
}

/**
 * 重置 API Client（退出登录时调用）
 */
export function resetApiClient(): void {
  currentApiClient = null
  currentRole = null
}

/**
 * 获取当前 API 客户端（两个角色都可用）
 */
export function getApi(): ApiClient {
  if (!currentApiClient) {
    throw new Error('API Client 未初始化，请先调用 initApiClient(role)')
  }
  return currentApiClient
}

/**
 * 获取 Admin API
 */
export function getAdminApi(): AdminApi {
  if (!currentApiClient) {
    throw new Error('API Client 未初始化，请先调用 initApiClient(role)')
  }

  if (currentRole !== 'ADMIN') {
    throw new Error('当前用户不是 Admin 角色')
  }

  return currentApiClient as AdminApi
}

/**
 * 获取 Merchant API
 */
export function getMerchantApi(): MerchantApi {
  if (!currentApiClient) {
    throw new Error('API Client 未初始化，请先调用 initApiClient(role)')
  }

  if (currentRole !== 'MERCHANT') {
    throw new Error('当前用户不是 Merchant 角色')
  }

  return currentApiClient as MerchantApi
}
