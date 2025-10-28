import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth.service';
import { AUTH010Res } from '../interfaces/AUTH010Res.interface';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(Auth);

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
            if (!isAuthEndpoint && error.status === 401 && !isRefreshing) {
                isRefreshing = true;

                return authService.onRefreshToken().pipe(
                    switchMap((res: AUTH010Res) => {
                        isRefreshing = false;

                        const newToken = res?.TRANRS?.accessToken;
                        if (!newToken) {
                            authService.clearAccessToken();
                            return throwError(() => new Error('Refresh token 失效，請重新登入'));
                        }
                        authService.setAccessToken(newToken);
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError(err => {
                        isRefreshing = false;
                        authService.clearAccessToken();
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
