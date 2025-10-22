import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Order } from '../../core/interfaces/ADMIN003Res.interface';

@Component({
  selector: 'app-order-detail-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './order-detail-dialog.html',
  styleUrl: './order-detail-dialog.css'
})
export class OrderDetailDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() order: Order | null = null;
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();

  // 備註編輯狀態
  isEditingNote = false;
  editedNote = '';

  ngOnChanges(): void {
    if (this.order) {
      this.editedNote = this.order.NOTE || '';
      this.isEditingNote = false;
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
      this.noteUpdated.emit({
        orderId: this.order.ORDER_ID,
        note: this.editedNote
      });
      this.isEditingNote = false;
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
}
