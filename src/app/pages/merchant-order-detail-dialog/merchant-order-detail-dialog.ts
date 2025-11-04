import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { MerchService } from '../../core/services/merch-service';
import { MERCH014Tranrq } from '../../core/interfaces/MERCH014Req.interface';
import { BookService } from '../../core/services/book-service';
import { BOOK004Req } from '../../core/interfaces/BOOK004Req.interface';
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { Router } from '@angular/router';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TagModule, SelectModule, SharedConfirmDialog],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrl: './merchant-order-detail-dialog.css'
})
export class MerchantOrderDetailDialog implements OnChanges {
  @Input() visible = false;
  @Input() order: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();
  @Output() statusUpdated = new EventEmitter<{ orderId: string, status: string }>();

  editedNote: string = '';
  originalStatus: string = '';
  roomInfo: string = '';
  roomQuantity: number = 0;
  /** cancelConfirmVisible */
  cancelConfirmVisible: boolean = false;

  statuses: Status[] = [
    { label: '待付款', value: '待付款' },
    { label: '已確認', value: '已確認' },
    { label: '已完成', value: '已完成' },
    { label: '已取消', value: '已取消' }
  ];

  constructor(
    private merchService: MerchService,
    private bookService: BookService,
    private router: Router
  ) { }

  ngOnChanges(): void {
    if (this.order) {
      this.editedNote = this.order.NOTE || '';
      this.originalStatus = this.order.STATUS;
      this.roomInfo = this.order.ROOM || (this.order as any).room || '未提供房型資訊';
      this.roomQuantity = this.order.QUANTITY || (this.order as any).quantity || 0;
      this.order.STATUS = this.statuses.find(s => s.value === this.order!.STATUS)?.value || this.order!.STATUS;
    }
  }

  /**
   * 取得狀態標籤的嚴重程度
   */
  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case '已完成':
        return 'success';
      case '已確認':
      case '已付款':
        return 'info';
      case '待付款':
      case '未付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }

  /**
   * 選擇狀態時過濾已取消
   */
  get selectableStatuses() {
    return this.statuses.filter(s => s.value !== '已取消');
  }

  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /**
   * 點擊取消按鈕
   */
  onCancelClick(): void {
    this.cancelConfirmVisible = true;
  }

  /**
   * 確認取消
   */
  onCancelConfirm(): void {
    if (!this.order) return;

    const cancelReq: BOOK004Req = {
      MWHEADER: { MSGID: 'BOOK-004' },
      TRANRQ: { order_id: this.order.ORDER_ID }
    };

    this.bookService.onCancelBookingApi(cancelReq).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.order!.STATUS = '已取消';
          this.originalStatus = '已取消';
          this.updateOrderStatus();
        } else {
          alert('取消訂單失敗：' + res.MWHEADER.RETURNDESC);
        }
        this.cancelConfirmVisible = false;
      },
      error: (err) => {
        console.error(err);
        alert('取消訂單時發生錯誤，請稍後再試');
        this.cancelConfirmVisible = false;
      }
    });
  }
  /**
   * 取消取消動作
   */
  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
    this.router.navigate(['/merchants/property/orderDetails']);
  }

  /**
 * 更新訂單狀態
 */
  private updateOrderStatus() {
    if (!this.order) return;

    const tranrq: MERCH014Tranrq = {
      id: this.order.ORDER_ID,
      status: this.order.STATUS
    };

    this.merchService.updateOrderStatus(tranrq).subscribe({
      next: (res) => {
        console.log('狀態更新成功:', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.statusUpdated.emit({
            orderId: this.order!.ORDER_ID,
            status: this.order!.STATUS
          });

          this.updateNote();
        } else {
          console.error('狀態更新失敗:', res.MWHEADER);
          alert('狀態更新失敗：' + res.MWHEADER.RETURNDESC);
        }
      },
      error: (err) => {
        console.error('狀態更新失敗:', err);
        alert('狀態更新時發生錯誤，請稍後再試');
      }
    });
  }

  /**
   * 更新備註
   */
  private updateNote() {
    if (!this.order) return;

    this.noteUpdated.emit({
      orderId: this.order.ORDER_ID,
      note: this.editedNote
    });
    console.log('儲存成功');
    this.onHideDialog();
  }

  /**
   * 儲存
   * @returns 
   */
  onSave() {
    if (!this.order) return;

    const statusChanged = this.order.STATUS !== this.originalStatus;

    if (statusChanged && this.order.STATUS === '已取消') {
      console.log('訂單狀態改為已取消，呼叫取消訂單 API');

      const cancelReq: BOOK004Req = {
        MWHEADER: { MSGID: 'BOOK-004' },
        TRANRQ: { order_id: this.order.ORDER_ID }
      };

      this.bookService.onCancelBookingApi(cancelReq).subscribe({
        next: (res) => {
          console.log('取消訂單 API 回應:', res);
          if (res.MWHEADER.RETURNCODE === '0000') {
            console.log('✅ 訂單已成功取消');
            this.updateOrderStatus();
          } else {
            console.error('取消訂單失敗:', res.MWHEADER);
            alert('取消訂單失敗：' + res.MWHEADER.RETURNDESC);

            if (this.order) {
              this.order.STATUS = this.originalStatus;
            }
          }
        },
        error: (err) => {
          console.error('取消訂單 API 錯誤:', err);
          alert('取消訂單時發生錯誤，請稍後再試');

          if (this.order) {
            this.order.STATUS = this.originalStatus;
          }
        }
      });
    } else if (statusChanged) {
      this.updateOrderStatus();
    } else {
      this.updateNote();
    }
  }
}