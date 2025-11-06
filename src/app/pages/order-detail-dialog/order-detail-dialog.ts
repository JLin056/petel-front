import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Order } from '../../core/interfaces/ADMIN003Res.interface';
import { AdminService } from '../../core/services/admin.service';
import { ADMIN004Req } from '../../core/interfaces/ADMIN004Req.interface';
import { PricePipe } from '../../shared/pipes/price-pipe';

@Component({
  selector: 'app-order-detail-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, FormsModule, TagModule, ToastModule, PricePipe],
  providers: [MessageService],
  templateUrl: './order-detail-dialog.html',
  styleUrl: './order-detail-dialog.css'
})
export class OrderDetailDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() order: Order | null = null;
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();

  constructor(
    private router: Router,
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

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
    if (!this.order) return;

    const requestData: ADMIN004Req = {
      MWHEADER: {
        MSGID: 'ADMIN-004'
      },
      TRANRQ: {
        orderId: this.order.ORDER_ID,
        note: this.editedNote
      }
    };

    this.adminService.updateOrderNote(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          // 更新成功
          this.messageService.add({
            severity: 'success',
            summary: '更新成功',
            detail: '備註已成功更新'
          });

          // 通知父組件更新備註
          this.noteUpdated.emit({
            orderId: this.order!.ORDER_ID,
            note: this.editedNote
          });

          this.isEditingNote = false;
        } else {
          // API 回傳錯誤
          this.messageService.add({
            severity: 'error',
            summary: '更新失敗',
            detail: response.MWHEADER.RETURNDESC
          });
        }
      },
      error: (_error) => {
        this.messageService.add({
          severity: 'error',
          summary: '更新失敗',
          detail: '網路錯誤，請稍後再試'
        });
      }
    });
  }

  // 導航到會員列表
  navigateToMember() {
    if (this.order?.USER_NAME) {
      this.router.navigate(['/admin/userTable'], {
        queryParams: { userName: this.order.USER_NAME }
      });
      this.onHideDialog();
    }
  }

  // 導航到旅館列表
  navigateToHotel() {
    if (this.order?.PROPERTY_NAME) {
      this.router.navigate(['/admin/hotelTable'], {
        queryParams: { propertyName: this.order.PROPERTY_NAME }
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
