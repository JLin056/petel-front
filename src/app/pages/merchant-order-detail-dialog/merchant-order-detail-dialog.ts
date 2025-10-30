import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { Button, ButtonModule } from "primeng/button";
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  imports: [Button, CommonModule, Dialog, ButtonModule, InputTextModule, FormsModule, SelectModule, TagModule],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrl: './merchant-order-detail-dialog.css'
})
export class MerchantOrderDetailDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() order: Order | null = null;
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();
  @Output() statusUpdated = new EventEmitter<{ orderId: string, status: string }>();

  /** isEditingNote */
  isEditingNote = false;
  /** editedNote */
  editedNote = '';
  /** 狀態選項 */
  statuses: Status[] = [
    { label: '待付款', value: '待付款' },
    { label: '已確認', value: '已確認' },
    { label: '已完成', value: '已完成' },
    { label: '已取消', value: '已取消' }
  ];

  ngOnChanges(): void {
    if (this.order) {
      this.editedNote = this.order.NOTE || '';
    }
  }

  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.isEditingNote = false;
  }

  onEditNote() {
    this.isEditingNote = true;
  }

  onCancelEdit() {
    this.editedNote = this.order?.NOTE || '';
    this.isEditingNote = false;
  }

  onSaveNote() {
    if (this.order) {
      // 更新本地訂單的備註
      this.order.NOTE = this.editedNote;

      // 發送事件給父元件
      this.noteUpdated.emit({
        orderId: this.order.ORDER_ID,
        note: this.editedNote
      });

      this.isEditingNote = false;
      console.log('備註已儲存:', this.editedNote);
    }
  }

  // 導航到會員列表(暫時用 console.log，之後可以串接路由)
  navigateToMember() {
    console.log('導航到會員:', this.order?.USER_NAME);
    // TODO: 實作導航到會員列表並搜尋該會員
  }

  // 導航到旅館列表(暫時用 console.log，之後可以串接路由)
  navigateToHotel() {
    console.log('導航到旅館:', this.order?.PROPERTY_NAME);
    // TODO: 實作導航到旅館列表並搜尋該旅館
  }

  // 取得狀態顏色
  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case '已完成':
        return 'success';
      case '已確認':
        return 'info';
      case '待付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }

  // 取得狀態樣式類別
  getStatusClass(status: string): string {
    switch (status) {
      case '已完成':
        return 'success';
      case '已確認':
        return 'info';
      case '待付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return 'default';
    }
  }

  // 狀態變更
  onStatusChange(event: any) {
    if (this.order) {
      const newStatus = event.value; // 確保拿到最新選擇
      this.order.STATUS = newStatus;

      console.log('訂單狀態已變更:', this.order.ORDER_ID, '新狀態:', newStatus);
      this.statusUpdated.emit({
        orderId: this.order.ORDER_ID,
        status: newStatus
      });
    }
  }
}
