import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth.service';
import { MessageService } from 'primeng/api';

/**
 * Merchant 路由守衛
 * 檢查用戶是否已登入且角色為 seller
 * 根據路徑判斷是 userPage 還是 property 區域
 * 如果未登入或角色不符，導向商家登入頁
 */
export const merchantAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const messageService = inject(MessageService);

  // 檢查是否有 accessToken
  const token = authService.getAccessToken();

  if (!token) {
    // 沒有 token，導向商家登入頁並帶上 redirect 參數
    // console.log('Merchant Guard: 未登入，導向商家登入頁');
    messageService.add({
      severity: 'warn',
      summary: '未登入',
      detail: '請先登入後再進入商家頁面'
    });
    router.navigate(['/merchants/userPage/login'], {
      queryParams: { redirect: state.url }
    });
    return false;
  }

  // 有 token，檢查角色
  const role = authService.getRoleSync();

  if (role === 'seller') {
    // 已登入且是 seller 角色
    // console.log('Merchant Guard: 已驗證為 seller');
    return true;
  }

  // 有 token 但角色不是 seller
//   console.log('Merchant Guard: 角色不符，導向商家登入頁');
  messageService.add({
    severity: 'warn',
    summary: '權限不足',
    detail: '您沒有商家權限，請使用商家帳號登入'
  });
  router.navigate(['/merchants/userPage/login']);
  return false;
};
