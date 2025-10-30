import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { MEDIA004Req } from '../interfaces/MEDIA004Req.interface';
import { MEDIA004Res } from '../interfaces/MEDIA004Res.interface';
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

    /** 取得 資料庫圖片 API URL */
    getMediaUrl = `${environment.BASE_URL}/medias/query/base64`;

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
