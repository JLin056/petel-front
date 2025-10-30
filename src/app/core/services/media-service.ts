import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Res } from '../interfaces/Res.interface';
import { MEDIA004Res } from '../interfaces/MEDIA004Res.interface';

@Injectable({
    providedIn: 'root'
})
export class MediaService {

    http = inject(HttpClient);

    /**
     * MEDIA-004 查詢 Base64 圖片資料
     * @param params 查詢參數
     * @returns
     */
    queryMedia(params: {
        mediaIds?: string[];
        propertyId?: string;
        roomId?: string;
        accountId?: string;
        bucket?: string;
    }) {
        return this.http.post<Res<MEDIA004Res>>('http://localhost:8080/medias/query/base64', {
            MWHEADER: {
                MSGID: 'MEDIA-004'
            },
            TRANRQ: {
                mediaIds: params.mediaIds,
                propertyId: params.propertyId,
                roomId: params.roomId,
                accountId: params.accountId,
                bucket: params.bucket
            }
        });
    }
}
