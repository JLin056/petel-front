import { inject, Injectable } from '@angular/core';
import { BOOK001Tranrs } from '../interfaces/BOOK001Res.interface';
import { BOOK002Tranrq } from '../interfaces/BOOK002Req.interface';
import { BOOK002Tranrs } from '../interfaces/BOOK002Res.interface';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Res } from '../interfaces/Res.interface';
import { BOOK001Tranrq } from './../interfaces/BOOK001Req.interface';
import { BOOK006Tranrq } from '../interfaces/BOOK006Req.interface';
import { BOOK006Tranrs } from '../interfaces/BOOK006Res.interface';
import { BOOK005Tranrq } from '../interfaces/BOOK005Req.interface';
import { BOOK005Tranrs } from '../interfaces/BOOK005Res.interface';
import { BOOK013Tranrq } from '../interfaces/BOOK013Req.interface';
import { environment } from '../../../environment';
import { BOOK004Req, Book004Tranrq } from '../interfaces/BOOK004Req.interface';
import { Observable } from 'rxjs';
import { BOOK004Res } from '../interfaces/BOOK004Res.interface';
import { HttpWithRetry } from './http-with-retry.service';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    http = inject(HttpWithRetry);

    onCancelBookingUrl = `${environment.BASE_URL}/bookings/cancel`;

    /**
     * BOOK-001 建立訂單
     * @param tranrq 訂單資訊與詳細內容
     * @returns
     */
    createOrder(tranrq: BOOK001Tranrq) {

        const header: Mwheader = {
            MSGID: 'BOOK-001'
        };

        const postData: Req<BOOK001Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<BOOK001Tranrs>>('http://localhost:8080/bookings/create', postData, {
            withCredentials: true
        });
    }

    /**
     * BOOK-002 取得該筆訂單
     * @param orderId 訂單編號
     * @returns
     */
    getOrder(orderId: string) {

        const header: Mwheader = {
            MSGID: 'BOOK-002'
        };

        const tranrq: BOOK002Tranrq = {
            order_id: orderId
        }


        const postData: Req<BOOK002Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<BOOK002Tranrs>>('http://localhost:8080/bookings/detail', postData);
    }

    /**
     * BOOK-005 組合付款參數 (現場付款)
     * @param tranrq 信用卡相關資訊
     * @returns
     */
    getAuthorizeParams(tranrq: BOOK005Tranrq) {

        const header: Mwheader = {
            MSGID: 'BOOK-005'
        };

        const postData: Req<BOOK005Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<BOOK005Tranrs>>('http://localhost:8080/bookings/authorize', postData);
    }

    /**
     * BOOK-006 組合付款參數 (線上刷卡)
     * @param orderId 訂單編號
     * @returns
     */
    getCreditParams(orderId: string) {

        const header: Mwheader = {
            MSGID: 'BOOK-006'
        };

        const tranrq: BOOK006Tranrq = {
            order_id: orderId
        }


        const postData: Req<BOOK006Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<BOOK006Tranrs>>('http://localhost:8080/bookings/credit', postData);
    }

    /**
     * BOOK-013 模擬更新訂單付款狀態 (線上刷卡)
     * @param orderId 訂單編號
     * @returns
     */
    updatePayStatus(orderId: string) {

        const header: Mwheader = {
            MSGID: 'BOOK-013'
        };

        const tranrq: BOOK013Tranrq = {
            order_id: orderId
        }

        const postData: Req<BOOK013Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<object>>('http://localhost:8080/bookings/simulate/notify', postData);
    }

    /** 初始的建立訂單前的相關資料 */
    sharedOrderData: OrderData = {
        propertyId: '',
        checkIn: '',
        checkOut: '',
        rooms: []
    };

    /**
     * 設定建立訂單前的相關資料
     * @param data 建立訂單前的相關資料
     */
    setSharedOrderData(data: OrderData): void {
        this.sharedOrderData = data;
    }

    /**
     * 取得建立訂單前的相關資料
     * @returns 相關資料
     */
    getSharedOrderData(): OrderData {
        return this.sharedOrderData;
    }

    /**
     * 清除建立訂單前的相關資料
     */
    clearSharedOrderData(): void {
        this.sharedOrderData = {
            propertyId: '',
            checkIn: '',
            checkOut: '',
            rooms: []
        };
    }

    /**
     * 取消訂單 API
     * @param postData
     * @returns
     */
    onCancelBookingApi(postData: BOOK004Req): Observable<BOOK004Res> {
        return this.http.post<BOOK004Res>(this.onCancelBookingUrl, postData, {
            withCredentials: true
        })
    }


}

export interface OrderData {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    rooms: OrderRoom[];
}

export interface OrderRoom {
    roomId: string;
    roomName: string;
    roomPrice: number;
    roomQuantity: number;
    roomTotal: number;
    expanded: boolean;
}
