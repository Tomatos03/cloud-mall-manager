/**
 * 价格转换工具
 * 处理分和元之间的精确转换，避免浮点数精度损失
 */

/**
 * 将分转换为元（字符串方式，避免精度损失）
 * @param fen 金额（分）- 数字或字符串
 * @returns 元（数字格式）
 */
export function fenToYuan(fen: number | string): number {
    const fenStr = String(fen).trim()
    
    // 如果是空字符串或0，返回 0
    if (!fenStr || fenStr === '0') {
        return 0
    }
    
    // 处理负数
    const isNegative = fenStr.startsWith('-')
    const absStr = isNegative ? fenStr.slice(1) : fenStr
    
    // 使用字符串方式转换：在倒数第2位插入小数点
    let yuan: string
    
    if (absStr.length <= 2) {
        // 长度 <= 2，需要补0
        // "1" -> "0.01", "12" -> "0.12"
        yuan = '0.' + absStr.padStart(2, '0')
    } else {
        // 长度 > 2，在倒数第2位插入小数点
        const intPart = absStr.slice(0, -2)
        const decPart = absStr.slice(-2)
        yuan = intPart + '.' + decPart
    }
    
    const result = parseFloat((isNegative ? '-' : '') + yuan)
    // 四舍五入到2位小数
    return Math.round(result * 100) / 100
}

/**
 * 将元转换为分（字符串方式，避免精度损失）
 * @param yuan 金额（元）- 数字或字符串
 * @returns 分（整数）
 */
export function yuanToFen(yuan: number | string): number {
    const yuanStr = String(yuan).trim()
    
    // 如果是空字符串或0，返回 0
    if (!yuanStr || yuanStr === '0') {
        return 0
    }
    
    // 处理负数
    const isNegative = yuanStr.startsWith('-')
    const absStr = isNegative ? yuanStr.slice(1) : yuanStr
    
    // 分割整数部分和小数部分
    const [intPart = '0', decPart = '0'] = absStr.split('.')
    
    // 小数部分补0或截断至2位
    const normalizedDecPart = (decPart + '00').slice(0, 2)
    
    // 拼接为分的字符串，然后转换为数字
    const fenStr = intPart + normalizedDecPart
    let fen = parseInt(fenStr, 10)
    
    if (isNegative) {
        fen = -fen
    }
    
    return fen
}