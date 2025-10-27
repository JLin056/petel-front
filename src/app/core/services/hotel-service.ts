import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Tranrq as HOTEL001Tranrq } from '../interfaces/HOTEL001Req.interface';
import { Tranrs as HOTEL001Tranrs } from '../interfaces/HOTEL001Res.interface';
import { HOTEL002Tranrq } from '../interfaces/HOTEL002Req.interface';
import { HOTEL002Tranrs } from '../interfaces/HOTEL002Res.interface';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Res } from '../interfaces/Res.interface';
import { environment } from '../../../environment';


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
            id: propertyId
        };

        const postData: Req<HOTEL002Tranrq> = {
            MWHEADER: header,
            TRANRQ: tranrq
        }

        return this.http.post<Res<HOTEL002Tranrs>>(`${environment.BASE_URL}/hotels/detail`, postData);
    }
}
