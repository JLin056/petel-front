import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { BOOK004Req } from '../../core/interfaces/BOOK004Req.interface';
import { MERCH014Tranrq } from '../../core/interfaces/MERCH014Req.interface';
import { BookService } from '../../core/services/book-service';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TagModule, SelectModule, SharedConfirmDialog],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrls: ['./merchant-order-detail-dialog.css'],
  providers: [MessageService]
})
export class MerchantOrderDetailDialog implements OnChanges {
  @Input() visible = false;
  @Input() order: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();
  @Output() statusUpdated = new EventEmitter<{ orderId: string, status: string }>();

  editedNote = '';
  originalStatus = '';
  roomInfo = '';
  roomQuantity = 0;
  // 新增一個變數存暫存狀態
  editedStatus = '';
  cancelConfirmVisible = false;

  statuses: Status[] = [
    { label: '未付款', value: '未付款' },
    { label: '已付款', value: '已付款' },
    { label: '已完成', value: '已完成' },
    { label: '已取消', value: '已取消' }
  ];

  constructor(
    private merchService: MerchService,
    private bookService: BookService,
    private toast: MessageService,
  ) { }

  ngOnChanges(): void {
    if (!this.order) return;
    this.editedNote = this.order.NOTE || '';
    this.originalStatus = this.order.STATUS;
    this.editedStatus = this.order.STATUS; // ← 下拉選單改這個
    this.roomInfo = this.order.ROOM || (this.order as any).room || '未提供房型資訊';
    this.roomQuantity = this.order.QUANTITY || (this.order as any).quantity || 0;
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case '已完成': return 'success';
      case '已付款': return 'info';
      case '未付款': return 'warn';
      case '已取消': return 'danger';
      default: return 'secondary';
    }
  }

  /** 
   * 下拉選單可選狀態
   */
  get selectableStatuses(): Status[] {
    if (!this.order) return this.statuses;
    // 保留已取消讓目前訂單顯示
    return this.statuses.filter(s => s.value !== '已取消' || s.value === this.order!.STATUS);
  }

  /** 
   * 關閉對話框
   */
  onHideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /** 
   * 顯示取消確認
   */
  onCancelClick(): void {
    this.cancelConfirmVisible = true;
  }

  /** 
   * 確認取消訂單
   */
  onCancelConfirm(): void {
    if (!this.order) return;

    const cancelReq: BOOK004Req = {
      MWHEADER: { MSGID: 'BOOK-004' },
      TRANRQ: { order_id: this.order.ORDER_ID }
    };

    this.bookService.onCancelBookingApi(cancelReq).subscribe({
      next: res => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.order!.STATUS = '已取消';
          this.originalStatus = '已取消';
          this.statusUpdated.emit({ orderId: this.order!.ORDER_ID, status: this.order!.STATUS });
          this.toast.add({ severity: 'success', summary: '成功', detail: '訂單已取消' });
          this.cancelConfirmVisible = false;
        } else {
          this.toast.add({ severity: 'error', summary: '取消訂單失敗', detail: res.MWHEADER.RETURNDESC });
          this.cancelConfirmVisible = false;
        }
      },
      error: err => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '取消訂單時發生錯誤，請稍後再試' });
        this.cancelConfirmVisible = false;
      }
    });
  }

  /** 
   * 取消取消
   */
  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
  }

  /** 
   * 更新訂單狀態
   */
  private updateOrderStatus(): void {
    if (!this.order) return;

    const tranrq: MERCH014Tranrq = {
      id: this.order.ORDER_ID,
      status: this.order.STATUS
    };

    this.merchService.updateOrderStatus(tranrq).subscribe({
      next: res => {
        if (!this.order) return;

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.statusUpdated.emit({ orderId: this.order.ORDER_ID, status: this.order.STATUS });
          this.onHideDialog();
          this.toast.add({ severity: 'success', summary: '成功', detail: '狀態更新成功' });
        } else {
          this.toast.add({ severity: 'error', summary: '狀態更新失敗', detail: res.MWHEADER.RETURNDESC });
        }
      },
      error: err => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '狀態更新時發生錯誤，請稍後再試' });
      }
    });
  }

  /** 
   * 更新備註 
   */
  private updateNote(): void {
    if (!this.order) return;

    this.noteUpdated.emit({ orderId: this.order.ORDER_ID, note: this.editedNote });
    this.onHideDialog();
    this.toast.add({ severity: 'success', summary: '成功', detail: '備註已更新' });
  }

  /** 
   * 儲存修改
   */
  onSave(): void {
    if (!this.order) return;

    const statusChanged = this.editedStatus !== this.originalStatus;
    const noteChanged = this.editedNote !== (this.order.NOTE || '');

    if (!statusChanged && !noteChanged) {
      this.toast.add({ severity: 'info', summary: '提醒', detail: '沒有變更' });
      return;
    }

    // 更新狀態
    if (statusChanged) {
      this.order.STATUS = this.editedStatus;
      this.updateOrderStatus();
    }

    // 更新備註
    if (noteChanged) {
      this.updateNote();
    }
  }
}
