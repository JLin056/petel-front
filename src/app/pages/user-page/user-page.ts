import { BookService } from './../../core/services/book-service';
import { Review001Tranrq } from './../../core/interfaces/REVIEW001Req.interface';
import { Tranrs } from './../../core/interfaces/USER004Res.interface';
import { User002Tranrq } from './../../core/interfaces/USER002Req.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { REVIEW001Req } from '../../core/interfaces/REVIEW001Req.interface';
import { ReviewService } from '../../core/services/review.service';
import { AddReviewDialog } from '../add-review-dialog/add-review-dialog';
import { UserOrderDetailDialog } from '../user-order-detail-dialog/user-order-detail-dialog';
import { Rating } from 'primeng/rating';

@Component({
    selector: 'app-user-page',
    imports: [CommonModule, FormsModule, AvatarModule, UpdateUserDialog, ToastModule, ButtonModule, SharedConfirmDialog, TagModule, SelectModule, AddReviewDialog, UserOrderDetailDialog, Rating],
    templateUrl: './user-page.html',
    styleUrl: './user-page.css'
})
export class UserPage implements OnInit{
    /** 編輯 dialog */
    editVisible = false;
    /** 取消訂單 dialog */
    deleteOrderVisible = false;
    /** 載入中 */
    loading = false;
    /** 載入訂單中 */
    isLoadingBookings = false;
    /** 訂單錯誤 */
    bookingsError = '';
    /** 現在的 訂單編號 */
    currentOrderId: string | null = null;
    /** 訂單 */
    orders: Order[] = [];
    /** 用戶 */
    user: Tranrs | null = null;
    /** 評論 dialog */
    reviewVisible = false;
    selectedOrderForReview: { orderId: string; propertyName: string; checkIn?: string; checkOut?: string } | null = null;
    /** 取消訂單 編號 */
    cancelingOrderId?: string;
    /** 詳細訂單 dialog */
    orderDetailVisible = false;
    /** 狀態 */
    selectedStatus: string = '';

    /**
     * 注入
     * @param toast
     * @param userService
     * @param reviewService
     * @param bookService
     */
    constructor(
        private toast: MessageService,
        private userService: UserService,
        private reviewService: ReviewService,
        private bookService: BookService
    ) {}

    /**
     * 訂單狀態
     * @memberof UserPage
     */
    readonly statusOptions = [
        { label: '全部',  value: '' },
        { label: '已付款', value: '已付款' },
        { label: '未付款', value: '未付款' },
        { label: '已完成', value: '已完成' },
        { label: '已取消', value: '已取消' },
    ];

    /**
     * 取消訂單判斷狀態
     * @private
     * @memberof UserPage
     */
    private readonly cancellableStatuses = new Set(['已付款', '未付款']);

    /**
     * 載入用戶資訊
     * @returns
     */
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

    /**
     * 重整訂單
     */
    reloadOrders() {
        this.onGetBooking();
    }

    /**
     * 打開編輯 dialog
     */
    openEdit() {
        this.editVisible = true;
    }

    /**
     * 修改會員
     * @param updated
     * @returns
     */
    onEditSaved(updated: { name: string; phone: string; avatarMediaId?: string }) {
        if (this.loading) return;

        const tranrq: User002Tranrq = {};

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

    /**
     * 價格格式
     * @param n
     * @returns
     */
    price(n: number | null | undefined): string {
        if (n == null) return '-';
        return n.toLocaleString('zh-TW');
    }

    /**
     * 取得訂單歷史紀錄
     */
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

    /**
     * 訂單狀態
     * @param status
     * @returns
     */
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

    /**
     * 取消訂單按鈕 disable
     * @param status
     * @returns
     */
    isCancelDisabled(status?: string): boolean {
        return !status || !this.cancellableStatuses.has(status);
    }

    /**
     * 顯示取消訂單確認
     * @param event
     * @param orderId
     */
    confirmDeleteOrder(event: Event, orderId: string) {
        this.currentOrderId = orderId;
        this.deleteOrderVisible = true;
    }

    /**
     * 確認取消訂單
     * @returns
     */
    onDeleteOrderConfirmed() {
        if (!this.currentOrderId) {
            this.deleteOrderVisible = false;
            return;
        }

        const target = this.orders.find(o => o.orderId === this.currentOrderId);
        if (!target) {
            this.toast.add({ severity: 'warn', summary: '找不到訂單', detail: '請重新整理後再試' });
            this.deleteOrderVisible = false;
            return;
        }
        if (this.isCancelDisabled(target.status)) {
            this.toast.add({ severity: 'info', summary: '不可取消', detail: `狀態「${target.status}」不可取消` });
            this.deleteOrderVisible = false;
            return;
        }

        this.cancelingOrderId = this.currentOrderId;

        const payload = {
            MWHEADER: {
                MSGID: 'BOOK-004'
            },
            TRANRQ: {
                order_id: this.currentOrderId
            }
        }

        this.bookService.onCancelBookingApi(payload)
            .pipe(finalize(() => {
                this.cancelingOrderId = undefined;
                this.deleteOrderVisible = false;
            }))
            .subscribe({
                next: (res) => {
                    if (res.MWHEADER.RETURNCODE === '0000') {

                        target.status = '已取消';

                        this.toast.add({
                            severity: 'success',
                            summary: '成功',
                            detail: '訂單已取消'
                        });
                    } else {
                        this.toast.add({
                            severity: 'warn',
                            summary: '取消失敗',
                            detail: res.MWHEADER.RETURNDESC || '請稍後再試'
                        });
                    }
                },
                error: () => {
                    this.toast.add({
                    severity: 'error',
                    summary: '系統錯誤',
                    detail: '取消失敗，請稍後再試'
                    });
                }
            });
    }

    /**
     * 打開評論 dialog
     * @param o
     */
    openReview(o: any) {
        this.selectedOrderForReview = {
            orderId: o.orderId,
            propertyName: o.propertyName,
            checkIn: o.checkIn,
            checkOut: o.checkOut
        };
        this.reviewVisible = true;
    }

    /**
     * 新增評論
     * @param form
     */
    onReviewSaved(form: Review001Tranrq) {
        const req: REVIEW001Req = {
            MWHEADER: { MSGID: 'REVIEW-001' },
            TRANRQ: form
        };

        this.reviewService.onAddReviceApi(req).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.toast.add({
                        severity: 'success',
                        summary: '評論成功',
                        detail: `謝謝你的評論～`
                    });

                    const target = this.orders?.find((x: any) => x.orderId === form.orderId);
                    if (target) target.hasReview = true;
                    this.reviewVisible = false;
                    this.selectedOrderForReview = null;
                } else {
                this.toast.add({
                    severity: 'warn',
                    summary: '評論失敗',
                    detail: res.MWHEADER.RETURNDESC
                });
                }
            },
            error: (err) => {
                this.toast.add({ severity: 'error', summary: '伺服器錯誤', detail: '請稍後再試' });
            }
        });
    }

    /**
     * 打開訂單詳細資訊
     * @param orderId
     */
    openOrderDetail(orderId: string) {
        this.currentOrderId = orderId;
        this.orderDetailVisible = true;
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.loadUser();
        this.onGetBooking();
    }
}
