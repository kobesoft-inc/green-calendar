const millisecondsPerDay = 24 * 60 * 60 * 1000

/**
 * ミリ秒を日付文字列に変換する
 * @param d {number} ミリ秒
 * @returns {string} 日付文字列
 */
export function toDateString(d) {
    return (new Date(d)).toLocaleDateString('sv-SE')
}

/**
 * ミリ秒を日時文字列に変換する
 * @param d {number} ミリ秒
 * @returns {string} 日付文字列
 */
export function toDateTimeString(d) {
    return toDateString(d) + ' ' + (new Date(d)).toLocaleTimeString("en-GB")
}

/**
 * 日付に日数を加算
 * @param date {string} 日付
 * @param days {number} 日数
 * @returns {number} 加算後の日付(ミリ秒)
 */
export function addDays(date, days) {
    return Date.parse(date) + days * millisecondsPerDay
}

/**
 * 日付と日付の差の日数を求める
 * @param date1 {string} 日付1
 * @param date2 {string} 日付2
 * @returns {number} 日数
 */
export function diffDays(date1, date2) {
    let d1 = new Date(date1)
    let d2 = new Date(date2)
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    return Math.floor((d2.getTime() - d1.getTime()) / millisecondsPerDay)
}

/**
 * 日付と日付の差をmsで求める
 * @param date1 {string} 日付1
 * @param date2 {string} 日付2
 * @returns {number} 日数
 */
export function diffInMilliseconds(date1, date2) {
    let d1 = new Date(date1)
    let d2 = new Date(date2)
    return d2 - d1
}

/**
 * 期間の重なりを求める
 * @param start1 {string} 期間1の開始日
 * @param end1 {string} 期間1の終了日
 * @param start2 {string} 期間2の開始日
 * @param end2 {string} 期間2の終了日
 * @returns {Array} 重なっている期間
 */
export function overlapPeriod(start1, end1, start2, end2) {
    const start = start1 <= start2 ? start2 : start1
    const end = end1 <= end2 ? end1 : end2
    return start <= end ? [start, end] : [null, null]
}