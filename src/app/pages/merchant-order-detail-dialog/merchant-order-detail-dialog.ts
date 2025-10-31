import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { Order } from '../../core/interfaces/ADMIN003Res.interface';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TagModule],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrl: './merchant-order-detail-dialog.css'
})
export class MerchantOrderDetailDialog {
  @Input() visible = false;
  @Input() order: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();

  editedNote: string = '';

  ngOnChanges(): void {
    if (this.order) {
      this.editedNote = this.order.NOTE || '';
    }
  }

  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onSave() {
    if (this.order) {
      this.noteUpdated.emit({ orderId: this.order.ORDER_ID, note: this.editedNote });
      console.log('儲存備註成功:', this.order.ORDER_ID, this.editedNote);
      this.onHideDialog();
    }
  }

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
}