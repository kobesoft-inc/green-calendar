export default class DayGridPopup {
    /**
     * ルート要素
     * @private
     */
    private _root: HTMLElement;

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     */
    constructor(root: HTMLElement) {
        this._root = root;
    }

    /**
     * リスナーイベントを登録する
     */
    registerCallbacks() {
        window.addEventListener('click', () => this.close());
    }

    /**
     * ポップアップを開く
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    public open(elDay: HTMLElement) {
        this.buildPopup(elDay);
        this.layoutPopup(elDay);
    }

    /**
     * ポップアップを閉じる
     */
    public close() {
        this.findPopupElement().classList.add('gc-hidden');
    }

    /**
     * ポップアップのDOM要素を取得
     * @returns {HTMLElement} ポップアップのDOM要素
     */
    private findPopupElement(): HTMLElement {
        return this._root.querySelector('.gc-day-grid-popup');
    }

    /**
     * ポップアップを構築
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    private buildPopup(elDay: HTMLElement) {
        // DOMを構築
        const elPopup = this.findPopupElement();
        const elDayBody = elDay.querySelector('.gc-day-body').cloneNode(true) as HTMLElement;
        const elDayBodyOrig = elPopup.querySelector('.gc-day-body');
        this.replaceAllDayEvents(elDayBody, this.getAllDayEventKeys(elDayBody));
        elDayBodyOrig.parentNode.replaceChild(elDayBody, elDayBodyOrig);
        this.adjustPopup(elPopup);

        // 日付を設定
        (elPopup.querySelector('.gc-date') as HTMLElement).innerText
            = (elDay.querySelector('.gc-date') as HTMLElement).innerText;
    }

    /**
     * 終日予定のkeyを全て取得
     * @param elDay {HTMLElement} カレンダーの日の本体部分のDOM要素
     */
    private getAllDayEventKeys(elDay: HTMLElement) {
        // @ts-ignore
        return Array.from(elDay.querySelectorAll('.gc-timed-events .gc-all-day-event-container[data-key]'))
            .map((el: HTMLElement) => el.dataset.key)
            .filter((key: string) => key !== '');
    }

    /**
     * 時間指定の予定の中の終日予定のスペーサーを全て削除
     * @param elDayBody {HTMLElement} カレンダーの日の本体部分のDOM要素
     * @param keys {Array} 終日予定のkey
     */
    private replaceAllDayEvents(elDayBody: HTMLElement, keys: Array<any>) {
        // 既に入っている終日予定を削除する
        // @ts-ignore
        Array.from(elDayBody.querySelectorAll('.gc-all-day-event-container'))
            .forEach((el: HTMLElement) => el.parentNode.removeChild(el));

        // 終日予定を追加
        const elAllDayEvents = elDayBody.querySelector('.gc-all-day-events');
        keys.forEach(key => {
            const el =
                this._root.querySelector('.gc-all-day-events .gc-all-day-event-container[data-key="' + key + '"]')
                    .cloneNode(true) as HTMLElement;
            el.classList.add('gc-start', 'gc-end');
            el.classList.remove('gc-hidden');
            elAllDayEvents.appendChild(el);
        })
    }

    /**
     * ポップアップ内の要素の表示を微調節する
     * @param elPopup {HTMLElement} ポップアップのDOM要素
     */
    private adjustPopup(elPopup: HTMLElement) {
        // 表示する
        elPopup.classList.remove('gc-hidden');

        // ポップアップの大きさを自動にする
        elPopup.style.width = elPopup.style.height = 'auto';

        // 時間指定の予定の高さを自動にする
        const elTimedEvents = elPopup.querySelector('.gc-timed-events') as HTMLElement;
        elTimedEvents.style.height = 'auto';

        // 他⚪︎件を非表示にする
        const elRemaining = elPopup.querySelector('.gc-remaining-container');
        elRemaining.parentNode.removeChild(elRemaining);
    }

    /**
     * ポップアップのレイアウトを更新
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    private layoutPopup(elDay: HTMLElement) {
        const elPopup = this.findPopupElement();
        const rectPopup = elPopup.getBoundingClientRect();
        const rectDay = elDay.getBoundingClientRect();
        let x = rectDay.left - 1 + window.scrollX;
        let y = rectDay.top - 1 + window.scrollY;
        let w = Math.max(rectDay.width * 1.1, rectPopup.width);
        let h = Math.max(rectDay.height, rectPopup.height);
        if (x + w > window.innerWidth) {
            x = window.innerWidth - w;
        }
        if (y + h > window.innerHeight) {
            x = window.innerHeight - h;
        }
        elPopup.style.left = x + 'px';
        elPopup.style.top = y + 'px';
        elPopup.style.width = w + 'px';
        elPopup.style.height = h + 'px';
    }
}