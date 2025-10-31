import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { NotificationDto, NotificationType } from '../../../core/interfaces/notification.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { MessageService } from 'primeng/api';
import { PricePipe } from '../../pipes/price-pipe';

@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [
        CommonModule,
        Drawer,
        ButtonModule,
        BadgeModule,
        TooltipModule,
        PricePipe
    ],
    templateUrl: './notification-panel.html',
    styleUrl: './notification-panel.css'
})
export class NotificationPanel implements OnInit, OnDestroy {
    /** 是否顯示面板 */
    @Input() visible = false;
    /** 面板顯示狀態變更 */
    @Output() visibleChange = new EventEmitter<boolean>();

    /** 通知列表 */
    notifications: NotificationDto[] = [];
    /** 載入中 */
    loading = false;

    private destroy$ = new Subject<void>();

    constructor(
        private notificationService: NotificationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // 監聽未讀數量變化（有新通知時自動重新載入）
        this.notificationService.unreadCount$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                // 如果面板是開啟的，自動重新載入
                if (this.visible && this.notifications.length > 0) {
                    console.log('檢測到新通知，重新載入列表');
                    this.loadNotifications();
                }
            });
    }

    /**
     * 當面板顯示時觸發
     */
    onShow(): void {
        this.loadNotifications();
    }

    /**
     * 當面板隱藏時觸發
     */
    onHide(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    /**
     * 載入通知列表
     */
    loadNotifications(): void {
        this.loading = true;
        this.notificationService.getNotificationList().subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.notifications = res.TRANRS.notifications;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: '載入失敗',
                        detail: res.MWHEADER.RETURNDESC
                    });
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('載入通知失敗:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '載入失敗',
                    detail: '無法載入通知列表'
                });
                this.loading = false;
            }
        });
    }

    /**
     * 標記通知為已讀
     */
    markAsRead(notification: NotificationDto): void {
        // 如果已經是已讀，不做任何操作
        if (notification.status === 'READ') {
            return;
        }

        console.log('=== 標記已讀 ===');
        console.log('通知 ID:', notification.id);
        console.log('通知標題:', notification.title);

        this.notificationService.markAsRead(notification.id).subscribe({
            next: (res) => {
                console.log('標記已讀回應:', res);

                if (res.MWHEADER.RETURNCODE === '0000') {
                    // 更新本地狀態
                    notification.status = 'READ';
                    notification.read_at = res.TRANRS.read_at;

                    this.messageService.add({
                        severity: 'success',
                        summary: '已標記為已讀',
                        detail: notification.title
                    });
                } else {
                    console.error('後端返回錯誤碼:', res.MWHEADER.RETURNCODE);
                    console.error('錯誤訊息:', res.MWHEADER.RETURNDESC);

                    this.messageService.add({
                        severity: 'error',
                        summary: '標記失敗',
                        detail: `${res.MWHEADER.RETURNDESC || '未知錯誤'} (錯誤碼: ${res.MWHEADER.RETURNCODE})`
                    });
                }
            },
            error: (error) => {
                console.error('=== 標記已讀失敗 ===');
                console.error('錯誤物件:', error);
                console.error('錯誤狀態碼:', error.status);
                console.error('錯誤訊息:', error.message);
                console.error('錯誤詳情:', error.error);

                let errorDetail = '無法標記為已讀';

                if (error.status === 0) {
                    errorDetail = '無法連接到後端伺服器';
                } else if (error.status === 401) {
                    errorDetail = '未授權，請重新登入';
                } else if (error.status === 404) {
                    errorDetail = 'API 端點不存在';
                } else if (error.error?.MWHEADER?.RETURNDESC) {
                    errorDetail = error.error.MWHEADER.RETURNDESC;
                } else if (error.message) {
                    errorDetail = error.message;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: '標記失敗',
                    detail: `${errorDetail} (HTTP ${error.status})`
                });
            }
        });
    }

    /**
     * 取得通知類型的顯示文字
     */
    getTypeLabel(type: NotificationType): string {
        switch (type) {
            case 'SYSTEM': return '系統公告';
            case 'ORDER': return '訂單通知';
            case 'PAYMENT': return '交易通知';
            default: return '通知';
        }
    }

    /**
     * 取得通知類型的圖標
     */
    getTypeIcon(type: NotificationType): string {
        switch (type) {
            case 'SYSTEM': return 'pi pi-info-circle';
            case 'ORDER': return 'pi pi-shopping-cart';
            case 'PAYMENT': return 'pi pi-dollar';
            default: return 'pi pi-bell';
        }
    }

    /**
     * 取得通知類型的顏色
     */
    getTypeColor(type: NotificationType): string {
        switch (type) {
            case 'SYSTEM': return '#3498db';
            case 'ORDER': return '#f39c12';
            case 'PAYMENT': return '#27ae60';
            default: return '#95a5a6';
        }
    }

    /**
     * 格式化時間（相對時間，用於通知建立時間）
     */
    formatTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '剛剛';
        if (minutes < 60) return `${minutes} 分鐘前`;
        if (hours < 24) return `${hours} 小時前`;
        if (days < 7) return `${days} 天前`;

        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 格式化日期（只顯示日期，用於訂單日期）
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }


    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
