import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth.service';
import { SharedConfirmDialog } from '../../../pages/shared-confirm-dialog/shared-confirm-dialog';
import { MessageService } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { HotelService } from '../../../core/services/hotel-service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPanel } from '../notification-panel/notification-panel';

@Component({
  selector: 'app-header',
  standalone: true,
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
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
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
     * @param hotelService
     * @param notificationService
     */
    constructor(
        private router: Router,
        private authService: Auth,
        private toast: MessageService,
        private hotelService: HotelService,
        private notificationService: NotificationService
    ) {
        // 監聽 router 改變
        this.router.events
            .pipe(
                filter(e => e instanceof NavigationEnd),
                filter(() => !!this.authService.getAccessToken())
            )
            .subscribe(() => this.onCheckLoginStatus());

        // 訂閱 service 的登入狀態
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
    }

    /**
     * 跳出 login
     */
    onClickLogin() {
        this.router.navigate(['/login']);
    }

    /**
     * 登出
     */
    onLogout() {
        if (this.isLoggedOut) return;
        this.isLoggedOut = true;

        this.authService.onLogoutApi().subscribe({
            next: () => {
                this.confirmVisible = false;
                this.toast.add({
                    severity: 'success',
                    summary: '登出成功',
                    detail: '期待您再次光臨！'
                });
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
        this.authService.onCheckLoginStatus().subscribe();
    }

    /**
     * 前往首頁
     */
    onClickHome() {
        this.router.navigate(['']);
    }

    /**
     * 前往狗狗旅館（帶參數搜尋）
     */
    onClickDog() {
        console.log('=== Header - 狗狗旅館 ===');

        // 使用默認日期：今天和明天
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 準備 API 參數
        const apiParams = {
            petType: 'DOG',
            checkIn: today,
            checkOut: tomorrow,
            petCount: 1,
            city: '',  // 不指定城市
            pageNumber: 1,
            pageSize: 10
        };

        console.log('API 參數:', apiParams);

        // 調用 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                console.log('API 回應:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    console.log(`找到 ${response.TRANRS.hotels?.length || 0} 間狗狗旅館`);

                    // 成功，跳轉到旅館列表頁
                    this.router.navigate(['/dogHotels'], {
                        state: {
                            searchResult: response.TRANRS,
                            searchParams: apiParams
                        }
                    });
                } else {
                    // API 返回錯誤
                    this.toast.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                    });
                }
            },
            error: (error) => {
                console.error('API 錯誤:', error);
                this.toast.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    /**
     * 前往貓貓旅館（帶參數搜尋）
     */
    onClickCat() {
        console.log('=== Header - 貓貓旅館 ===');

        // 使用默認日期：今天和明天
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 準備 API 參數
        const apiParams = {
            petType: 'CAT',
            checkIn: today,
            checkOut: tomorrow,
            petCount: 1,
            city: '',  // 不指定城市
            pageNumber: 1,
            pageSize: 10
        };

        console.log('API 參數:', apiParams);

        // 調用 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                console.log('API 回應:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    console.log(`找到 ${response.TRANRS.hotels?.length || 0} 間貓貓旅館`);

                    // 成功，跳轉到旅館列表頁
                    this.router.navigate(['/dogHotels'], {
                        state: {
                            searchResult: response.TRANRS,
                            searchParams: apiParams
                        }
                    });
                } else {
                    // API 返回錯誤
                    this.toast.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                    });
                }
            },
            error: (error) => {
                console.error('API 錯誤:', error);
                this.toast.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
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
            this.router.navigate(['/login'], { queryParams: { redirect: '/chat' } });
            return;
        }
        this.router.navigate(['/chat']);
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
            this.router.navigate(['/login'], { queryParams: { redirect: '/history' } });
            return;
        }
        this.router.navigate(['/history']);
    }

    /**
     * 點擊通知鈴鐺
     * @returns
     */
    onClickNotification() {
        if (!this.isLoggedIn) {
            this.toast.add({
                severity: 'warn',
                summary: '尚未登入',
                detail: '請先登入後查看通知'
            });
            this.router.navigate(['/login']);
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
                    console.log('未讀通知數量:', res.TRANRS.unread_count);
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
        console.log('設定 SSE 即時推播連線');

        // 建立連線，並傳入收到通知時的回調
        this.notificationService.connectSSE((notification) => {
            console.log('Header 收到新通知:', notification);

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
            icon: '/assets/logo.png', // 可以自訂圖標
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

    ngOnDestroy(): void {
        // 關閉 SSE 連線
        this.notificationService.disconnectSSE();

        this.destroy$.next();
        this.destroy$.complete();
    }
}
