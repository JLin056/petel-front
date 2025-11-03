import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core'; // 導入 OnDestroy 和 OnInit
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SharedConfirmDialog } from '../../../pages/shared-confirm-dialog/shared-confirm-dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Auth } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { filter, Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPanel } from '../notification-panel/notification-panel';

@Component({
  selector: 'app-merchant-property-header',
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
    NotificationPanel
  ],
  templateUrl: './merchant-property-header.html',
  styleUrl: './merchant-property-header.css'
})
// 實作 OnInit 和 OnDestroy
export class MerchantPropertyHeader implements OnInit, OnDestroy {
    /** 是否登入（service 推播） */
    isLoggedIn = false;
    /** confirmVisible */
    confirmVisible = false;
    /** 是否登出中 */
    isLoggedOut = false;
    /**第一次登入檢查 */
    isFirstCheck = true;
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
    }

    /**
     * 元件初始化時執行一次登入狀態檢查
     */
    ngOnInit() {
        this.authService.isLoggedIn$
            .pipe(takeUntil(this.destroy$))
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

        if (this.authService.getAccessToken()) {
            this.onCheckLoginStatus();
        } else {
            this.redirectToMerchantLogin();
        }

        this.router.events
            .pipe(
                filter(e => e instanceof NavigationEnd),
                filter(() => !!this.authService.getAccessToken()),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.onCheckLoginStatus());
    }

    /**
     * 跳出 login
     */
    onClickLogin() {
        this.router.navigate(['/merchants/userPage/login']);
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
                // 登出成功後，AuthService 應會清空 token，並透過 isLoggedIn$ 通知元件狀態更新
                this.router.navigate(['']);
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
     * 確認登入狀態
     */
    onCheckLoginStatus() {
        this.authService.onCheckLoginStatus().subscribe({
            next: (res) => {
                const valid = !!res?.TRANRS.valid;
                if (!valid) {
                    this.redirectToMerchantLogin();
                }
            },
            error: () => {
                this.redirectToMerchantLogin();
            }
        });
    }

    private redirectToMerchantLogin() {
        this.toast.add({
            severity: 'warn',
            summary: '未登入',
            detail: '請先登入後再進入商家頁面'
        });
        this.router.navigate(['/merchants/userPage/login']);
    }

    onClickHome() {
        this.router.navigate(['/merchants/property/homepage']);
    }

    onClickProperty(){
        this.router.navigate(['/merchants/property/info']);
    }

    onClickReview() {
        this.router.navigate(['/merchants/property/reviewList']);
    }

    onClickBooking() {
        this.router.navigate(['/merchants/property/bookings'])
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
                    console.log('商家旅館頁未讀通知數量:', res.TRANRS.unread_count);
                }
            },
            error: (error) => {
                console.error('取得未讀通知數量失敗:', error);
            }
        });
    }

    /**
     * 建立 SSE 即時推播連線
     */
    private setupSSEConnection() {
        console.log('商家旅館頁設定 SSE 即時推播連線');

        // 建立連線，並傳入收到通知時的回調
        this.notificationService.connectSSE((notification) => {
            console.log('商家旅館頁 Header 收到新通知:', notification);

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
            console.log('瀏覽器不支援通知');
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
