import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { MEDIA004Req } from '../interfaces/MEDIA004Req.interface';
import { MEDIA004Res } from '../interfaces/MEDIA004Res.interface';
import { MEDIA001Req } from '../interfaces/MEDIA001Req.interface';
import { MEDIA001Res } from '../interfaces/MEDIA001Res.interface';
import { MEDIA002Req } from '../interfaces/MEDIA002Req.interface';
import { MEDIA002Res } from '../interfaces/MEDIA002Res.interface';
import { MEDIA003Req } from '../interfaces/MEDIA003Req.interface';
import { MEDIA003Res } from '../interfaces/MEDIA003Res.interface';
import { Observable } from 'rxjs';
import { HttpWithRetry } from './http-with-retry.service';

@Injectable({
    providedIn: 'root'
})
export class MediaService {

    /**
     * 注入 HttpWithRetry（自動重試 401）
     * @param http
     */
    constructor(private http: HttpWithRetry){}

    /** API URLs */
    uploadMediaUrl = `${environment.BASE_URL}/medias/upload/base64`;
    updateMediaUrl = `${environment.BASE_URL}/medias/update/base64`;
    deleteMediaUrl = `${environment.BASE_URL}/medias/delete/base64`;
    getMediaUrl = `${environment.BASE_URL}/medias/query/base64`;

    /**
     * MEDIA-001 上傳圖片 API
     * @param postData
     * @returns
     */
    uploadMedia(postData: MEDIA001Req): Observable<MEDIA001Res> {
        return this.http.post<MEDIA001Res>(this.uploadMediaUrl, postData, {
            withCredentials: true
        });
    }

    /**
     * MEDIA-002 修改圖片 API
     * @param postData
     * @returns
     */
    updateMedia(postData: MEDIA002Req): Observable<MEDIA002Res> {
        return this.http.post<MEDIA002Res>(this.updateMediaUrl, postData, {
            withCredentials: true
        });
    }

    /**
     * MEDIA-003 刪除圖片 API
     * @param postData
     * @returns
     */
    deleteMedia(postData: MEDIA003Req): Observable<MEDIA003Res> {
        return this.http.post<MEDIA003Res>(this.deleteMediaUrl, postData, {
            withCredentials: true
        });
    }

    /**
     * MEDIA-004 取得資料庫圖片 API
     * @param postData
     * @returns
     */
    onGetMediaApi(postData: MEDIA004Req): Observable<MEDIA004Res> {
        return this.http.post<MEDIA004Res>(this.getMediaUrl, postData, {
            withCredentials: true
        })
    }

}
