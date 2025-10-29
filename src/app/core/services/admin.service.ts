import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { ADMIN001Req } from '../interfaces/ADMIN001Req.interface';
import { ADMIN001Res } from '../interfaces/ADMIN001Res.interface';
import { ADMIN003Req } from '../interfaces/ADMIN003Req.interface';
import { ADMIN003Res } from '../interfaces/ADMIN003Res.interface';
import { ADMIN007Req } from '../interfaces/ADMIN007Req.interface';
import { ADMIN007Res } from '../interfaces/ADMIN007Res.interface';
import { ADMIN008Req } from '../interfaces/ADMIN008Req.interface';
import { ADMIN008Res } from '../interfaces/ADMIN008Res.interface';
import { ADMIN003Req } from '../interfaces/ADMIN003Req.interface';
import { ADMIN001Req } from '../interfaces/ADMIN001Req.interface';
import { ADMIN001Res } from '../interfaces/ADMIN001Res.interface';
import { ADMIN003Res } from '../interfaces/ADMIN003Res.interface';
import { ADMIN006Req } from '../interfaces/ADMIN006Req.interface';
import { ADMIN006Res } from '../interfaces/ADMIN006Res.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  /** 注入 HttpClient */
  constructor(private http: HttpClient) { }

  /** 查詢旅館列表 API URL */
  queryHotelsUrl = `${environment.BASE_URL}/admin/hotels/queryStore`;

  /** 查詢訂單列表 API URL */
  queryOrdersUrl = `${environment.BASE_URL}/admin/bookings/list`;

  /** 刪除旅館 API URL */
  deleteHotelUrl = `${environment.BASE_URL}/admin/hotels/delete`;

  /** 查詢會員列表 API URL */
  queryMembersUrl = `${environment.BASE_URL}/admin/queryMembers`;

  /** 刪除會員 API URL */
  deleteMemberUrl = `${environment.BASE_URL}/admin/members/delete`;

  /** headers */
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * 查詢旅館列表 API (ADMIN-001)
   * @param postData ADMIN001Req
   * @returns ADMIN001Res
   */
  queryHotels(postData: ADMIN001Req): Observable<ADMIN001Res> {
    return this.http.post<ADMIN001Res>(this.queryHotelsUrl, postData, {
      headers: this.headers,
      withCredentials: true
    });
  }

  /**
   * 查詢訂單列表 API (ADMIN-003)
   * @param postData ADMIN003Req
   * @returns ADMIN003Res
   */
  queryOrders(postData: ADMIN003Req): Observable<ADMIN003Res> {
    return this.http.post<ADMIN003Res>(this.queryOrdersUrl, postData, {
      headers: this.headers,
      withCredentials: true
    });
  }

  /**
   * 查詢訂單列表 API (ADMIN-006)
   * @param postData ADMIN006Req
   * @returns ADMIN006Res
   */
  deleteHotel(postData: ADMIN006Req): Observable<ADMIN006Res> {
    return this.http.post<ADMIN006Res>(this.deleteHotelUrl, postData, {
      headers: this.headers,
      withCredentials: true
    });
  }

  /**
   * 查詢會員列表 API (ADMIN-007)
   * @param postData ADMIN007Req
   * @returns ADMIN007Res
   */
  queryMembers(postData: ADMIN007Req): Observable<ADMIN007Res> {
    return this.http.post<ADMIN007Res>(this.queryMembersUrl, postData, {
      headers: this.headers,
      withCredentials: true
    });
  }

  /**
   * 刪除會員 API (ADMIN-008)
   * @param postData ADMIN008Req
   * @returns ADMIN008Res
   */
  deleteMember(postData: ADMIN008Req): Observable<ADMIN008Res> {
    return this.http.post<ADMIN008Res>(this.deleteMemberUrl, postData, {
      headers: this.headers,
      withCredentials: true
    });
  }
}
