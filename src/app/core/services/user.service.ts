import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { USER001Req } from '../interfaces/USER001Req.interface';
import { Observable } from 'rxjs';
import { USER001Res } from '../interfaces/USER001Res.interface';
import { USER004Res } from '../interfaces/USER004Res.interface';
import { USER006Req } from '../interfaces/USER006Req.interface';
import { USER006Res } from '../interfaces/USER006Res.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    /** 注入 HttpClient */
    constructor(private http: HttpClient) { }

    /** 註冊 API URL */
    addUserUrl = `${environment.BASE_URL}/user/create`;
    /** 取得 用戶資訊 API URL */
    getUserInfoUrl = `${environment.BASE_URL}/user/get`;
    /** 取得 歷史訂單 API URL */
    getBookingInfoUrl = `${environment.BASE_URL}/user/bookings/get`;

    /**
     * 新增會員資料 API
     * @param postData
     * @returns
     */
    onAddUserApi(postData: USER001Req): Observable<USER001Res> {
        return this.http.post<USER001Res>(this.addUserUrl, postData, {
            withCredentials: true
        });
    }

    /**
     * 取得會員資訊 API
     * @returns
     */
    getUserInfo(): Observable<USER004Res> {
        return this.http.post<USER004Res>(this.getUserInfoUrl, null, {
            withCredentials: true
        });
    }

    /**
     * 取得訂單紀錄 API
     * @param postData
     * @returns
     */
    onGetBookingInfoApi(postData: USER006Req): Observable<USER006Res> {
        return this.http.post<USER006Res>(this.getBookingInfoUrl, postData, {
            withCredentials: true
        })
    }
}
