import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, filter, switchMap, take, throwError, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '../services/auth.service';
import { AUTH010Res } from '../interfaces/AUTH010Res.interface';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);
let failureHandled = false; // 防止重複處理失敗

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(Auth);
    const router = inject(Router);

    const isAuthEndpoint =
        req.url.includes('/auth/login')   ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout')  ||
        req.url.includes('/auth/register')||
        req.url.includes('/auth/forgot')  ||
        req.url.includes('/auth/reset');


    const accessToken = authService.getAccessToken();
    const authReq = (!isAuthEndpoint && accessToken)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
        : req;

    return next(authReq).pipe(
        catchError((error) => {
            if (!isAuthEndpoint && error.status === 401) {
                // ✅ 第一個 401：刷新 token
                if (!isRefreshing) {
                    isRefreshing = true;
                    failureHandled = false; // 重置失敗標誌
                    refreshTokenSubject.next(null);  // 重置

                    return authService.onRefreshToken().pipe(
                        switchMap((res: AUTH010Res) => {
                            isRefreshing = false;

                            const newToken = res?.TRANRS?.accessToken;
                            if (!newToken) {
                                // Token 刷新失敗：未收到新 token
                                handleRefreshFailure(authService, router);
                                return throwError(() => new Error('Refresh token 失效，請重新登入'));
                            }

                            // ✅ Token 刷新成功，通知等待中的請求
                            refreshTokenSubject.next(newToken);
                            authService.setAccessToken(newToken, true);

                            // 重試當前請求
                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` }
                            });
                            return next(retryReq);
                        }),
                        catchError(err => {
                            isRefreshing = false;

                            // 處理刷新失敗
                            handleRefreshFailure(authService, router);
                            return throwError(() => err);
                        })
                    );
                } else {
                    // ✅ 其他 401：等待 token 刷新完成，然後重試
                    return refreshTokenSubject.pipe(
                        filter(token => token !== null),  // 等待新 token 或錯誤信號
                        take(1),
                        switchMap(token => {
                            // 檢查是否為錯誤信號
                            if (token === 'ERROR') {
                                return throwError(() => new Error('Token 刷新失敗，請重新登入'));
                            }

                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${token}` }
                            });
                            return next(retryReq);
                        })
                    );
                }
            }
            return throwError(() => error);
        })
    );
};

/**
 * 處理 Token 刷新失敗
 * - 通知所有等待中的請求
 * - 清除認證狀態
 * - 重定向到登錄頁
 */
function handleRefreshFailure(authService: Auth, router: Router): void {
    // 防止重複處理
    if (failureHandled) {
        return;
    }
    failureHandled = true;

    // 1. 通知所有等待中的請求失敗
    refreshTokenSubject.next('ERROR');

    // 2. 延遲重置狀態，確保所有等待的請求都收到錯誤
    setTimeout(() => {
        isRefreshing = false;
        refreshTokenSubject.next(null); // 重置為 null，準備下次使用
        failureHandled = false;
    }, 100);

    // 3. 清除認證狀態
    authService.clearAccessToken();

    // 4. 調用 logout API 清除 refresh token cookie
    authService.forceLogout$().subscribe({
        next: () => {},
        error: () => {}
    });

    // 5. 延遲重定向，確保 logout 請求有機會發送
    setTimeout(() => {
        const currentUrl = router.url;

        // 根據當前路徑決定重定向位置
        if (currentUrl.startsWith('/merchants')) {
            router.navigate(['/merchants/userPage/login']);
        } else if (currentUrl.startsWith('/admin')) {
            router.navigate(['/admin/login']);
        } else {
            router.navigate(['/login']);
        }
    }, 200);
}
