import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SharedConfirmDialog } from '../../../pages/shared-confirm-dialog/shared-confirm-dialog';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Auth } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPanel } from '../notification-panel/notification-panel';

@Component({
  selector: 'app-merchant-userpage-header',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    SharedConfirmDialog,
    NotificationPanel],
  templateUrl: './merchant-userpage-header.html',
  styleUrl: './merchant-userpage-header.css'
})
export class MerchantUserpageHeader implements OnInit, OnDestroy {
    /** 是否登入（service 推播） */
    isLoggedIn = false;
    /** confirmVisible */
    confirmVisible = false;
    /** 是否登出中 */
    isLoggedOut = false;
    /** 未讀通知數量 */
    unreadCount = 0;
    /** 通知面板是否顯示 */
    notificationPanelVisible = false;

    private destroy$ = new Subject<void>();

    /**
     * 注入
     * @param router
     * @param authService
     * @param toast
     * @param notificationService
     */
    constructor(
        private router: Router,
        private authService: Auth,
        private toast: MessageService,
        private notificationService: NotificationService
    ) {
        // 訂閱 service 的登入狀態，保持元件狀態與 Auth service 同步
        this.authService.isLoggedIn$
        .pipe(
            takeUntil(this.destroy$),
            distinctUntilChanged()  // ✅ 只在值真正改變時才觸發
        )
        .subscribe(v => {
            this.isLoggedIn = v;
            // 當登入狀態改變時，更新未讀數量和 SSE 連線
            if (v) {
                this.fetchUnreadCount();
                this.setupSSEConnection();
            } else {
                this.unreadCount = 0;
                this.notificationService.disconnectSSE();
            }
        });

        // 訂閱未讀通知數量
        this.notificationService.unreadCount$
            .pipe(takeUntil(this.destroy$))
            .subscribe(count => this.unreadCount = count);
    }

    /**
     * 元件初始化時訂閱登入狀態
     */
    ngOnInit() {
        this.authService.isLoggedIn$
            .pipe(takeUntil(this.destroy$))
            .subscribe(v => this.isLoggedIn = v);
    }

    /**
     * 跳出 login
     */
    onClickLogin() {
        this.router.navigate(['merchants/userPage/login']);
    }

    /**
     * 登出
     */
    onLogout() {
        if (this.isLoggedOut) return; // 防止重複點擊
        this.isLoggedOut = true;

        this.authService.onLogoutApi().subscribe({
            next: () => {
                this.confirmVisible = false;
                this.toast.add({
                    severity: 'success',
                    summary: '登出成功',
                    detail: '期待您再次光臨！'
                });
                this.router.navigate(['merchants/userPage/login']);
                this.isLoggedOut = false;
            },
            error: () => {
                this.confirmVisible = false;
                this.authService.clearAccessToken();
                this.toast.add({
                    severity: 'error',
                    summary: '登出失敗',
                    detail: '請稍後再試'
                });
                this.isLoggedOut = false;
            }
        });
    }


    /**
     * 前往聊天頁
     * @returns
     */
    onClickChat() {
        if (!this.isLoggedIn) {
        this.toast.add({
            severity: 'warn',
            summary: '尚未登入',
            detail: '請先登入後再使用聊天室功能'
        });
        this.router.navigate(['merchants/userPage/login'], { queryParams: { redirect: 'merchants/userPage/chat' } });
        return;
        }
        this.router.navigate(['merchants/userPage/chat']);
    }

    /**
     * 前往個人資料頁
     * @returns
     */
    onClickProfile() {
        if (!this.isLoggedIn) {
            this.toast.add({
                severity: 'warn',
                summary: '尚未登入',
                detail: '請先登入後再看會員資訊'
            });
            this.router.navigate(['merchants/userPage/login'], { queryParams: { redirect: '/merchants/userPage' } });
            return;
        }
        this.router.navigate(['/merchants/userPage']);
    }

    /**
     * 點擊通知鈴鐺
     */
    onClickNotification() {
        if (!this.isLoggedIn) {
            this.toast.add({
                severity: 'warn',
                summary: '尚未登入',
                detail: '請先登入後查看通知'
            });
            this.router.navigate(['/merchants/userPage/login']);
            return;
        }
        // 顯示通知面板
        this.notificationPanelVisible = true;
    }

    /**
     * 取得未讀通知數量
     */
    private fetchUnreadCount() {
        this.notificationService.getUnreadCount().subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                }
            },
            error: () => {
            }
        });
    }

    /**
     * 建立 SSE 即時推播連線
     *
     * 注意：Token 刷新時的重連已由 NotificationService 自動處理，
     * 此方法只需在用戶首次登入時調用一次即可。
     */
    private setupSSEConnection() {
        // 建立連線，並傳入收到通知時的回調
        this.notificationService.connectSSE((notification) => {

            // 顯示瀏覽器通知
            this.showBrowserNotification(notification);

            // 顯示 Toast 提示
            this.toast.add({
                severity: 'info',
                summary: notification.title,
                detail: notification.message,
                life: 5000
            });
        });
    }

    /**
     * 顯示瀏覽器通知
     */
    private showBrowserNotification(notification: any) {
        // 檢查瀏覽器是否支援通知
        if (!('Notification' in window)) {
            return;
        }

        // 檢查通知權限
        if (Notification.permission === 'granted') {
            // 已授權，顯示通知
            this.createBrowserNotification(notification);
        } else if (Notification.permission !== 'denied') {
            // 請求權限
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.createBrowserNotification(notification);
                }
            });
        }
    }

    /**
     * 建立瀏覽器通知
     */
    private createBrowserNotification(notification: any) {
        const notif = new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/logo.png',
            badge: '/assets/badge.png',
            tag: notification.id,
            requireInteraction: false
        });

        // 點擊通知時開啟通知面板
        notif.onclick = () => {
            window.focus();
            this.notificationPanelVisible = true;
            notif.close();
        };
    }

    /**
     * 元件銷毀時取消訂閱
     */
    ngOnDestroy(): void {
        // 關閉 SSE 連線
        this.notificationService.disconnectSSE();

        this.destroy$.next();
        this.destroy$.complete();
    }
}
