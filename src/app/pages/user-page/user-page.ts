import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { UpdateUserDialog } from '../update-user-dialog/update-user-dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

@Component({
  selector: 'app-user-page',
  imports: [AvatarModule, UpdateUserDialog, ToastModule, ButtonModule, SharedConfirmDialog],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
  providers: [ConfirmationService, MessageService]
})
export class UserPage {
    editVisible = false;
    deleteUserVisible = false;
    deleteOrderVisible = false;

    // 要操作的 訂單ID
    currentOrderId?: string;

    constructor(private confirm: ConfirmationService,
        private toast: MessageService) {}

    user = {
        accountId: 'A000000010',
        name: '王大明',
        email: 'abcde@gmail.com',
        phone: '0912345678',
        avatarUrl: 'img/avatar.png',
    };

    openEdit() {
        this.editVisible = true;
    }
    onEditSaved(updated: any) {
        this.user = { ...this.user, ...updated };
    }

    showConfirm() {
        this.deleteUserVisible = true;
    }

    // 確認刪除會員
    onDeleteUserConfirmed() {
        // 執行刪除會員的邏輯
        console.log('刪除會員');
        // 呼叫你的 service 來刪除會員
        // this.userService.deleteUser(this.user.id).subscribe(...);

        this.deleteUserVisible = false;

        // 顯示成功訊息
        this.toast.add({
            severity: 'success',
            summary: '成功',
            detail: '會員已刪除'
        });
    }

    // 顯示取消訂單確認
    confirmDeleteOrder(event: Event, orderId?: string) {
        this.currentOrderId = orderId;
        this.deleteOrderVisible = true;
    }

    // 確認取消訂單
    onDeleteOrderConfirmed() {
        // 執行取消訂單的邏輯
        console.log('取消訂單', this.currentOrderId);
        // 呼叫你的 service 來取消訂單
        // this.orderService.cancelOrder(this.currentOrderId).subscribe(...);

        this.deleteOrderVisible = false;

        // 顯示成功訊息
        this.toast.add({
            severity: 'success',
            summary: '成功',
            detail: '訂單已取消'
        });
    }
}
