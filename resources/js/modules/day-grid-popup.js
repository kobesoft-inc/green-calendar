export default function dayGridPopup($el, componentParameters) {
    return {
        $el,
        componentParameters,

        /**
         * キャッシュされた表示数
         */
        cachedVisibleCount: null,

        /**
         * キャッシュされた日の日付表示の部分の高さ
         */
        cachedDayTopHeight: null,

        /**
         * キャッシュされた予定部分の高さ
         */
        cachedEventHeight: null,

        /**
         * カレンダーのレイアウトを再計算
         * @param {boolean} force 強制的に再計算するかどうか
         */
        updateLayout(force = false) {
            // 表示数が変わっていない場合は何もしない
            const visibleCount = this.getVisibleCount()
            if (this.cachedVisibleCount !== visibleCount || force) {
                this.cachedVisibleCount = visibleCount
                this.$el.querySelectorAll('.gc-week .gc-day').forEach(elDay => {
                    this.updateDay(elDay, visibleCount)
                })
            }
        },

        /**
         * カレンダーの日の高さを取得
         * @returns {number} 日の高さ
         */
        getDayHeight() {
            return this.$el.querySelector('.gc-week .gc-day').offsetHeight
        },

        /**
         * カレンダーの各日の日付表示の部分の高さを取得
         * @returns {number} 日付表示の部分の高さ
         */
        getDayTopHeight() {
            if (this.cachedDayTopHeight) {
                return this.cachedDayTopHeight
            } else {
                return this.cachedDayTopHeight = this.$el.querySelector('.gc-day-top').offsetHeight
            }
        },

        /**
         * カレンダーの各日の本体部分の高さを取得
         * @returns {number} 本体部分の高さ
         */
        getDayBodyHeight() {
            return this.getDayHeight() - this.getDayTopHeight()
        },

        /**
         * 予定の高さを取得
         * @returns {number} 予定の高さ
         */
        getEventHeight() {
            if (this.cachedEventHeight) {
                return this.cachedEventHeight
            } else {
                return this.cachedEventHeight = this.$el.querySelector('.gc-timed-events > .gc-all-day-event-container, .gc-timed-events > .gc-timed-event-container').offsetHeight
            }
        },

        /**
         * 表示できる数を取得
         * @returns {number} 表示できる数
         */
        getVisibleCount() {
            return Math.floor(this.getDayBodyHeight() / this.getEventHeight())
        },

        /**
         * カレンダーの日の予定数を取得
         * @returns {number} 予定数
         */
        getEventCount(elDay) {
            return elDay.querySelectorAll('.gc-timed-events > .gc-all-day-event-container, .gc-timed-events > .gc-timed-event-container').length
        },

        /**
         * 時間指定の予定の高さを設定
         * @param elDay {HTMLElement} カレンダーの日
         * @param height {number} 高さ
         */
        setTimedEventsHeight(elDay, height) {
            elDay.querySelector('.gc-timed-events').style.height = height + 'px'
        },

        /**
         * 終日予定の表示・非表示を設定
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         * @param visibleEvents {number} 表示可能な予定数
         */
        setAllDayEventsVisibility(elDay, visibleEvents) {
            elDay.querySelectorAll('.gc-all-day-events .gc-all-day-event-container').forEach((elEvent, index) => {
                if (index <= visibleEvents) {
                    elEvent.classList.remove('gc-hidden')
                } else {
                    elEvent.classList.add('gc-hidden')
                }
            })
        },

        /**
         * 残りの予定数を設定
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         * @param remainingCount {number} 残りの予定数
         */
        setRemainingCount(elDay, remainingCount) {
            const elRemaining = elDay.querySelector('.gc-remaining-container')
            if (remainingCount > 0) {
                elRemaining.children[0].innerText = componentParameters.remaining.replace(':count', remainingCount)
                elRemaining.classList.remove('gc-hidden')
            } else {
                elRemaining.classList.add('gc-hidden')
            }
        },

        /**
         * 表示する予定数を更新
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         * @param visibleCount {number} 表示できる数
         */
        updateDay(elDay, visibleCount) {
            const eventCount = this.getEventCount(elDay)
            const limitCount = eventCount < visibleCount ? eventCount : visibleCount - 1
            const remainingCount = eventCount - limitCount
            this.setTimedEventsHeight(elDay, this.getEventHeight() * limitCount)
            this.setAllDayEventsVisibility(elDay, limitCount - (remainingCount ? 1 : 0))
            this.setRemainingCount(elDay, remainingCount)
        },

        /**
         * 残りの予定をクリックしたかどうか
         * @param el {HTMLElement} クリックされた要素
         * @returns {boolean} 残りの予定をクリックしたかどうか
         */
        hitRemaining(el) {
            return el.closest('.gc-remaining-container') !== null && this.$el.contains(el)
        },

        /**
         * ポップアップを開く
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         */
        openPopup(elDay) {
            this.buildPopup(elDay)
            this.layoutPopup(elDay)
        },

        /**
         * ポップアップを閉じる
         */
        closePopup() {
            const elPopup = this.$el.querySelector('.gc-day-grid-popup')
            elPopup.classList.add('gc-hidden')
        },

        /**
         * ポップアップを構築
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         */
        buildPopup(elDay) {
            // DOMを構築
            const elPopup = this.$el.querySelector('.gc-day-grid-popup')
            const elDayBody = elDay.querySelector('.gc-day-body').cloneNode(true)
            const elDayBodyOrig = elPopup.querySelector('.gc-day-body')
            this.replaceAllDayEvents(elDayBody, this.getAllDayEventKeys(elDayBody))
            elDayBodyOrig.parentNode.replaceChild(elDayBody, elDayBodyOrig)
            this.adjustPopup(elPopup)

            // 日付を設定
            elPopup.querySelector('.gc-date').innerText = elDay.querySelector('.gc-date').innerText
        },

        /**
         * 終日予定のkeyを全て取得
         * @param elDay {HTMLElement} カレンダーの日の本体部分のDOM要素
         */
        getAllDayEventKeys(elDay) {
            return Array.from(elDay.querySelectorAll('.gc-timed-events .gc-all-day-event-container[data-key]'))
                .map(el => el.dataset.key).filter(key => key !== '')
        },

        /**
         * 時間指定の予定の中の終日予定のスペーサーを全て削除
         * @param elDayBody {HTMLElement} カレンダーの日の本体部分のDOM要素
         * @param keys {Array} 終日予定のkey
         */
        replaceAllDayEvents(elDayBody, keys) {
            // 既に入っている終日予定を削除する
            Array.from(elDayBody.querySelectorAll('.gc-all-day-event-container')).forEach(el => el.parentNode.removeChild(el))

            // 終日予定を追加
            const elAllDayEvents = elDayBody.querySelector('.gc-all-day-events')
            keys.forEach(key => {
                const el = this.$el.querySelector('.gc-all-day-events .gc-all-day-event-container[data-key="' + key + '"]').cloneNode(true)
                el.classList.add('gc-start', 'gc-end')
                el.classList.remove('gc-hidden')
                elAllDayEvents.appendChild(el)
            })
        },

        /**
         * ポップアップ内の要素の表示を微調節する
         * @param elPopup {HTMLElement} ポップアップのDOM要素
         */
        adjustPopup(elPopup) {
            // 表示する
            elPopup.classList.remove('gc-hidden')

            // ポップアップの大きさを自動にする
            elPopup.style.width = 'auto'
            elPopup.style.height = 'auto'

            // 時間指定の予定の高さを自動にする
            const elTimedEvents = elPopup.querySelector('.gc-timed-events')
            elTimedEvents.style.height = 'auto'

            // 他⚪︎件を非表示にする
            const elRemaining = elPopup.querySelector('.gc-remaining-container')
            elRemaining.parentNode.removeChild(elRemaining)
        },

        /**
         * ポップアップのレイアウトを更新
         * @param elDay {HTMLElement} カレンダーの日のDOM要素
         */
        layoutPopup(elDay) {
            const elPopup = this.$el.querySelector('.gc-day-grid-popup')
            const rectPopup = elPopup.getBoundingClientRect()
            const rectDay = elDay.getBoundingClientRect()
            let x = rectDay.left - 1 + window.scrollX
            let y = rectDay.top - 1 + window.scrollY
            let w = Math.max(rectDay.width * 1.1, rectPopup.width)
            let h = Math.max(rectDay.height, rectPopup.height)
            if (x + w > window.innerWidth) {
                x = window.innerWidth - w
            }
            if (y + h > window.innerHeight) {
                x = window.innerHeight - h
            }
            elPopup.style.left = x + 'px'
            elPopup.style.top = y + 'px'
            elPopup.style.width = w + 'px'
            elPopup.style.height = h + 'px'
        },
    }
}