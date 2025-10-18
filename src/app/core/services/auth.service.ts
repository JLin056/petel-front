import { Observable } from 'rxjs';
import { AUTH002Res } from '../interfaces/AUTH002Res.interface';
import { environment } from '../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AUTH002Req } from '../interfaces/AUTH002Req.interface';
import { AUTH001Req } from '../interfaces/AUTH001Req.interface';
import { AUTH001Res } from '../interfaces/AUTH001Res.interface';
import { AUTH003Res } from '../interfaces/AUTH003Res.interface';

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
}
