export default function dayGrid(componentParameters) {
    return {
        /**
         * キャッシュされた表示数
         */
        cachedVisibleCount: null,

        /**1
         * キャッシュされた日の日付表示の部分の高さ
         */
        cachedDayTopHeight: null,

        /**
         * キャッシュされた予定部分の高さ
         */
        cachedEventHeight: null,

        /**
         * ホバー中の終日予定の要素
         */
        hoverAllDayEventKey: null,

        /**
         * 選択開始日
         */
        selectionStart: null,

        /**
         * 選択終了日
         */
        selectionEnd: null,

        /**
         * ドラッグ中の時間指定の予定のDOM要素
         */
        draggingTimedEvent: null,

        /**
         * ドラッグ中の終日予定のDOM要素
         */
        draggingAllDayEvent: null,

        /**
         * 終日予定をドラッグ中に、前回ホバーした日付
         */
        draggingAllDayEventPrevDate: null,

        /**
         * 終日予定のドラッグ中の移動量
         */
        draggingAllDayEventCount: 0,

        /**
         * ドラッグ中の終日予定の掴んだ日付
         */
        grabbedDate: null,

        /**
         * 終日予定の開始位置を掴んでいるかどうか
         */
        grabbedStart: false,

        /**
         * 終日予定の終了位置を掴んでいるかどうか
         */
        grabbedEnd: false,

        /**
         * 1日のミリ秒数
         */
        millisecondsPerDay: (24 * 60 * 60 * 1000),

        /**
         * カレンダーの初期化
         */
        init() {
            this.updateLayout()
            Livewire.on('refreshCalendar', () => {
                this.$nextTick(() => this.updateLayout(true))
            })
        },

        /**
         * ウィンドウのリサイズイベント
         * @param $event {Event} イベント
         */
        onResize($event) {
            this.updateLayout()
        },

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
         * クリックイベント
         * @param $event {Event} クリックイベント
         */
        onClick($event) {
            const elDay = $event.target.closest('.gc-day')
            if (this.hitRemaining($event.target)) {
                this.openPopup(elDay)
            } else if (elDay.classList.contains('gc-disabled')) {
                // 無効な日をクリックした場合
            } else {
                const key = this.findEventKeyAtElement($event.target)
                if (key) {
                    // 予定をクリックした場合
                    this.$wire.onEvent(key)
                }
                this.closePopup()
            }
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

        /**
         * マウスが押された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseDown($event) {
            if (this.hitRemaining($event.target)) {
                // 残りの予定をクリックした場合は何もしない
            } else if (this.findTimedEventAtElement($event.target)) {
                // 時間指定の予定で、マウスダウンした場合は何もしない。onDragStartで処理する。
            } else if (this.updateAllDayEventStart($event)) {
                // 終日予定の移動を開始
            } else {
                this.updateSelectionStart($event)
            }
        },

        /**
         * マウスが移動した時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseMove($event) {
            if (this.updateAllDayEventMove($event)) {
                // 終日予定の移動
            } else {
                this.updateSelectionMove($event)
            }
        },

        /**
         * マウスが離された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseUp($event) {
            if (this.updateAllDayEventEnd($event)) {
                // 終日予定の移動を終了
            } else {
                this.updateSelectionEnd($event)
            }
        },

        /**
         * マウスが要素に乗った時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseOver($event) {
            this.updateHoverAllDayEvent($event)
        },

        /**
         * 終日イベントのマウスホバー処理
         * @param $event {Event} イベント
         */
        updateHoverAllDayEvent($event) {
            if (this.draggingAllDayEvent || this.selectionStart) {
                // 終日イベントをドラッグ中、日付の選択処理中は、ホバーしない
                return
            }
            const el = this.findAllDayEventAtElement($event.target)
            const key = el ? el.dataset.key : null
            if (key !== this.hoverAllDayEventKey) {
                this.setHoverAllDayEvent(this.hoverAllDayEventKey, false)
                this.setHoverAllDayEvent(this.hoverAllDayEventKey = key, true)
            }
        },

        /**
         * 時間指定の予定を取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|HTMLElement} 予定のDOM要素またはnull
         */
        findTimedEventAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-day-grid')) {
                    return el.closest('.gc-timed-event-container')
                }
            }
            return null
        },

        /**
         * 終日予定を取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|HTMLElement} 予定のDOM要素またはnull
         */
        findAllDayEventAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-day-grid')) {
                    return el.closest('.gc-all-day-event-container')
                }
            }
            return null
        },

        /**
         * 指定したDOM要素の近くの予定のキーを取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|string} 予定のDOM要素またはnull
         */
        findEventKeyAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-day-grid')) {
                    const elEvent = el.closest('.gc-timed-event-container, .gc-all-day-event-container')
                    if (elEvent) {
                        return elEvent.dataset.key
                    }
                }
            }
            return null
        },

        /**
         * 指定された終日予定のホバーを設定する
         * @param key {string} 終日予定のキー
         * @param hover {boolean} ホバーするかどうか
         */
        setHoverAllDayEvent(key, hover) {
            if (key) {
                this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach(el => {
                    if (hover) {
                        el.classList.add('gc-hover')
                    } else {
                        el.classList.remove('gc-hover')
                    }
                })
            }
        },

        /**
         * カレンダーの日の日付を取得
         * @param el {HTMLElement} 要素
         * @returns {null|string} 日付
         */
        findDateAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-day-grid')) {
                    const elDay = el.closest('.gc-day')
                    if (elDay && !elDay.classList.contains('gc-disabled')) {
                        return elDay.dataset.date
                    }
                }
            }
            return null
        },

        /**
         * 指定された位置にある日付の要素を取得
         * @param x {number} X座標
         * @param y {number} Y座標
         * @returns {string} 日付の要素
         */
        findDateAtPoint(x, y) {
            const el = Array.from(this.$el.querySelectorAll('.gc-day-grid .gc-day')).filter(el => {
                const rect = el.getBoundingClientRect()
                return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom
            }).at(0)
            return el ? el.dataset.date : null
        },

        /**
         * 日付の選択範囲を設定
         */
        updateSelection(begin, end) {
            if (begin > end) {
                [begin, end] = [end, begin]
            }
            this.$el.querySelectorAll('.gc-day-grid .gc-day').forEach(el => {
                const date = el.dataset.date
                if (begin && end && begin <= date && date <= end) {
                    el.classList.add('gc-selected')
                } else {
                    el.classList.remove('gc-selected')
                }
            })
        },

        /**
         * 選択を開始
         * @param $event {Event} イベント
         */
        updateSelectionStart($event) {
            const date = this.findDateAtElement($event.target)
            if (date) {
                this.selectionStart = this.selectionEnd = date
            }
        },

        /**
         * 移動時の選択処理
         * @param $event {MouseEvent} イベント
         */
        updateSelectionMove($event) {
            const date = this.findDateAtPoint($event.x, $event.y)
            if (this.selectionStart) {
                this.selectionEnd = date
                this.updateSelection(this.selectionStart, this.selectionEnd)
            }
        },

        /**
         * 選択を終了
         * @param $event {MouseEvent} イベント
         */
        updateSelectionEnd($event) {
            const date = this.findDateAtPoint($event.x, $event.y)
            if (this.selectionStart) {
                const [start, end] = [this.selectionStart, date].sort()
                this.$wire.onDate(start + ' 00:00:00', end + ' 23:59:59')
                this.selectionStart = this.selectionEnd = null
                this.updateSelection(null, null)
            }
        },

        /**
         * ドラッグイベント
         * @param $event {DragEvent} イベント
         */
        onDragStart($event) {
            const el = $event.target.closest('.gc-timed-event-container')
            if (el) {
                this.draggingTimedEvent = el
                $event.dataTransfer.effectAllowed = 'move'
                $event.dataTransfer.setData('text/plain', el.dataset.key)
                this.$nextTick(() => {
                    el.classList.add('gc-dragging')
                })
            }
        },

        /**
         * ドラッグ中の要素が要素に乗った時のイベント
         * @param $event
         */
        onDragOver($event) {
            const date = this.findDateAtPoint($event.x, $event.y)
            if (date) {
                this.updateSelection(date, date)
                $event.preventDefault()
            }
        },

        /**
         * ドロップイベント
         * @param $event {DragEvent} イベント
         */
        onDrop($event) {
            // ドロップ処理を実行
            const date = this.findDateAtPoint($event.x, $event.y)
            const key = $event.dataTransfer.getData('text/plain')
            if (date) {
                const diffDays = this.diffDays(this.draggingTimedEvent.dataset.start, date)
                if (diffDays !== 0) {
                    const start = this.toDateTimeString(this.addDays(this.draggingTimedEvent.dataset.start, diffDays))
                    const end = this.toDateTimeString(this.addDays(this.draggingTimedEvent.dataset.end, diffDays))
                    this.$wire.onMove(key, start, end)
                    this.draggingTimedEvent = null
                }
            }
        },

        /**
         * ドラッグ中の要素が要素から外れた時のイベント
         * @param $event
         */
        onDragEnd($event) {
            // 選択範囲を解除
            this.updateSelection(null, null)

            // ドラッグ中の要素を元に戻す
            if (this.draggingTimedEvent) {
                this.draggingTimedEvent.classList.remove('gc-dragging')
                this.draggingTimedEvent = null
            }
        },

        /**
         * ドラッグ中のクラスを設定する
         */
        setAllDayEventDragging(key, dragging) {
            this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach(el => {
                if (dragging) {
                    el.classList.add('gc-dragging')
                } else {
                    el.classList.remove('gc-dragging')
                }
            })
        },

        /**
         * 終日予定の移動を開始
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を開始したかどうか
         */
        updateAllDayEventStart($event) {
            const el = this.findAllDayEventAtElement($event.target)
            if (el) {
                // 終日予定の変形を設定
                this.grabbedStart = this.grabbedEnd = true
                if (this.hitHead($event.target)) { // 終日予定の先頭部分に当たった場合、終了日は固定
                    this.grabbedEnd = false
                }
                if (this.hitTail($event.target)) { // 終日予定の末尾部分に当たった場合、開始日は固定
                    this.grabbedStart = false
                }

                // 掴んだ日付
                this.grabbedDate = this.findDateAtPoint($event.x, $event.y)

                // ドラッグ中のDOM要素
                this.draggingAllDayEvent = el

                // ドラッグ中の終日予定のクラスを設定（表示を消す）
                this.setAllDayEventDragging(this.draggingAllDayEvent.dataset.key, true)

                // 現在の日付を記録
                this.draggingAllDayEventPrevDate = null

                // ドラッグ中の終日予定のプレビューを表示
                this.updateAllDayEventPreview(this.grabbedDate)

                // カーソルを設定
                this.updateAllDayEventCursor()

                // ドラッグ中の終日予定の移動量を初期化
                this.draggingAllDayEventCount = 0

                return true
            }
            return false
        },

        /**
         * 終日予定の先頭部分に当たったかどうか
         * @param el {HTMLElement} 判定する要素
         * @returns {boolean} 先頭部分に当たったかどうか
         */
        hitHead(el) {
            return !!el.closest('.gc-head')
        },

        /**
         * 終日予定の末尾部分に当たったかどうか
         * @param el {HTMLElement} 判定する要素
         * @returns {boolean} 末尾部分に当たったかどうか
         */
        hitTail(el) {
            return !!el.closest('.gc-tail')
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         */
        updateAllDayEventMove($event) {
            if (this.draggingAllDayEvent) {
                const date = this.findDateAtPoint($event.x, $event.y)
                if (date) {
                    this.updateAllDayEventPreview(date)
                }
                this.draggingAllDayEventCount++
                return true
            }
            return false
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         */
        updateAllDayEventEnd($event) {
            if (this.draggingAllDayEvent) {
                const key = this.draggingAllDayEvent.dataset.key
                const date = this.findDateAtPoint($event.x, $event.y)
                if (date && this.grabbedDate !== date) {
                    const [start, end] = this.getChangedAllDayEventPeriod(date)
                    this.$wire.onMove(key, start, end)
                } else if (this.draggingAllDayEventCount < 2) {
                    this.$wire.onEvent(key)
                } else {
                    this.removeAllDayEventPreview()
                    this.setAllDayEventDragging(key, false)
                }
                this.draggingAllDayEvent = null
                this.grabbedStart = this.grabbedEnd = null
                this.updateAllDayEventCursor()
                return true
            }
            return false
        },

        /**
         * ドラッグ中の終日予定のプレビューを更新する
         * @param date {string} マウスの位置の日付
         */
        updateAllDayEventPreview(date) {
            if (this.draggingAllDayEventPrevDate !== date) {
                const [start, end] = this.getChangedAllDayEventPeriod(date)
                this.removeAllDayEventPreview()
                this.createAllDayEventPreview(this.draggingAllDayEvent, start, end)
                this.draggingAllDayEventPrevDate = date
            }
        },

        /**
         * 終日予定をドラッグ中のカーソルを更新する
         */
        updateAllDayEventCursor() {
            this.$el.classList.remove('gc-day-grid-cursor-w-resize', 'gc-day-grid-cursor-e-resize')
            if (this.grabbedStart) {
                this.$el.classList.add('gc-day-grid-cursor-w-resize')
            }
            if (this.grabbedEnd) {
                this.$el.classList.add('gc-day-grid-cursor-e-resize')
            }
        },

        /**
         * 変更後の終日予定の期間を取得する
         * @param date {string} マウスの位置の日付
         */
        getChangedAllDayEventPeriod(date) {
            const diffDays = this.diffDays(this.grabbedDate, date)
            let start = this.toDateString(this.addDays(this.draggingAllDayEvent.dataset.start, this.grabbedStart ? diffDays : 0))
            let end = this.toDateString(this.addDays(this.draggingAllDayEvent.dataset.end, this.grabbedEnd ? diffDays : 0))
            if (start > end) {
                if (this.grabbedStart) {
                    start = end
                }
                if (this.grabbedEnd) {
                    end = start
                }
            }
            return [start, end]
        },

        /**
         * ドラッグ中の終日予定のプレビューを表示
         * @param elEvent {HTMLElement} 予定のDOM要素
         * @param eventStart {string} 予定の開始日
         * @param eventEnd {string} 予定の終了日
         */
        createAllDayEventPreview(elEvent, eventStart, eventEnd) {
            // 各週ごとに処理
            Array.from(this.$el.querySelectorAll('.gc-week')).forEach(elWeek => {
                const [weekStart, weekEnd] = this.getWeekPeriod(elWeek)
                if (weekStart && weekEnd) {
                    const [periodStart, periodEnd] = this.overlapPeriod(eventStart, eventEnd, weekStart, weekEnd)
                    if (periodStart && periodEnd) {
                        const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview')
                        if (weekStart <= this.grabbedDate && this.grabbedDate <= weekEnd) {
                            // ドラッグを開始した週では、ドラッグ位置を考慮して空の終日予定を追加する
                            this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent))
                        }
                        const el = elEvent.cloneNode(true)
                        const days = this.diffDays(periodStart, periodEnd) + 1
                        this.adjustAllDayEventForPreview(el, days, periodStart === eventStart, periodEnd === eventEnd)
                        elPreview.appendChild(el)
                    }
                }
            })
        },

        /**
         * 週の開始日・終了日を取得
         * @param elWeek {HTMLElement} 週のDOM要素
         * @returns {Array} 週の開始日・終了日
         */
        getWeekPeriod(elWeek) {
            const elDays = elWeek.querySelectorAll('.gc-day:not(.gc-disabled)')
            if (elDays.length > 0) {
                return [elDays[0].dataset.date, elDays[elDays.length - 1].dataset.date]
            } else {
                return [null, null]
            }
        },

        /**
         * 期間の重なりを求める
         * @param start1 {string} 期間1の開始日
         * @param end1 {string} 期間1の終了日
         * @param start2 {string} 期間2の開始日
         * @param end2 {string} 期間2の終了日
         * @returns {Array} 重なっている期間
         */
        overlapPeriod(start1, end1, start2, end2) {
            return [start1 <= end2 && start2 <= end1 ? (start1 < start2 ? start2 : start1) : null, start1 <= end2 && start2 <= end1 ? (end1 < end2 ? end1 : end2) : null]
        },

        /**
         * ドラッグ中の終日予定をプレビューに合わせる
         * @param el {HTMLElement} 予定のDOM要素
         * @param days {number} ドラッグ中の終日予定の日数
         * @param isStart {boolean} 週内に開始するかどうか
         * @param isEnd {boolean} 週内に終了するかどうか
         */
        adjustAllDayEventForPreview(el, days, isStart, isEnd) {
            el.classList.remove('gc-dragging')
            el.classList.remove('gc-start')
            el.classList.remove('gc-end')
            for (let i = 1; i <= 7; i++) {
                el.classList.remove('gc-' + i + 'days')
            }
            el.classList.add('gc-' + days + 'days')
            if (isStart) {
                el.classList.add('gc-start')
            }
            if (isEnd) {
                el.classList.add('gc-end')
            }
            return el
        },

        /**
         * ミリ秒を日付文字列に変換する
         * @param d {number} ミリ秒
         * @returns {string} 日付文字列
         */
        toDateString(d) {
            return (new Date(d)).toLocaleDateString('sv-SE')
        },

        /**
         * ミリ秒を日時文字列に変換する
         * @param d {number} ミリ秒
         * @returns {string} 日付文字列
         */
        toDateTimeString(d) {
            return this.toDateString(d) + ' ' + (new Date(d)).toLocaleTimeString("en-GB")
        },

        /**
         * 日付に日数を加算
         * @param date {string} 日付
         * @param days {number} 日数
         * @returns {number} 加算後の日付(ミリ秒)
         */
        addDays(date, days) {
            return Date.parse(date) + days * this.millisecondsPerDay
        },

        /**
         * 日付と日付の差の日数を求める
         * @param date1 {string} 日付1
         * @param date2 {string} 日付2
         * @returns {number} 日数
         */
        diffDays(date1, date2) {
            let d1 = new Date(date1)
            let d2 = new Date(date2)
            d1.setHours(0, 0, 0, 0)
            d2.setHours(0, 0, 0, 0)
            return Math.floor((d2.getTime() - d1.getTime()) / this.millisecondsPerDay)
        },

        /**
         * 指定したDOM要素が兄弟の中で何番目かを取得
         * @param el {HTMLElement} DOM要素
         * @returns {number} インデックス
         */
        getIndexInParent(el) {
            return Array.from(el.parentNode.children).indexOf(el)
        },

        /**
         * 指定した数だけ空の終日予定を追加する
         */
        addEmptyAllDayEvents(elPreview, count) {
            for (let i = 0; i < count; i++) {
                const el = document.createElement('div')
                el.classList.add('gc-all-day-event-container')
                elPreview.appendChild(el)
            }
        },

        /**
         * 終日予定のプレビューを削除
         */
        removeAllDayEventPreview() {
            Array.from(this.$el.querySelectorAll('.gc-all-day-event-preview'))
                .forEach(el => el.parentNode.replaceChild(el.cloneNode(false), el))
        },
    }
}