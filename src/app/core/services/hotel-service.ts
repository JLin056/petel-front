import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environment';
import { Tranrq as HOTEL001Tranrq } from '../interfaces/HOTEL001Req.interface';
import { Tranrs as HOTEL001Tranrs } from '../interfaces/HOTEL001Res.interface';
import { HOTEL002Tranrq } from '../interfaces/HOTEL002Req.interface';
import { HOTEL002Tranrs } from '../interfaces/HOTEL002Res.interface';
import { HOTEL004Tranrq } from '../interfaces/HOTEL004Req.interface';
import { HOTEL004Tranrs } from '../interfaces/HOTEL004Res.interface';
import { Tranrq as HOTEL005Tranrq } from '../interfaces/HOTEL005Req.interface';
import { Tranrs as HOTEL005Tranrs } from '../interfaces/HOTEL005Res.interface';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Res } from '../interfaces/Res.interface';


@Injectable({
    providedIn: 'root'
})
export class HotelService {

    http = inject(HttpClient);

    /**
     * HOTEL-001 查詢旅館列表
     * @param params 查詢條件 (只有 petType 是必填)
     * @returns
     */
    queryHotels(params: {
        petType: string;
        checkIn?: Date;
        checkOut?: Date;
        petCount?: number;
        city?: string;
        priceMin?: number;
        priceMax?: number;
        minRating?: number;
        facilities?: string[];
        pageNumber?: number;
        pageSize?: number;
    }) {
        const header: Mwheader = {
            MSGID: 'HOTEL-001'
        };

        const tranrq: HOTEL001Tranrq = {
            petType: params.petType,
            checkIn: params.checkIn || new Date(),
            checkOut: params.checkOut || new Date(),
            petCount: params.petCount || 1,
            city: params.city || '',
            priceMin: params.priceMin || 0,
            priceMax: params.priceMax || 999999,
            minRating: params.minRating || 0,
            facilities: params.facilities || [],
            page: {
                pageNumber: params.pageNumber || 1,
                pageSize: params.pageSize || 10
            }
        };

        const postData: Req<HOTEL001Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        };

        console.log('=== HOTEL-001 API 請求參數 ===');
        console.log('API URL:', `${environment.BASE_URL}/hotels/query`);
        console.log('請求資料:', JSON.stringify(postData, null, 2));

        return this.http.post<Res<HOTEL001Tranrs>>(`${environment.BASE_URL}/hotels/query`, postData);
    }

    /**
     * HOTEL-002 查詢單筆旅館資訊
     * @param propertyId 旅館編號
     * @returns
     */
    queryHotelDetail(propertyId: string) {

        const header: Mwheader = {
            MSGID: 'HOTEL-002'
        };

        const tranrq: HOTEL002Tranrq = {
            propertyId: propertyId,
        }

        const postData: Req<HOTEL002Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<HOTEL002Tranrs>>(`${environment.BASE_URL}/hotels/detail`, postData);
    }

    /**
     * HOTEL-004 查詢單筆旅館設備資訊
     * @param propertyId 旅館編號
     * @returns
     */
    queryHotelFacilities(propertyId: string) {

        const header: Mwheader = {
            MSGID: 'HOTEL-004'
        };

        const tranrq: HOTEL004Tranrq = {
            propertyId: propertyId,
        }

        const postData: Req<HOTEL004Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<HOTEL004Tranrs>>(`${environment.BASE_URL}/hotels/facilities`, postData);

    }

    /**
     * HOTEL-005 查詢單筆旅館詳細資訊（包含庫存及圖片）
     * @param propertyId 旅館編號 (必填)
     * @param petType 寵物種類 (必填, CAT/DOG)
     * @param checkIn 入住日期 (選填)
     * @param checkOut 退房日期 (選填)
     * @returns
     */
    querySingleHotelDetail(params: {
        propertyId: string;
        petType: string;
        checkIn?: Date;
        checkOut?: Date;
    }) {
        const header: Mwheader = {
            MSGID: 'HOTEL-005'
        };

        const tranrq: HOTEL005Tranrq = {
            propertyId: params.propertyId,
            petType: params.petType,
            checkIn: params.checkIn || new Date(),
            checkOut: params.checkOut || new Date()
        };

        const postData: Req<HOTEL005Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        };

        console.log('=== HOTEL-005 API 請求參數 ===');
        console.log('API URL:', `${environment.BASE_URL}/hotels/singleHotelDetail`);
        console.log('請求資料:', JSON.stringify(postData, null, 2));

        return this.http.post<Res<HOTEL005Tranrs>>(`${environment.BASE_URL}/hotels/singleHotelDetail`, postData);
    }
}

