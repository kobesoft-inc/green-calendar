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
    return new Date(d).toLocaleDateString('sv-SE')
  }

  /**
   * ミリ秒を日時文字列に変換する
   * @param d {number} ミリ秒
   * @returns {string} 日付文字列
   */
  public static toDateTimeString(d): string {
    return (
      DateUtils.toDateString(d) + ' ' + new Date(d).toLocaleTimeString('en-GB')
    )
  }

  /**
   * 日付に日数を加算
   * @param date {string} 日付
   * @param days {number} 日数
   * @returns {number} 加算後の日付(ミリ秒)
   */
  public static addDays(date: string, days: number): number {
    return (
      Date.parse(date.substring(0, 10) + ' 00:00:00') +
      days * DateUtils.MILLISECONDS_PER_DAY
    )
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
    return Math.floor(
      (d2.getTime() - d1.getTime()) / DateUtils.MILLISECONDS_PER_DAY,
    )
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

  /**
   * 開始時間、時間、時間間隔を渡し、何番目かを返す
   *
   * @param start {string} 開始時間
   * @param end {string} 終了時間
   * @param interval {string} 時間間隔(秒数)
   * @param time {string} 時間
   * @returns {number} 何番目か
   */
  public static timeSlot(
    start: string,
    end: string,
    interval: string,
    time: string,
  ): number {
    return Math.floor(
      (Date.parse(time > end ? end : time) - Date.parse(start)) /
        parseInt(interval) /
        1000,
    )
  }

  /**
   * 日時の時間を変更する。
   *
   * @param dateTime {string} 日時
   * @param time {string} 時間
   * @returns {string} 日時
   */
  public static setTimeOfDateTime(dateTime: string, time: string): string {
    return dateTime.substring(0, 10) + ' ' + time
  }

  /**
   * 時間を分数に変換する。
   */
  public static toMinutes(time: string): number {
    const [hour, minute] = time.split(':')
    return parseInt(hour) * 60 + parseInt(minute)
  }

  /**
   * 時間を秒数に変換する
   */
  public static toSeconds(time: string): number {
    const [h, i, s] = time.split(':')
    return (parseInt(h) * 60 + parseInt(i)) * 60 + parseInt(s)
  }
}
