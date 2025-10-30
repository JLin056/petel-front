import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Tranrq as MERCH004Req } from '../interfaces/MERCH004Req.interface';
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
import { MERCH009Tranrs } from '../interfaces/MERCH009Res.interface';
import { MERCH010Tranrs } from '../interfaces/MERCH010Res.interface';
import { MERCH009Tranrq } from '../interfaces/MERCH009Req.interface';
import { MERCH010Tranrq } from '../interfaces/MERCH010Req.interface';
import { MERCH013Tranrq } from '../interfaces/MERCH013Req.interface';
import { MERCH013Tranrs } from '../interfaces/MERCH013Res.interface';
import { MERCH014Tranrq } from '../interfaces/MERCH014Req.interface';
import { MERCH014Tranrs } from '../interfaces/MERCH014Res.interface';

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
  createRoomDetail(tranrq: MERCH004Req) {

    const header: Mwheader = {
      MSGID: 'MERCH-004'
    };

    const postData: Req<MERCH004Req> = {
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
  createSellerInfo(tranrq: MERCH009Tranrq) {
    const header: Mwheader = {
      MSGID: 'MERCH-009'
    };

    const postData: Req<MERCH009Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    };

    return this.http.post<Res<MERCH009Tranrs>>('http://localhost:8080/merchants/sellers/create', postData, { withCredentials: true });
  }


  /**
   * MERCH-010 修改商家會員資訊
   * @returns 
   */
  editSellerInfo(tranrq: MERCH010Tranrq) {
    const header: Mwheader = {
      MSGID: 'MERCH-010'
    };

    const postData: Req<MERCH010Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH010Tranrs>>('http://localhost:8080/merchants/sellers/edit', postData, { withCredentials: true });
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

    const postData: Req<{}> = {
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
      MSGID: 'MERCH-012'
    };

    const postData: Req<MERCH012Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH012Tranrs>>('http://localhost:8080/merchants/rooms/get', postData);
  }

  /**
   * MERCH-013 查詢特定商家旗下旅館資訊
   * @param tranrq 單商家所有旅館資訊
   * @returns
   */
  querySellerProperties(tranrq: MERCH013Tranrq) {
    const header: Mwheader = {
      MSGID: 'MERCH-013'
    };

    const postData: Req<MERCH013Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    }

    return this.http.post<Res<MERCH013Tranrs>>('http://localhost:8080/merchants/properties/get', postData);
  }

  /**
 * MERCH-014 更新訂單狀態
 * @param tranrq 訂單編號 + 新狀態
 * @returns
 */
  updateOrderStatus(tranrq: MERCH014Tranrq) {
    const header: Mwheader = {
      MSGID: 'MERCH-014'
    };

    const postData: Req<MERCH014Tranrq> = {
      MWHEADER: header,
      TRANRQ: tranrq
    };

    return this.http.post<Res<MERCH014Tranrs>>(
      'http://localhost:8080/merchants/bookings/updateStatus',
      postData
    );
  }
}
