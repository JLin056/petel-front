import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  imports: [
    CommonModule,
    ButtonModule,
    SharedConfirmDialog
  ],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css'
})
export class AdminHeader implements OnDestroy {
  /** 是否登入（service 推播） */
  isLoggedIn = false;
  /** confirmVisible */
  confirmVisible = false;
  /** 是否登出中 */
  isLoggedOut = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: Auth,
    private toast: MessageService
  ) {
    // 訂閱 service 的登入狀態
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.isLoggedIn = v);
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
        this.router.navigate(['/admin/login']);
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

        this.router.navigate(['/admin/login']);
        this.isLoggedOut = false;
      }
    });
  }

  /**
   * 前往會員列表
   */
  onClickUserTable() {
    this.router.navigate(['/admin/userTable']);
  }

  /**
   * 前往賣家列表
   */
  onClickSellerTable() {
    this.router.navigate(['/admin/sellerTable']);
  }

  /**
   * 前往旅館列表
   */
  onClickHotelTable() {
    this.router.navigate(['/admin/hotelTable']);
  }

  /**
   * 前往歷史訂單列表
   */
  onClickOrderTable() {
    this.router.navigate(['/admin/orderTable']);
  }

  /**
   * 前往首頁
   */
  onClickHome() {
    this.router.navigate(['/admin/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
