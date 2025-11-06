import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Admin 路由守衛
 * 檢查用戶是否已登入且角色為 admin
 * 如果未登入或角色不符，導向 admin 登入頁
 */
export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // 檢查是否有 accessToken
  const token = authService.getAccessToken();

  if (!token) {
    // 沒有 token，導向登入頁並帶上 redirect 參數
    router.navigate(['/admin/login'], {
      queryParams: { redirect: state.url }
    });
    return false;
  }

  // 有 token，檢查角色
  const role = authService.getRoleSync();

  if (role === 'admin') {
    // 已登入且是 admin 角色
    return true;
  }

  // 有 token 但角色不是 admin
  router.navigate(['/admin/login']);
  return false;
};
