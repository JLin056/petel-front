import { BehaviorSubject, map, Observable, of, switchMap, tap, catchError, lastValueFrom } from 'rxjs';
import { AUTH002Res } from '../interfaces/AUTH002Res.interface';
import { environment } from '../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    /** 注入 HttpClient */
    constructor(private http: HttpClient) { }

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
     */
    setAccessToken(token: string | null): void {
        this.accessToken = token;
        const loggedIn = !!token;
        this.isLoggedInSubject.next(loggedIn);
        if (!loggedIn) this.setRole(null);
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
                    const roleFromLogin = res?.TRANRS?.Role as string | undefined;
                    if (roleFromLogin) {
                        this.setRole(roleFromLogin);
                        return of(res);
                    }
                    return this.onGetInfo().pipe(
                        tap(me => this.setRole(extractSingleRole(me))),
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
            .pipe(tap(res => this.setAccessToken(res?.TRANRS?.accessToken ?? null)));
    }

    /**
     * 取得用戶資訊
     * @returns
     */
    onGetInfo(): Observable<AUTH006Res> {
        return this.http.post<AUTH006Res>(this.meUrl, null, {
            withCredentials: true
        })
            .pipe(tap(res => {
                const role = extractSingleRole(res);
                if (role) this.setRole(role);
            }))
    }

    /**
     * 確認登入狀態 API
     * @returns AUTH008Res
     */
    onCheckLoginStatus(): Observable<AUTH008Res> {
        return this.http.post<AUTH008Res>(this.checkLoginUrl, null, {
            withCredentials: true
        })
            .pipe(tap(res => {
                const valid = !!res?.TRANRS?.valid;
                this.isLoggedInSubject.next(valid);
                if (!valid) this.clearAccessToken();
            }))
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
        try {
            await lastValueFrom(
                this.onRefreshToken().pipe(
                    switchMap(() => this.onGetInfo()),
                    catchError(() => {
                        this.clearAccessToken();
                        return of(null);
                    })
                )
            );
        } catch {
            this.clearAccessToken();
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


/** 抽出「單一角色字串」 */
function extractSingleRole(res: any): string | null {
    const role =
        res?.TRANRS?.Role ??
        null;

    if (typeof role === 'string') return role;
    return null;
}
