import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrl: './merchant-order-detail-dialog.css'
})
export class MerchantOrderDetailDialog {
  @Input() visible = false;
  @Input() order: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();
  @Output() statusUpdated = new EventEmitter<{ orderId: string, status: string }>();

  editedNote: string = '';

  statuses: Status[] = [
    { label: '未付款', value: '未付款' },
    { label: '已付款', value: '已付款' },
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
  }

  onSave() {
    if (this.order) {
      this.noteUpdated.emit({ orderId: this.order.ORDER_ID, note: this.editedNote });
      this.statusUpdated.emit({ orderId: this.order.ORDER_ID, status: this.order.STATUS });
      console.log('儲存成功:', this.order.ORDER_ID, this.order.STATUS, this.editedNote);
      this.onHideDialog();
    }
  }
}