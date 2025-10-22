import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BOOK001Tranrs } from '../interfaces/BOOK001Res.interface';
import { BOOK002Tranrq } from '../interfaces/BOOK002Req.interface';
import { BOOK002Tranrs } from '../interfaces/BOOK002Res.interface';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Res } from '../interfaces/Res.interface';
import { BOOK001Tranrq } from './../interfaces/BOOK001Req.interface';
import { BOOK006Tranrq } from '../interfaces/BOOK006Req.interface';
import { BOOK006Tranrs } from '../interfaces/BOOK006Res.interface';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    http = inject(HttpClient);

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
}
