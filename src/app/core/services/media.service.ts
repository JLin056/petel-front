import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { MEDIA004Req } from '../interfaces/MEDIA004Req.interface';
import { MEDIA004Res } from '../interfaces/MEDIA004Res.interface';
import { MEDIA001Req } from '../interfaces/MEDIA001Req.interface';
import { MEDIA001Res } from '../interfaces/MEDIA001Res.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MediaService {

    /**
     * 注入
     * @param http
     */
    constructor(private http: HttpClient){}

    /** 上傳圖片 API URL */
    uploadMediaUrl = `${environment.BASE_URL}/medias/upload/base64`;
    /** 取得 資料庫圖片 API URL */
    getMediaUrl = `${environment.BASE_URL}/medias/query/base64`;

    /**
     * 上傳圖片 API
     * @param postData
     * @returns
     */
    uploadMedia(postData: MEDIA001Req): Observable<MEDIA001Res> {
        return this.http.post<MEDIA001Res>(this.uploadMediaUrl, postData, {
            withCredentials: true
        });
    }

    /**
     * 取得資料庫圖片 API
     * @param postData
     * @returns
     */
    onGetMediaApi(postData: MEDIA004Req): Observable<MEDIA004Res> {
        return this.http.post<MEDIA004Res>(this.getMediaUrl, postData, {
            withCredentials: true
        })
    }

}
