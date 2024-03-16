export default class DateUtils {
    /**
     * 1日のミリ秒
     */
    static readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

    /**
     * ミリ秒を日付文字列に変換する
     * @param d {number} ミリ秒
     * @returns {string} 日付文字列
     */
    public static toDateString(d: number): string {
        return (new Date(d)).toLocaleDateString('sv-SE')
    }

    /**
     * ミリ秒を日時文字列に変換する
     * @param d {number} ミリ秒
     * @returns {string} 日付文字列
     */
    public static toDateTimeString(d): string {
        return DateUtils.toDateString(d) + ' ' + (new Date(d)).toLocaleTimeString("en-GB")
    }

    /**
     * 日付に日数を加算
     * @param date {string} 日付
     * @param days {number} 日数
     * @returns {number} 加算後の日付(ミリ秒)
     */
    public static addDays(date: string, days: number): number {
        return Date.parse(date) + days * DateUtils.MILLISECONDS_PER_DAY
    }

    /**
     * 日付と日付の差の日数を求める
     * @param date1 {string} 日付1
     * @param date2 {string} 日付2
     * @returns {number} 日数
     */
    public static diffDays(date1: string, date2: string): number {
        let d1 = new Date(date1)
        let d2 = new Date(date2)
        d1.setHours(0, 0, 0, 0)
        d2.setHours(0, 0, 0, 0)
        return Math.floor((d2.getTime() - d1.getTime()) / DateUtils.MILLISECONDS_PER_DAY)
    }

    /**
     * 日付と日付の差をmsで求める
     * @param date1 {string} 日付1
     * @param date2 {string} 日付2
     * @returns {number} 日数
     */
    public static diffInMilliseconds(date1: string, date2: string): number {
        return Date.parse(date2) - Date.parse(date1)
    }

    /**
     * 期間の重なりを求める
     * @param start1 {string} 期間1の開始日
     * @param end1 {string} 期間1の終了日
     * @param start2 {string} 期間2の開始日
     * @param end2 {string} 期間2の終了日
     * @returns {Array} 重なっている期間
     */
    public static overlapPeriod(start1, end1, start2, end2): Array<string> {
        const start = start1 <= start2 ? start2 : start1
        const end = end1 <= end2 ? end1 : end2
        return start <= end ? [start, end] : [null, null]
    }
}