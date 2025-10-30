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
import { Order } from '../../core/interfaces/USER006Res.interface';
import { USER006Req } from '../../core/interfaces/USER006Req.interface';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'app-user-page',
  imports: [CommonModule, FormsModule, AvatarModule, UpdateUserDialog, ToastModule, ButtonModule, SharedConfirmDialog, TagModule, SelectModule],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
  providers: [ConfirmationService, MessageService]
})
export class UserPage {
    editVisible = false;
    deleteUserVisible = false;
    deleteOrderVisible = false;

    loading = false;

    isLoadingBookings = false;
    bookingsError = '';

    currentOrderId?: string;
    orders: Order[] = [];

    user: Tranrs | null = null;

    readonly statusOptions = [
        { label: '全部',  value: '' },
        { label: '已付款', value: '已付款' },
        { label: '未付款', value: '未付款' },
        { label: '已完成', value: '已完成' },
        { label: '已取消', value: '已取消' },
    ];

    selectedStatus: string = '';

    constructor(
        private toast: MessageService,
        private userService: UserService
    ) {}

    private readonly cancellableStatuses = new Set(['已付款', '未付款']);

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

    reloadOrders() {
        this.onGetBooking();
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
                ...(this.selectedStatus ? { status: this.selectedStatus } : {})
            }
        }

        this.userService.onGetBookingInfoApi(payload).subscribe({
            next: (res) => {
                this.isLoadingBookings = false;

                if (res.MWHEADER.RETURNCODE === '0000') {
                    const list = res?.TRANRS?.orders;
                    this.orders = Array.isArray(list) ? list : [];
                } else if (res.MWHEADER.RETURNDESC === '查無資料') {
                    this.orders = [];
                    this.bookingsError = '';
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

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
        case '已付款':
            return 'success';
        case '未付款':
            return 'warn';
        case '已完成':
            return 'info';
        case '已取消':
            return 'danger';
        default:
            return 'secondary';
        }
    }



    // 取消訂單按鈕 disable
    isCancelDisabled(status?: string): boolean {
        return !status || !this.cancellableStatuses.has(status);
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
        this.onGetBooking();
    }
}
