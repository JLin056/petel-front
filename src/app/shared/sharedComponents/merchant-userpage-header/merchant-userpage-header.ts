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
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Auth } from '../../../core/services/auth.service';

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
    SharedConfirmDialog],
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

    private destroy$ = new Subject<void>();

    /**
     * 注入
     * @param router
     * @param authService
     * @param toast
     */
    constructor(
        private router: Router,
        private authService: Auth,
        private toast: MessageService
    ) {}

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
     * 元件銷毀時取消訂閱
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
