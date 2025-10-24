import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class Auth {

    /** 注入 HttpClient */
    constructor(private http: HttpClient){}

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
    resettUrl = `${environment.BASE_URL}/auth/reset`;

    /** headers */
    private headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

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
        });
    }

    /**
     * 登出 API
     * @returns AUTH003Res
     */
    onLogoutApi(): Observable<AUTH003Res> {
        return this.http.post<AUTH003Res>(this.logoutUrl, null, {
            headers: this.headers,
            withCredentials: true
        })
    }


    /**
     * 確認登入狀態 API
     * @returns AUTH008Res
     */
    onCheckLoginStatus(): Observable<AUTH008Res> {
        return this.http.post<AUTH008Res>(this.checkLoginUrl, null, {
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
        return this.http.post<AUTH005Res>(this.resettUrl, postData, {
            headers: this.headers
        });
    }
}
