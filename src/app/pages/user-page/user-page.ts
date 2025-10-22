import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { UpdateUserDialog } from '../update-user-dialog/update-user-dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { User } from '../../core/services/user.service';
import { Order } from '../../core/interfaces/USER006Res.interface';
import { USER006Req } from '../../core/interfaces/USER006Req.interface';

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

    isLoading = false;
    loadError = '';

    isLoadingBookings = false;
    bookingsError = '';

    currentOrderId?: string;

    // 要操作的 訂單ID
    orders: Order[] = [];

    constructor(
        private confirm: ConfirmationService,
        private toast: MessageService,
        private userService: User
    ) {}

    user = {
        accountId: '',
        name: '',
        email: '',
        phone: '',
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

    onGetUser() {
        this.isLoading = true;
        this.loadError = '';
        this.userService.onGetUserInfoApi().subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res?.MWHEADER?.RETURNCODE === '0000' && res?.TRANRS) {
                    const u = res.TRANRS;
                    this.user = {
                        accountId: u.accountId ?? '',
                        name: u.name ?? '',
                        email: u.email ?? '',
                        phone: u.phone ?? '',
                        avatarUrl: 'img/avatar.png'
                    };
                } else {
                    this.loadError = res?.MWHEADER?.RETURNDESC || '讀取會員資料失敗';
                    this.toast.add({ severity: 'warn', summary: '讀取失敗', detail: this.loadError });
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.loadError = '系統錯誤，請稍後再試';
                this.toast.add({ severity: 'error', summary: '系統錯誤', detail: this.loadError });
            }
        });
    }

    price(n: number | null | undefined): string {
        if (n == null) return '-';
        return n.toLocaleString('zh-TW');
    }

    onGetBooking() {
        this.isLoadingBookings = true;
        this.bookingsError = '';

        const payload : USER006Req = {
            MWHEADER: {
                MSGID: 'USER-006'
            },
            TRANRQ : {
            }
        }

        this.userService.onGetBookingInfoApi(payload).subscribe({
            next: (res) => {
                this.isLoadingBookings = false;

                if (res.MWHEADER.RETURNCODE === '0000') {
                    const list = res?.TRANRS?.orders;
                    this.orders = Array.isArray(list) ? list : [];
                } else {
                    this.orders = [];
                    this.bookingsError = res?.MWHEADER?.RETURNDESC || '讀取歷史訂單失敗';
                    this.toast.add({ severity: 'warn', summary: '讀取失敗', detail: this.bookingsError });
                }
            },
            error: () => {
                this.isLoadingBookings = false;
                this.orders = [];
                this.bookingsError = '系統錯誤，請稍後再試';
                this.toast.add({ severity:'error', summary: '系統錯誤', detail: this.bookingsError })
            }
        });
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

    ngOnInit(): void {
        this.onGetUser();
        this.onGetBooking()
    }
}
