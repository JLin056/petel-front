import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
    SharedConfirmDialog
  ],
  templateUrl: './merchant-property-header.html',
  styleUrl: './merchant-property-header.css'
})
export class MerchantPropertyHeader {
<<<<<<< HEAD
  /** 確認登入狀態 */
  isLoggedIn = false; /** 確認登入狀態 */
  /** confirmVisible */
  confirmVisible = false;

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
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.onCheckLoginStatus());
  }
=======
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
    ) {
        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe(() => this.onCheckLoginStatus());

        // 訂閱 service 的登入狀態
        this.authService.isLoggedIn$
            .pipe(takeUntil(this.destroy$))
            .subscribe(v => this.isLoggedIn = v)
    }
>>>>>>> dev

  /**
   * 跳出 login
   */
  onClickLogin() {
    this.router.navigate(['/login']);
  }

<<<<<<< HEAD
  /**
   * 登出
   */
  onLogout() {
    this.authService.onLogoutApi().subscribe({
      next: (res) => {
        this.isLoggedIn = false;
        this.confirmVisible = false;
        console.log('登出成功');
        this.router.navigate(['']);
      },
      error: (err) => {
        this.confirmVisible = false;

        this.toast.add({
          severity: 'error',
          summary: '登出失敗',
          detail: '請稍後再試'
=======
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
>>>>>>> dev
        });
      }
    });
  }


<<<<<<< HEAD
  /**
   * 確認登入狀態
   */
  onCheckLoginStatus() {
    this.authService.onCheckLoginStatus().subscribe({
      next: (res) => {
        if (res.TRANRS.valid) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
=======
    /**
     * 確認登入狀態
     */
    onCheckLoginStatus() {
        this.authService.onCheckLoginStatus().subscribe({
            next: (res) => {
                const valid = !!res?.TRANRS.valid;
                if (!valid) this.authService.clearAccessToken();
            }
        });
    }


    onClickHome() {
        this.router.navigate(['/merchants/property/homepage']);
    }

    onClickReview() {
        this.router.navigate(['/merchants/property/reviewList']);
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
>>>>>>> dev
        }
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }


<<<<<<< HEAD
  onClickHome() {
    this.router.navigate(['/merchants/property/homepage']);
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
      this.router.navigate(['/login'], { queryParams: { redirect: '/chat' } });
      return;
=======
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
>>>>>>> dev
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
    this.router.navigate(['/merchants/userPage']);
  }


  ngOnInit() {
    this.onCheckLoginStatus();
  }
}
