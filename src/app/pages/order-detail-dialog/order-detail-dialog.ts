import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Order } from '../../core/interfaces/ADMIN003Res.interface';

@Component({
  selector: 'app-order-detail-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, FormsModule, TagModule],
  templateUrl: './order-detail-dialog.html',
  styleUrl: './order-detail-dialog.css'
})
export class OrderDetailDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() order: Order | null = null;
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();

  constructor(private router: Router) {}

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

  // 導航到會員列表
  navigateToMember() {
    if (this.order?.USER_NAME) {
      this.router.navigate(['/admin/userTable'], {
        queryParams: { search: this.order.USER_NAME }
      });
      this.onHideDialog();
    }
  }

  // 導航到旅館列表
  navigateToHotel() {
    if (this.order?.PROPERTY_NAME) {
      this.router.navigate(['/admin/hotelTable'], {
        queryParams: { search: this.order.PROPERTY_NAME }
      });
      this.onHideDialog();
    }
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
