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
import { filter, Subject, takeUntil } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
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
  /**第一次登入檢查 */
  isFirstCheck = true;

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
    // 監聽路由事件，導航結束時檢查登入狀態
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isFirstCheck) {
          // 初始化已經檢查過，跳過第一次 Router.events
          this.isFirstCheck = false;
          return;
        }
        this.onCheckLoginStatus();
      });

    // 訂閱 service 的登入狀態，保持元件狀態與 Auth service 同步
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.isLoggedIn = v)
  }

  /**
   * 元件初始化時執行一次登入狀態檢查
   */
  ngOnInit() {
    this.onCheckLoginStatus();
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
          this.authService.clearAccessToken();
          this.toast.add({
            severity: 'warn',
            summary: '未登入',
            detail: '請先登入後再進入商家頁面'
          });
          this.router.navigate(['/merchants/login']);
        }
      },
      error: () => {
        this.authService.clearAccessToken();
        this.toast.add({
          severity: 'warn',
          summary: '未登入',
          detail: '請先登入後再進入商家頁面'
        });
        this.router.navigate(['/merchants/login']);
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
      this.router.navigate(['/merchants/login'], { queryParams: { redirect: 'merchants/userPage/chat' } });
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
      this.router.navigate(['/merchants/login'], { queryParams: { redirect: '/merchants/userPage' } }); // 修正導向路徑
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
