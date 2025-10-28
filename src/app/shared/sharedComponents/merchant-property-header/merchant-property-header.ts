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
// 實作 OnInit 和 OnDestroy
export class MerchantPropertyHeader implements OnInit, OnDestroy {
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
    // 監聽路由事件，導航結束時檢查登入狀態
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.onCheckLoginStatus());

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
        // 即使 API 失敗，也清空本地 Token，強制登出
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
        // 如果 API 回傳無效，則清空本地 Token (讓 isLoggedIn$ 轉為 false)
        if (!valid) {
          this.authService.clearAccessToken();
        }
        // 💡 由於 constructor 中已訂閱 isLoggedIn$，這裡不再需要手動設置 this.isLoggedIn
      },
      error: () => {
        // API 連線失敗，強制清空 Token
        this.authService.clearAccessToken();
      }
    });
  }


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
      this.router.navigate(['/login'], { queryParams: { redirect: '/merchants/userPage' } }); // 修正導向路徑
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
