var S=Object.defineProperty;var f=(n,t,e)=>t in n?S(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var s=(n,t,e)=>(f(n,typeof t!="symbol"?t+"":t,e),e);var d=class{constructor(t){s(this,"_root");s(this,"_containerSelector",null);s(this,"_elementSelector",null);s(this,"_propertyName",null);s(this,"_selectionStart",null);s(this,"_selectionEnd",null);s(this,"_resourceId",null);s(this,"_onDraw",null);s(this,"_onSelect",null);this._root=t}registerCallbacks(){this._root.addEventListener("mousedown",this._mouseDown.bind(this)),this._root.addEventListener("mousemove",this._mouseMove.bind(this)),this._root.addEventListener("mouseup",this._mouseUp.bind(this))}setContainerSelector(t){return this._containerSelector=t,this}setElementSelector(t){return this._elementSelector=t,this}setPropertyName(t){return this._propertyName=t,this}onDraw(t){return this._onDraw=t,this}onSelect(t){return this._onSelect=t,this}select(t){return this._selectionStart=this._selectionEnd=t,this.update(),this}selectEnd(t){return this._selectionEnd=t,this.update(),this}deselect(){this.select(null)}getSelection(){return[this._selectionStart,this._selectionEnd].sort()}isSelected(){return this._selectionStart!==null&&this._selectionEnd!==null}_mouseDown(t){let e=this.pickValueByPosition(t.x,t.y);e&&(this._resourceId=this.pickResourceId(t.target),this.select(e),t.stopImmediatePropagation())}_mouseMove(t){if(this.isSelected()){let e=this.pickValueByPosition(t.x,t.y);e&&(this.selectEnd(e),t.stopImmediatePropagation())}}_mouseUp(t){if(this.isSelected()){if(this.pickValueByPosition(t.x,t.y)){if(this._onSelect){let[i,r]=this.getSelection();console.log(i,r,this._resourceId),this._onSelect(i,r,this._resourceId)}this.deselect()}t.stopImmediatePropagation()}}pickValue(t){return this._root.contains(t)&&t.closest(this._containerSelector)?t.closest(this._elementSelector+":not(.disabled)")?.dataset[this._propertyName]:null}pickResourceId(t){return this._root.contains(t)&&t.closest(this._containerSelector)?t.closest("[data-resource-id]")?.dataset.resourceId??null:null}pickValueByPosition(t,e){return Array.from(this._root.querySelectorAll(this._containerSelector+" "+this._elementSelector)).filter(i=>{let r=i.getBoundingClientRect();return r.left<=t&&t<=r.right&&r.top<=e&&e<=r.bottom}).at(0)?.dataset[this._propertyName]??null}getElementByValue(t){return this._root.querySelector(this._containerSelector+" "+this._elementSelector+"[data-"+this._propertyName+'="'+t+'"]')}update(){if(this._onDraw){let[i,r]=this.getSelection();return this._onDraw(i,r,this._resourceId)}let[t,e]=this.getSelection();this._root.querySelectorAll(this._containerSelector+(this._resourceId!==null?' [data-resource-id="'+this._resourceId+'"] ':" ")+this._elementSelector).forEach(i=>{let r=i.dataset[this._propertyName];t<=r&&r<=e?i.classList.add("gc-selected"):i.classList.remove("gc-selected")})}};var u=class u{static toDateString(t){return new Date(t).toLocaleDateString("sv-SE")}static toDateTimeString(t){return u.toDateString(t)+" "+new Date(t).toLocaleTimeString("en-GB")}static addDays(t,e){return Date.parse(t.substring(0,10)+" 00:00:00")+e*u.MILLISECONDS_PER_DAY}static diffDays(t,e){let i=new Date(t),r=new Date(e);return i.setHours(0,0,0,0),r.setHours(0,0,0,0),Math.floor((r.getTime()-i.getTime())/u.MILLISECONDS_PER_DAY)}static diffInMilliseconds(t,e){return Date.parse(e)-Date.parse(t)}static overlapPeriod(t,e,i,r){let o=t<=i?i:t,l=e<=r?e:r;return o<=l?[o,l]:[null,null]}static timeSlot(t,e,i,r){return Math.floor((Date.parse(r>e?e:r)-Date.parse(t))/parseInt(i)/1e3)}static setTimeOfDateTime(t,e){return t.substring(0,10)+" "+e}static toMinutes(t){let[e,i]=t.split(":");return parseInt(e)*60+parseInt(i)}static toSeconds(t){let[e,i,r]=t.split(":");return(parseInt(e)*60+parseInt(i))*60+parseInt(r)}};s(u,"MILLISECONDS_PER_DAY",24*60*60*1e3);var a=u;var h=class{constructor(t,e){s(this,"_root");s(this,"_containerSelector",null);s(this,"_eventSelector",null);s(this,"_selector",null);s(this,"_headCursor","gc-cursor-w-resize");s(this,"_tailCursor","gc-cursor-e-resize");s(this,"_dragging",null);s(this,"_draggingStart",null);s(this,"_draggingEnd",null);s(this,"_draggingValue",null);s(this,"_draggingCount",0);s(this,"_grabbed");s(this,"_isGrabbingHead",!1);s(this,"_isGrabbingTail",!1);s(this,"_unit",1);s(this,"_onEvent",null);s(this,"_onMove",null);s(this,"_onPreview",null);this._root=t,this._selector=e}registerCallbacks(){this._root.addEventListener("mousedown",this._onMouseDown.bind(this)),this._root.addEventListener("mousemove",this._onMouseMove.bind(this)),this._root.addEventListener("mouseup",this._onMouseUp.bind(this))}_onMouseDown(t){let e=this.pickEvent(t.target);e&&(this._isGrabbingHead=this._isGrabbingTail=!0,this.hitHead(t.target)&&(this._isGrabbingTail=!1),this.hitTail(t.target)&&(this._isGrabbingHead=!1),this._grabbed=this._selector.pickValueByPosition(t.x,t.y),this._dragging=e,this._draggingStart=this._dragging.dataset.start,this._draggingEnd=this._dragging.dataset.end,this.setDraggingClass(this._dragging.dataset.key,!0),this._draggingValue=null,this.updatePreview(this._grabbed),this.updateCursor(),this._draggingCount=0,t.stopImmediatePropagation())}_onMouseMove(t){if(this._dragging){let e=this._selector.pickValueByPosition(t.x,t.y);e!==null&&this.updatePreview(e),this._draggingCount++,t.stopImmediatePropagation()}}_onMouseUp(t){if(this._dragging){let e=this._dragging.dataset.key,i=this._selector.pickValueByPosition(t.x,t.y);if(i!==null&&this._grabbed!==i){let[r,o]=this.drag(i);this._onMove&&r!==null&&o!==null&&this._onMove(e,r,o)}else this._draggingCount<3?this._onEvent&&this._onEvent(e):(this._onPreview&&this._onPreview(this._dragging,null,null),this.setDraggingClass(e,!1));this._dragging=null,this._isGrabbingHead=this._isGrabbingTail=null,this.updateCursor(),t.stopImmediatePropagation()}}setContainerSelector(t){return this._containerSelector=t,this}setEventSelector(t){return this._eventSelector=t,this}setHeadCursor(t){return this._headCursor=t,this}setTailCursor(t){return this._tailCursor=t,this}setUnit(t){return this._unit=t,this}onEvent(t){return this._onEvent=t,this}onMove(t){return this._onMove=t,this}onPreview(t){return this._onPreview=t,this}isDragging(){return this._dragging!==null}getGrabbedDate(){return this._grabbed}pickEvent(t){return this._root.contains(t)&&t.closest(this._containerSelector)?t.closest(this._eventSelector):null}hitHead(t){return!!t.closest(".gc-head")}hitTail(t){return!!t.closest(".gc-tail")}setDraggingClass(t,e){this._root.querySelectorAll(this._eventSelector+'[data-key="'+t+'"]').forEach(i=>{e?i.classList.add("gc-dragging"):i.classList.remove("gc-dragging")})}isAllDayDragging(){return this._dragging?.dataset.allDay==="true"}isNumber(t){return/^\d+$/.test(t)}drag(t){return this.isNumber(t)?this.dragNumber(t):this.dragDateTime(t)}dragDateTime(t){let e=a.diffInMilliseconds(this._grabbed,t),i=a.toDateTimeString(Date.parse(this._draggingStart)+(this._isGrabbingHead?e:0)),r=a.toDateTimeString(Date.parse(this._draggingEnd)+(this._isGrabbingTail?e:0));return i=i.substring(0,this._grabbed.length),r=r.substring(0,this._grabbed.length),i>r&&(this._isGrabbingHead&&(i=r),this._isGrabbingTail&&(r=i)),[i,r]}dragNumber(t){let e=parseInt(t)-parseInt(this._grabbed),i=parseInt(this._draggingStart)+(this._isGrabbingHead?e:0),r=parseInt(this._draggingEnd)+(this._isGrabbingTail?e:0);return this.isAllDayDragging()&&(i=Math.floor(i/this._unit)*this._unit,r=Math.floor(r/this._unit)*this._unit),i>r&&(this._isGrabbingHead&&(i=r),this._isGrabbingTail&&(r=i)),[i,r]}updateCursor(){this._root.classList.remove(this._headCursor,this._tailCursor),this._isGrabbingHead&&this._isGrabbingTail?this._root.classList.add("gc-cursor-move"):this._isGrabbingHead?this._root.classList.add(this._headCursor):this._isGrabbingTail&&this._root.classList.add(this._tailCursor)}updatePreview(t){if(this._draggingValue!==t){let[e,i]=this.drag(t);this._onPreview&&this._onPreview(this._dragging,e,i),this._draggingValue=t}}isGrabbingHead(){return this._isGrabbingHead}isGrabbingTail(){return this._isGrabbingTail}isGrabbingBody(){return this._isGrabbingHead&&this._isGrabbingTail}};var p=class{constructor(t,e){s(this,"_root");s(this,"_containerSelector",null);s(this,"_dateSelector",null);s(this,"_resizer",null);s(this,"_hover",null);s(this,"_onEvent",null);s(this,"_onMove",null);this._root=t,this._dateSelector=e,this.init()}init(){this._resizer=new h(this._root,this._dateSelector).setEventSelector(".gc-all-day-event-container").setHeadCursor("gc-cursor-w-resize").setTailCursor("gc-cursor-e-resize").onEvent(t=>{this._onEvent&&this._onEvent(t)}).onMove((t,e,i)=>{this._onMove&&this._onMove(t,e,i)}).onPreview((t,e,i)=>{this.removePreview(),e&&i&&this.createPreview(t,e,i)})}registerCallbacks(){this._resizer.registerCallbacks(),this._root.addEventListener("mouseover",this._onMouseOver.bind(this))}_onMouseOver(t){if(this._resizer.isDragging())return;let e=this.pickAllDayEvent(t.target,!0),i=e?e.dataset.key:null;i!==this._hover&&(this.setHoverAllDayEvent(this._hover,!1),this.setHoverAllDayEvent(this._hover=i,!0))}setContainerSelector(t){return this._resizer.setContainerSelector(t),this._containerSelector=t,this}onEvent(t){return this._onEvent=t,this}onMove(t){return this._onMove=t,this}pickAllDayEvent(t,e=!1){return this._root.contains(t)&&t.closest(this._containerSelector+(e?"":", .gc-day-grid-popup"))?t.closest(".gc-all-day-event-container"):null}setHoverAllDayEvent(t,e){t&&this._root.querySelectorAll('.gc-all-day-event-container[data-key="'+t+'"]').forEach(i=>{e?i.classList.add("gc-hover"):i.classList.remove("gc-hover")})}createPreview(t,e,i){Array.from(this._root.querySelectorAll(".gc-week, .gc-all-day-section")).forEach(r=>{let[o,l]=this.getWeekPeriod(r);if(o&&l){let[c,g]=a.overlapPeriod(e,i,o,l);if(c&&g){let v=r.querySelector('.gc-day[data-date="'+c+'"] .gc-all-day-event-preview');o<=this._resizer.getGrabbedDate()&&this._resizer.getGrabbedDate()<=l&&this.addEmptyAllDayEvents(v,this.getIndexInParent(t));let m=t.cloneNode(!0),b=a.diffDays(c,g)+1;this.adjustPreview(m,b,c===e,g===i),v.appendChild(m)}}})}getWeekPeriod(t){let e=t.querySelectorAll(".gc-day:not(.gc-disabled)");return e.length>0?[e[0].dataset.date,e[e.length-1].dataset.date]:[null,null]}adjustPreview(t,e,i,r){t.classList.remove("gc-dragging"),t.classList.remove("gc-start"),t.classList.remove("gc-end");for(let o=1;o<=7;o++)t.classList.remove("gc-"+o+"days");return t.classList.add("gc-"+e+"days"),i&&t.classList.add("gc-start"),r&&t.classList.add("gc-end"),t}getIndexInParent(t){return Array.from(t.parentNode.children).indexOf(t)}addEmptyAllDayEvents(t,e){for(let i=0;i<e;i++){let r=document.createElement("div");r.classList.add("gc-all-day-event-container"),t.appendChild(r)}}removePreview(){Array.from(this._root.querySelectorAll(".gc-all-day-event-preview")).forEach(t=>t.parentNode.replaceChild(t.cloneNode(!1),t))}};var _=class{constructor(t,e){s(this,"_root");s(this,"_containerSelector",null);s(this,"_timeSelector",null);s(this,"_resizer",null);s(this,"_hover",null);s(this,"_onEvent");s(this,"_onMove");this._root=t,this._timeSelector=e,this.init()}init(){this._resizer=new h(this._root,this._timeSelector).setEventSelector(".gc-timed-event-container").setHeadCursor("gc-cursor-n-resize").setTailCursor("gc-cursor-s-resize").onEvent(t=>{this._onEvent&&this._onEvent(t)}).onMove((t,e,i)=>{this._onMove&&this._onMove(t,e,i)}).onPreview((t,e,i)=>{this.removePreview(),e&&i&&this.createPreview(t,e,i)})}onEvent(t){return this._onEvent=t,this}onMove(t){return this._onMove=t,this}registerCallbacks(){this._resizer.registerCallbacks(),this._root.addEventListener("mouseover",this._onMouseOver.bind(this))}setContainerSelector(t){return this._resizer.setContainerSelector(t),this._containerSelector=t,this}_onMouseOver(t){if(this._resizer.isDragging())return;let e=this.pickEvent(t.target),i=e?e.dataset.key:null;i!==this._hover&&(this.setHoverAllDayEvent(this._hover,!1),this.setHoverAllDayEvent(this._hover=i,!0))}pickEvent(t){return this._root.contains(t)&&t.closest(this._containerSelector)?t.closest(".gc-timed-event-container"):null}setHoverAllDayEvent(t,e){t&&this._root.querySelectorAll('.gc-timed-event-container[data-key="'+t+'"]').forEach(i=>{e?i.classList.add("gc-hover"):i.classList.remove("gc-hover")})}createPreview(t,e,i){let r=t.dataset.resourceId;Array.from(this._root.querySelectorAll(this._containerSelector+' .gc-day[data-resource-id="'+r+'"]')).forEach(o=>{let[l,c]=this.getPeriodOfDay(o);if(l&&c){let[g,v]=a.overlapPeriod(e,i,l,c);if(g&&v){let[m,b]=this.getSlotPosition(o,g,v),E=t.cloneNode(!0);this.adjustPreview(E,b),m.querySelector(".gc-timed-event-preview").appendChild(E)}}})}getSlotPosition(t,e,i){let[r,o]=this.getPeriodOfDay(t),l=a.timeSlot(r,o,t.dataset.interval,e),c=a.timeSlot(r,o,t.dataset.interval,i);return[t.querySelectorAll(".gc-slot")[l],c-l+1]}getPeriodOfDay(t){return[t.dataset.start,t.dataset.end]}adjustPreview(t,e){return t.classList.remove("gc-dragging"),t.style.setProperty("--gc-span","calc("+e*100+"% + "+(e-1)+"px)"),t}removePreview(){Array.from(this._root.querySelectorAll(".gc-timed-event-preview")).forEach(t=>t.parentNode.replaceChild(t.cloneNode(!1),t))}};function y(){return{dateSelector:d,timeSelector:d,allDayEvent:p,timedEvent:_,init(){this.dateSelector=new d(this.$el).setContainerSelector(".gc-all-day-section").setElementSelector(".gc-day").setPropertyName("date").onSelect((n,t,e)=>{this.$wire.onDate(n+" 00:00:00",t+" 23:59:59",e)}),this.timeSelector=new d(this.$el).setContainerSelector(".gc-timed-section").setElementSelector(".gc-slot").setPropertyName("time").onSelect((n,t,e)=>{this.$wire.onDate(n,this.timeSelector.getElementByValue(t).dataset.timeEnd,e)}),this.allDayEvent=new p(this.$el,this.dateSelector).setContainerSelector(".gc-all-day-section").onEvent(n=>{this.$wire.onEvent(n)}).onMove((n,t,e)=>{this.$wire.onMove(n,t,e)}),this.timedEvent=new _(this.$el,this.timeSelector).setContainerSelector(".gc-timed-section").onEvent(n=>{this.$wire.onEvent(n)}).onMove((n,t,e)=>{this.$wire.onMove(n,t,e)}),this.allDayEvent.registerCallbacks(),this.timedEvent.registerCallbacks(),this.dateSelector.registerCallbacks(),this.timeSelector.registerCallbacks()}}}export{y as default};
