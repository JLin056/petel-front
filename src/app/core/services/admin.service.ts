import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { ADMIN007Req } from '../interfaces/ADMIN007Req.interface';
import { ADMIN007Res } from '../interfaces/ADMIN007Res.interface';
import { ADMIN008Req } from '../interfaces/ADMIN008Req.interface';
import { ADMIN008Res } from '../interfaces/ADMIN008Res.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  /** 注入 HttpClient */
  constructor(private http: HttpClient) {}

  /** 查詢會員列表 API URL */
  queryMembersUrl = `${environment.BASE_URL}/admin/queryMembers`;

  /** 刪除會員 API URL */
  deleteMemberUrl = `${environment.BASE_URL}/admin/members/delete`;

  /** headers */
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

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
