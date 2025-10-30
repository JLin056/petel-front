import { Tranrs } from './../../core/interfaces/USER004Res.interface';
import { Tranrq } from './../../core/interfaces/USER002Req.interface';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { UpdateUserDialog } from '../update-user-dialog/update-user-dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { USER004Res } from '../../core/interfaces/USER004Res.interface';
import { finalize } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { USER002Req } from '../../core/interfaces/USER002Req.interface';

@Component({
  selector: 'app-user-page',
  imports: [CommonModule, AvatarModule, UpdateUserDialog, ToastModule, ButtonModule, SharedConfirmDialog],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
  providers: [ConfirmationService, MessageService]
})
export class UserPage {
    editVisible = false;
    deleteUserVisible = false;
    deleteOrderVisible = false;

    loading = false;

    // 要操作的 訂單ID
    currentOrderId?: string;

    user: Tranrs | null = null;

    constructor(
        private toast: MessageService,
        private userService: UserService
    ) {}

    loadUser(): void {
        if (this.loading) return;
        this.loading = true;

        this.userService.getUserInfo()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res: USER004Res) => {
                    this.user = res.TRANRS;
                },
                error: () => {
                    this.toast.add({
                        severity: 'error',
                        summary: '頁面讀取失敗',
                        detail: '系統錯誤，請稍後再試'
                    });
                }
            });
    }

    openEdit() {
        this.editVisible = true;
    }
    onEditSaved(updated: { name: string; phone: string; avatarMediaId?: string }) {
        if (this.loading) return;

        const tranrq: Tranrq = {};

        const newName  = updated.name?.trim();
        const newPhone = updated.phone?.trim();

        if (newName && newName !== this.user?.name) {
            tranrq.name = newName;
        }
        if (newPhone && newPhone !== this.user?.phone) {
            tranrq.phone = newPhone;
        }

        if (typeof updated.avatarMediaId === 'string' && updated.avatarMediaId !== this.user?.mediaId) {
            tranrq.mediaId = updated.avatarMediaId;
        }

        if (Object.keys(tranrq).length === 0) {
            this.toast.add({ severity: 'info', summary: '未變更', detail: '你沒有修改東西啦～' });
            return;
        }

        const payload: USER002Req = {
            MWHEADER: {
                MSGID: 'USER-002'
            },
            TRANRQ: tranrq
        }

        this.loading = true;
        this.userService.onEditUserInfo(payload)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (res) => {
                    this.user = { ...this.user!, ...res.TRANRS };
                    this.toast.add({
                        severity: 'success',
                        summary: '成功',
                        detail: '會員資訊已更新'
                    });
                    this.editVisible = false;
                },
                error: () => {
                    this.toast.add({
                        severity: 'error',
                        summary: '更新失敗',
                        detail: '請稍後再試'
                    })
                }
            });
    }

    showConfirm() {
        this.deleteUserVisible = true;
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

    ngOnInit(): void {
        this.loadUser();
    }
}
