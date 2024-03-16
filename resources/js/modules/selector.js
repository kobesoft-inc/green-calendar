export default function selector($el, rootSelector, targetSelector, propertyName) {
    return {
        /**
         * カレンダーのルート要素
         */
        $el,

        /**
         * カレンダーのルート要素のセレクタ
         */
        rootSelector,

        /**
         * カレンダーの日付を選択する要素のセレクタ
         */
        targetSelector,

        /**
         * プロパティ名
         */
        propertyName,

        /**
         * 選択開始日
         */
        selectionStart: null,

        /**
         * 選択終了日
         */
        selectionEnd: null,

        /**
         * 選択時のコールバック
         */
        onSelect: null,

        /**
         * カレンダーの日の日付を取得
         * @param el {HTMLElement} 要素
         * @returns {null|string} 日付
         */
        findDateAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest(this.rootSelector)) {
                    const elDay = el.closest(this.targetSelector)
                    if (elDay && !elDay.classList.contains('gc-disabled')) {
                        return elDay.dataset[this.propertyName]
                    }
                }
            }
            return null
        },

        /**
         * 指定された位置にある日付の要素を取得
         * @param x {number} X座標
         * @param y {number} Y座標
         * @returns {string} 日付
         */
        findDateAtPoint(x, y) {
            const el = Array.from(this.$el.querySelectorAll(this.rootSelector + ' ' + this.targetSelector)).filter(el => {
                const rect = el.getBoundingClientRect()
                return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom
            }).at(0)
            return el ? el.dataset[this.propertyName] : null
        },

        /**
         * 日付の要素を取得
         *
         * @param date {string} 日付
         * @returns {HTMLElement} 日付の要素
         */
        findElementByDate(date) {
            return this.$el.querySelector(this.rootSelector + ' ' + this.targetSelector + '[data-' + this.propertyName + '="' + date + '"]')
        },

        /**
         * 日付の選択範囲を設定
         */
        updateSelection(begin, end) {
            if (begin > end) {
                [begin, end] = [end, begin]
            }
            this.$el.querySelectorAll(this.rootSelector + ' ' + this.targetSelector).forEach(el => {
                const date = el.dataset[this.propertyName]
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
        onMouseDown($event) {
            const date = this.findDateAtElement($event.target)
            if (date) {
                this.selectionStart = this.selectionEnd = date
                return true
            }
            return false
        },

        /**
         * 移動時の選択処理
         * @param $event {MouseEvent} イベント
         */
        onMouseMove($event) {
            const date = this.findDateAtPoint($event.x, $event.y)
            if (this.selectionStart) {
                this.selectionEnd = date
                this.updateSelection(this.selectionStart, this.selectionEnd)
                return true
            }
            return false
        },

        /**
         * 選択を終了
         * @param $event {MouseEvent} イベント
         * @param onSelect {function} 選択時のコールバック
         */
        onMouseUp($event, onSelect) {
            const date = this.findDateAtPoint($event.x, $event.y)
            if (this.selectionStart) {
                const [start, end] = [this.selectionStart, date].sort()
                if (this.onSelect) {
                    this.onSelect(start, end)
                }
                this.selectionStart = this.selectionEnd = null
                this.updateSelection(null, null)
                return true
            }
            return false
        },
    }
}