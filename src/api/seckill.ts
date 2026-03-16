import { http } from '@/utils/http'

const PREFIX = '/seckill'

export interface SeckillPageParams {
    page?: number
    pageSize?: number
    [key: string]: unknown
}

export interface SeckillPageResult<T> {
    current: number
    size: number
    total: number
    records: T[]
}

export interface SeckillActivity {
    id: number
    name: string
    startHour: number
    activityDate: string
    status: number
    maxItems: number
    createTime: string
    updateTime: string
}

export interface CreateSeckillActivityRequest {
    name: string
    startHour: number
    activityDate: string
    maxItems: number
}

export interface SeckillGoods {
    id: number
    auditItemId: number | null
    goodsName?: string
    mainImageUrl?: string
    status: string
    seckillPrice: number
    stock: number
}

export function createSeckillActivity(data: CreateSeckillActivityRequest) {
    return http.post(`${PREFIX}/activities`, data)
}

export function getSeckillActivityList(params: SeckillPageParams) {
    return http.get<SeckillPageResult<SeckillActivity>>(`${PREFIX}/activities/list`, params)
}

export function getSeckillActivityDetail(id: number) {
    return http.get<SeckillActivity>(`${PREFIX}/activities/${id}`)
}

export function getSeckillActivityGoods(activityId: number, params: SeckillPageParams) {
    return http.get<SeckillPageResult<SeckillGoods>>(`${PREFIX}/activities/${activityId}/goods`, params)
}
