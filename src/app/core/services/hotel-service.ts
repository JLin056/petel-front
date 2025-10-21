import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HOTEL002Tranrq } from '../interfaces/HOTEL002Req.interface';
import { HOTEL002Tranrs } from '../interfaces/HOTEL002Res.interface';
import { Mwheader, Req } from '../interfaces/Req.interface';
import { Res } from '../interfaces/Res.interface';

@Injectable({
    providedIn: 'root'
})
export class HotelService {

    http = inject(HttpClient);

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

        return this.http.post<Res<HOTEL002Tranrs>>('http://localhost:8080/hotels/detail', postData);
    }
}
