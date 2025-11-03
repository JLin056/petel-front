import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { USER007Res, USER007Tranrs } from '../../core/interfaces/USER007Res.interface';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';


@Component({
  selector: 'app-user-order-detail-dialog',
  imports: [CommonModule, DialogModule, TableModule, TagModule, ButtonModule, DividerModule],
  templateUrl: './user-order-detail-dialog.html',
  styleUrl: './user-order-detail-dialog.css'
})
export class UserOrderDetailDialog implements OnChanges {
    /** 是否顯示 dialog */
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    /** 訂單編號 */
    @Input() orderId: string | null = null;
    /** 載入中 */
    loading = false;
    /** error */
    error: string | null = null;
    /** 詳細資料 */
    data: USER007Tranrs | null = null;
    /** 房間摘要 */
    aggregated: RoomSummary[] = [];
    roomItems: RoomItem[] = [];

    /**
     * 注入
     * @param userService
     */
    constructor(
        private userService: UserService
    ) {}

    /**
     * 建立 Room Items
     */
    private buildRoomItems() {
        const nights = Number(this.data?.nights) || 1;
        this.roomItems = this.aggregated.map(it => ({
            roomId: it.roomId,
            roomName: it.roomName,
            roomPrice: it.price,
            roomQuantity: it.quantity,
            roomTotal: it.price * it.quantity * nights,
            expanded: false // 預設不展開
        }));
    }

    /**
     * 取得訂單詳細資訊
     * @returns
     */
    fetch() {
        if (!this.orderId) return;
        this.loading = true;
        this.error = null;
        this.data = null;
        this.aggregated = [];
        this.roomItems = [];

        const payload = {
            MWHEADER: {
                MSGID: 'USER-007'
            },
            TRANRQ: {
                orderId: this.orderId
            }
        }

        this.userService.onGetBookingDetailApi(payload).subscribe({
            next: (res: USER007Res) => {
                if (res?.MWHEADER?.RETURNCODE !== '0000') {
                    this.error = res?.MWHEADER?.RETURNDESC ?? '查詢失敗';
                    return;
                }

                this.data = res.TRANRS;
                const items = res.TRANRS.items || [];

                const map = new Map<string, RoomSummary>();

                for (const it of items) {
                    const perNightQty = Number(it.quantity);
                    const tonightTotal = Number(it.price);
                    const unitPrice = tonightTotal / perNightQty;

                    const key = `${it.roomId}_${it.price}`;

                    if (!map.has(key)) {
                        map.set(key, {
                            roomId: it.roomId,
                            roomName: it.roomName,
                            price: unitPrice,
                            quantity: perNightQty
                        });
                    }
                }

                this.aggregated = Array.from(map.values())
                    .sort((a, b) => a.roomName.localeCompare(b.roomName));

                this.buildRoomItems();
            },
            error: () => {
                this.error = '系統忙線，請稍後再試';
            },
            complete: () => (this.loading = false)
        });
    }

    /**
     * 關閉
     */
    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    /**
     * 價格格式
     * @param n
     * @returns
     */
    price(n: number | null | undefined): string {
        if (n == null) return '-';
        return n.toLocaleString('zh-TW');
    }

    /**
     * 訂單狀態
     */
    statusSeverity(s: string) {
        switch (s) {
            case '已完成': return 'success';
            case '已取消': return 'danger';
            case '未付款': return 'warn';
            case '已付款': return 'info';
            default: return 'secondary';
        }
    }

    /**
     * 點擊縮合框
     * @param i
     */
    toggleRoom(i: number) {
        this.roomItems[i].expanded = !this.roomItems[i].expanded;
    }

    /**
     * 追蹤 唯一值
     * @param _
     * @param r
     * @returns
     */
    trackByRoom = (_: number, r: RoomItem) => `${r.roomId}_${r.roomPrice}`;


    /**
     * 偵測變化
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['visible'] || changes['orderId']) && this.visible && this.orderId) {
            this.fetch();
        }
    }
}
