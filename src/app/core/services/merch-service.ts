import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { MERCH004Tranrq } from '../interfaces/MERCH004Req.interface';
import { MERCH004Tranrs } from '../interfaces/MERCH004Res.interface';
import { MERCH005Tranrq } from '../interfaces/MERCH005Req.interface';
import { MERCH005Tranrs } from '../interfaces/MERCH005Res.interface';
import { MERCH006Tranrq } from '../interfaces/MERCH006Req.interface';
import { MERCH006Tranrs } from '../interfaces/MERCH006Res.interface';
import { Res } from '../interfaces/Res.interface';
import { MERCH002Tranrq } from '../interfaces/MERCH002Req.interface';
import { MERCH002Tranrs } from '../interfaces/MERCH002Res.interface';
import { MERCH012Tranrq } from '../interfaces/MERCH012Req.interface';
import { MERCH012Tranrs } from '../interfaces/MERCH012Res.interface';
import { MERCH011Tranrs } from '../interfaces/MERCH011Res.interface';

@Injectable({
  providedIn: 'root'
})
export class MerchService {

  http = inject(HttpClient);

  /**
     * MERCH-002 查詢單筆旅館所有房型資訊
     * @param tranrq 單筆旅館所有房型資訊
     * @returns
     */
  queryPropertyRooms(tranrq: MERCH002Tranrq) {

    const header: Mwheader = {
      MSGID: 'MERCH-002'
    };

    const postData: Req<MERCH002Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH002Tranrs>>('http://localhost:8080/merchants/rooms/list', postData);
  }

  /**
   * MERCH-004 新增房間資訊
   * @param tranrq 房型資訊
   * @returns
   */
  createRoomDetail(tranrq: MERCH004Tranrq) {

    const header: Mwheader = {
      MSGID: 'MERCH-004'
    };

    const postData: Req<MERCH004Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH004Tranrs>>('http://localhost:8080/merchants/rooms/create', postData);
  }

  /**
   * MERCH-005 修改房間資訊
   * @param tranrq 房型資訊
   * @returns
   */
  editRoomDetail(tranrq: MERCH005Tranrq) {

    const header: Mwheader = {
      MSGID: 'MERCH-005'
    };

    const postData: Req<MERCH005Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH005Tranrs>>('http://localhost:8080/merchants/rooms/edit', postData);
  }

  /**
   * MERCH-006 刪除房間資訊
   * @param roomId 房間編號
   * @returns
   */
  deleteRoomDetail(roomId: string) {

    const header: Mwheader = {
      MSGID: 'MERCH-006'
    };

    const tranrq: MERCH006Tranrq = {
      id: roomId
    };

    const postData: Req<MERCH006Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH006Tranrs>>('http://localhost:8080/merchants/rooms/delete', postData);
  }

  /**
   * MERCH-009 新增商家會員資訊
   * @returns 
   */
  createSellerInfo(accountId: string) {
    const header: Mwheader = {
      MSGID: 'MERCH-009'
    };
    const actualAccountId = accountId || localStorage.getItem('accountId') || '';

    const tranrq = {
      accountId: actualAccountId
    };

    const postData: Req<any> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH011Tranrs>>('http://localhost:8080/merchants/sellers/edit', postData, { withCredentials: true });
  }

  /**
   * MERCH-010 修改商家會員資訊
   * @returns 
   */
  editSellerInfo(accountId: string) {
    const header: Mwheader = {
      MSGID: 'MERCH-010'
    };
    const actualAccountId = accountId || localStorage.getItem('accountId') || '';

    const tranrq = {
      accountId: actualAccountId
    };

    const postData: Req<any> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH011Tranrs>>('http://localhost:8080/merchants/sellers/edit', postData, { withCredentials: true });
  }

  /**
   * MERCH-011 取得商家會員資訊
   * @returns 
   */
  getSellerInfo(accountId: string) {
    const header: Mwheader = {
      MSGID: 'MERCH-011'
    };
    const actualAccountId = accountId || localStorage.getItem('accountId') || '';

    const tranrq = {
      accountId: actualAccountId
    };

    const postData: Req<any> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH011Tranrs>>('http://localhost:8080/merchants/sellers/get', postData, { withCredentials: true });
  }

  /**
   * MERCH-012 查詢單房間資訊
   * @param roomId 房間編號
   * @returns
   */
  getRoomDetail(tranrq: MERCH012Tranrq) {
    const header: Mwheader = {
      MSGID: 'MERCH-002'
    };

    const postData: Req<MERCH012Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH012Tranrs>>('http://localhost:8080/merchants/rooms/get', postData);
  }
}
