/**
 * 格式化日期时间
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期时间字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date | string | number | undefined | null): string {
    if (!date) return '-'

    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

    if (isNaN(d.getTime())) return '-'

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化日期时间范围
 * @param startTime - 开始时间
 * @param endTime - 结束时间
 * @returns 格式化后的时间范围字符串
 */
export function formatDateTimeRange(
    startTime: Date | string | number | undefined | null,
    endTime: Date | string | number | undefined | null,
): string {
    const start = formatDateTime(startTime)
    const end = formatDateTime(endTime)
    return `${start} ~ ${end}`
}

/**
 * 格式化日期
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串 YYYY-MM-DD
 */
export function formatDate(date: Date | string | number | undefined | null): string {
    if (!date) return '-'

    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

    if (isNaN(d.getTime())) return '-'

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * 格式化时间
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 格式化后的时间字符串 HH:mm:ss
 */
export function formatTime(date: Date | string | number | undefined | null): string {
    if (!date) return '-'

    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

    if (isNaN(d.getTime())) return '-'

    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
}

/**
 * 相对时间格式化
 * @param date - 日期对象、时间戳或日期字符串
 * @returns 相对时间字符串，如 "刚刚"、"5分钟前"、"2小时前"等
 */
export function formatRelativeTime(date: Date | string | number | undefined | null): string {
    if (!date) return '-'

    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

    if (isNaN(d.getTime())) return '-'

    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) {
        return '刚刚'
    } else if (minutes < 60) {
        return `${minutes}分钟前`
    } else if (hours < 24) {
        return `${hours}小时前`
    } else if (days < 30) {
        return `${days}天前`
    } else if (months < 12) {
        return `${months}个月前`
    } else {
        return `${years}年前`
    }
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化数字（添加千分位）
 * @param num - 数字
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(n)) return '0'

    return n.toLocaleString('zh-CN')
}

/**
 * 格式化百分比
 * @param value - 数值（0-1之间）
 * @param decimals - 保留小数位数，默认2位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    if (isNaN(value)) return '0%'

    return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 计算秒杀活动的开始和结束时间
 * @param activityDate - 活动日期 YYYY-MM-DD
 * @param startHour - 开始小时（0-23）
 * @returns { startTime: string, endTime: string } 开始和结束时间的字符串格式
 */
export function calculateSeckillTime(activityDate: string, startHour: number): { startTime: string; endTime: string } {
    const startDate = new Date(`${activityDate} ${startHour}:00:00`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 加1小时

    return {
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(endDate)
    }
}

/**
 * 格式化时长（秒）
 * @param seconds - 秒数
 * @returns 格式化后的时长字符串，如 "01:23:45"
 */
export function formatDuration(seconds: number): string {
    if (isNaN(seconds)) return '00:00:00'

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
