import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    http = inject(HttpClient);

    /**
     * BOOK-002 查詢單筆旅館資訊
     * @param propertyId 旅館編號
     * @returns
     */
    queryHotelDetail(propertyId: string) {
        // return this.http.post<STORETranrs<STOREQ001Tranrs>>('http://localhost:8080/hotels/detail', {
        //     "MWHEADER": {
        //         "MSGID": "HOTEL-002"
        //     },
        //     "TRANRQ": {
        //         "id": propertyId
        //     }
        // });
    }
}
