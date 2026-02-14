import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 枚举定义 ============

/**
 * 订单类型枚举
 */
export enum OrderType {
    /**
     * 父订单（聚合订单，多店铺场景）
     */
    PARENT = 'PARENT',

    /**
     * 子订单（多店铺场景下的单个店铺订单）
     */
    SUB = 'SUB',

    /**
     * 普通订单（单店铺场景）
     */
    NORMAL = 'NORMAL',
}

/**
 * 父订单状态枚举（聚合订单状态）
 */
export enum ParentOrderStatus {
    /**
     * 待支付
     */
    CREATED = 'CREATED',

    /**
     * 已支付
     */
    PAID = 'PAID',

    /**
     * 履约中（有子订单正在履约，未全部完成）
     */
    PROCESSING = 'PROCESSING',

    /**
     * 已完成（所有子订单均已完成）
     */
    FINISHED = 'FINISHED',

    /**
     * 已取消（父订单整体取消）
     */
    CANCELED = 'CANCELED',

    /**
     * 已关闭（父订单整体关闭）
     */
    CLOSED = 'CLOSED',
}

export type OrderStatus = SubOrderStatus | ParentOrderStatus

/**
 * 子订单/普通订单状态枚举
 */
export enum SubOrderStatus {
    /**
     * 待支付
     */
    CREATED = 'CREATED',

    /**
     * 已支付
     */
    PAID = 'PAID',

    /**
     * 已发货
     */
    SHIPPED = 'SHIPPED',

    /**
     * 已完成
     */
    FINISHED = 'FINISHED',

    /**
     * 已取消
     */
    CANCELED = 'CANCELED',

    /**
     * 已关闭
     */
    CLOSED = 'CLOSED',
}

// ============ 类型定义 ============

/**
 * 订单详情中的商品项
 */
export interface OrderGoodsItem {
    goodsId: string // 商品ID
    goodsName: string // 商品名称
    goodsMainImageUrl: string // 商品图片
    goodsPrice: string // 商品价格（单位：元）
    quantity: number // 数量
    totalPrice: string // 小计（单位：元）
    createTime: string // 创建时间
    selectedSpecs?: Record<string, string> // 选中的规格（规格名：规格值）
}

/**
 * 子订单/店铺订单项
 */
export interface OrderStoreItem {
    orderNo: string // 子订单号
    storeId: string // 店铺ID
    storeName: string // 店铺名称
    status: string // 订单状态
    items: OrderGoodsItem[] // 商品列表
    totalPrice: string // 该店铺订单总价（单位：元）
    count: number // 商品总数
}

/**
 * 订单详情对象 (对应后端返回的 data 对象)
 */
export interface OrderDetail {
    orderNo: string // 主订单号
    status: string // 订单状态
    createTime: string // 下单时间
    storeOrders: OrderStoreItem[] // 店铺订单列表
    totalPrice: string // 订单总价（单位：元）
}

/**
 * 订单列表项类型 (用于表格展示)
 * 基于实际后端返回数据结构定义
 */
export interface OrderItem {
    orderNo: string // 订单号
    orderStatus: string // 订单状态
    orderType: OrderType // 订单类型
    createTime: string // 下单时间
    goodsNum: number // 商品数量
    totalPrice: string // 订单总价（单位：元）
    buyerName: string // 买家名称
    phone: string // 电话
    detailAddress: string // 详细地址
}

// ============ 状态映射 ============

/**
 * 父订单状态映射
 */
export const ParentOrderStatusMap: Record<
    string,
    { label: string; type: 'warning' | 'primary' | 'success' | 'info' | 'danger' }
> = {
    CREATED: { label: '待支付', type: 'warning' },
    PAID: { label: '已支付', type: 'primary' },
    PROCESSING: { label: '进行中', type: 'primary' },
    FINISHED: { label: '已完成', type: 'success' },
    CANCELED: { label: '已取消', type: 'info' },
    CLOSED: { label: '已关闭', type: 'info' },
}

/**
 * 订单状态映射 - 管理员视角
 */
export const OrderStatusMap: Record<
    string,
    { label: string; type: 'warning' | 'primary' | 'success' | 'info' | 'danger' }
> = {
    CREATED: { label: '待支付', type: 'warning' },
    PAID: { label: '待发货', type: 'primary' },
    SHIPPED: { label: '待收货', type: 'primary' },
    FINISHED: { label: '已完成', type: 'success' },
    CANCELED: { label: '已取消', type: 'info' },
    CLOSED: { label: '已关闭', type: 'info' },
}

// ============ 工具函数 ============

/**
 * 获取订单状态信息
 * @param orderType 订单类型
 * @param status 订单状态码
 */
export function getOrderStatusInfo(orderType: OrderType, status: OrderStatus) {
    if (!status) {
        return { label: '-', type: 'info' as const }
    }

    // 父订单使用专用状态映射
    if (orderType === OrderType.PARENT) {
        return ParentOrderStatusMap[status] || { label: '-', type: 'info' as const }
    }

    // 子订单和普通订单使用统一状态映射
    return OrderStatusMap[status] || { label: '-', type: 'info' as const }
}

/**
 * 获取订单类型标签
 */
export function getOrderTypeLabel(orderType: OrderType): string {
    const typeMap: Record<string, string> = {
        [OrderType.PARENT]: '聚合订单',
        [OrderType.SUB]: '普通订单',
        [OrderType.NORMAL]: '普通订单',
    }
    return typeMap[orderType] || '-'
}

// ============ API ============

const PREFIX = '/order'

// 分页查询参数直接使用 PageParams

/**
 * 分页查询订单列表
 */
export function fetchOrderPage(params: PageParams) {
    return http.get<PageResult<OrderItem>>(`${PREFIX}/page`, params)
}

/**
 * 获取订单详情
 */
export function fetchOrderDetail(orderNo: string) {
    return http.get<OrderDetail>(`${PREFIX}/detail/${orderNo}`)
}
