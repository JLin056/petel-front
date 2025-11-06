import { BehaviorSubject, map, Observable, of, switchMap, tap, catchError, lastValueFrom, Subject } from 'rxjs';
import { AUTH002Res } from '../interfaces/AUTH002Res.interface';
import { environment } from '../../../environment';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AUTH002Req } from '../interfaces/AUTH002Req.interface';
import { AUTH001Req } from '../interfaces/AUTH001Req.interface';
import { AUTH001Res } from '../interfaces/AUTH001Res.interface';
import { AUTH003Res } from '../interfaces/AUTH003Res.interface';
import { AUTH008Res } from '../interfaces/AUTH008Res.interface';
import { AUTH004Res } from '../interfaces/AUTH004Res.interface';
import { AUTH004Req } from '../interfaces/AUTH004Req.interface';
import { AUTH005Req } from '../interfaces/AUTH005Req.interface';
import { AUTH005Res } from '../interfaces/AUTH005Res.interface';
import { AUTH010Res } from '../interfaces/AUTH010Res.interface';
import { AUTH006Res } from '../interfaces/AUTH006Res.interface';
import { AUTH009Res } from '../interfaces/AUTH009Res.interface';
import { HttpWithRetry } from './http-with-retry.service';

@Injectable({
    providedIn: 'root'
})
export class Auth {

    /** accessToken */
    private accessToken: string | null = null;

    private isLoggedInSubject = new BehaviorSubject<boolean>(false);
    public readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

    private roleSubject = new BehaviorSubject<string | null>(null);
    public readonly role$ = this.roleSubject.asObservable();

    /** Token 刷新事件（專門用於通知 token 已更新） */
    private tokenRefreshedSubject = new Subject<string>();
    public readonly tokenRefreshed$ = this.tokenRefreshedSubject.asObservable();

    private bootstrapped = false;

    /** 注入 HttpWithRetry（自動重試 401） */
    constructor(private http: HttpWithRetry) { }

    /** 註冊 API URL */
    registerUrl = `${environment.BASE_URL}/auth/register`;
    /** 登入 API URL */
    loginUrl = `${environment.BASE_URL}/auth/login`;
    /** 登出 API URL */
    logoutUrl = `${environment.BASE_URL}/auth/logout`;
    /** 檢查登入狀態 API URL */
    checkLoginUrl = `${environment.BASE_URL}/auth/check`;
    /** 忘記密碼 API URL */
    forgotUrl = `${environment.BASE_URL}/auth/forgot`;
    /** 重設密碼 API URL */
    resetUrl = `${environment.BASE_URL}/auth/reset`;
    /** 取得登入資訊 API URL */
    meUrl = `${environment.BASE_URL}/auth/me`;
    /** refresh token API URL */
    refreshUrl = `${environment.BASE_URL}/auth/refresh`;
    /** 檢查個人資訊是否填寫 */
    profileCheckUrl = `${environment.BASE_URL}/auth/profile/check`;

    /** headers */
    private readonly headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    /**
     * 設定 access Token
     * @param token
     * @param isRefresh 是否為刷新 token（用於區分登入和刷新）
     */
    setAccessToken(token: string | null, isRefresh: boolean = false): void {
        const oldToken = this.accessToken;
        this.accessToken = token;
        const loggedIn = !!token;
        this.isLoggedInSubject.next(loggedIn);
        if (!loggedIn) this.setRole(null);

        // ✅ 只在 token 刷新且確實變化時發出事件
        if (isRefresh && token && oldToken !== token) {
            console.log('[Auth] Token 已刷新，通知訂閱者');
            this.tokenRefreshedSubject.next(token);
        }
    }

    /**
     * 取得 access Token
     * @returns
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * 清除 access Token
     */
    clearAccessToken(): void {
        this.accessToken = null;
        this.isLoggedInSubject.next(false);
        this.setRole(null);
    }

    /** 角色 */
    private setRole(role: string | null): void {
        this.roleSubject.next(role ?? null);
    }

    getRoleSync(): string | null {
        return this.roleSubject.value;
    }

    hasRole(role: string): boolean {
        return this.roleSubject.value === role;
    }

    /**
     * 註冊 API
     * @param postData AUTH001Req
     * @returns AUTH001Res
     */
    onRegisterApi(postData: AUTH001Req): Observable<AUTH001Res> {
        return this.http.post<AUTH001Res>(this.registerUrl, postData, {
            headers: this.headers
        });
    }

    /**
     * 登入 API
     * @param postData AUTH002Req
     * @returns AUTH002Res
     */
    onLoginApi(postData: AUTH002Req): Observable<AUTH002Res> {
        return this.http.post<AUTH002Res>(this.loginUrl, postData, {
            headers: this.headers,
            withCredentials: true
        })
            .pipe(
                tap(res => this.setAccessToken(res?.TRANRS.accessToken ?? null)),
                switchMap(res => {
                    const role = res?.TRANRS?.Role as string | undefined;

                    const role$ = role
                        ? of(role)
                        : this.onGetInfo().pipe(
                            map(me => me.TRANRS.Role)
                        );

                    return role$.pipe(
                        tap(finalRole => this.setRole(finalRole)),
                        map(() => res)
                    );
                })
            );
    }

    /**
     * 登出 API
     * @returns AUTH003Res
     */
    onLogoutApi(): Observable<AUTH003Res> {
        return this.http.post<AUTH003Res>(this.logoutUrl, null, {
            withCredentials: true
        })
            .pipe(tap(() => this.clearAccessToken()));
    }

    /**
     * 用 Refresh token 換新 Access Token
     * @returns AUTH010Res
     */
    onRefreshToken(): Observable<AUTH010Res> {
        return this.http.post<AUTH010Res>(this.refreshUrl, null, {
            withCredentials: true
        })
            .pipe(tap(res => {
                // ✅ 標記為刷新 token，觸發 tokenRefreshed$ 事件
                this.setAccessToken(res?.TRANRS?.accessToken ?? null, true);
            }));
    }

    /**
     * 取得用戶資訊
     * @returns
     */
    onGetInfo(): Observable<AUTH006Res> {
        return this.http.post<AUTH006Res>(this.meUrl, null, {
            withCredentials: true
        }).pipe(
            tap(res => this.setRole(res?.TRANRS?.Role)))
    }

    /**
     * 確認登入狀態 API
     * @returns AUTH008Res
     */
    onCheckLoginStatus(): Observable<AUTH008Res> {
        return this.http.post<AUTH008Res>(this.checkLoginUrl, null, {
            withCredentials: true
        }).pipe(
            tap(res => {
                const valid = !!res?.TRANRS?.valid;
                this.isLoggedInSubject.next(valid && !!this.accessToken);
            }),
            catchError(() => {
                this.isLoggedInSubject.next(false);
                return of({ TRANRS: { valid: false } } as AUTH008Res);
            })
        );
    }

    /**
    * 檢查用戶是否填寫過會員資訊 API
    * @returns
    */
    onProfileCheck(): Observable<AUTH009Res> {
        return this.http.post<AUTH009Res>(this.profileCheckUrl, null, {
            headers: this.headers,
            withCredentials: true
        })
    }

    /**
     * 忘記密碼
     * @returns
     */
    onForgotPassword(postData: AUTH004Req): Observable<AUTH004Res> {
        return this.http.post<AUTH004Res>(this.forgotUrl, postData, {
            headers: this.headers
        });
    }

    /**
     * 重設密碼
     * @returns
     */
    onResetPassword(postData: AUTH005Req): Observable<AUTH005Res> {
        return this.http.post<AUTH005Res>(this.resetUrl, postData, {
            headers: this.headers
        });
    }

    async bootstrap(): Promise<void> {
        if (this.bootstrapped) return;
        this.bootstrapped = true;

        if (this.accessToken) return;

        try {
            await lastValueFrom(
                this.onRefreshToken().pipe(
                    switchMap(() => this.onGetInfo()),
                    catchError(() => of(null))
                )
            );
        } catch {
        }
    }

    forceLogout$(): Observable<void> {
        return this.onLogoutApi().pipe(
            map(() => void 0),
            catchError(() => {
                this.clearAccessToken();
                return of(void 0);
            })
        )
    }
}
