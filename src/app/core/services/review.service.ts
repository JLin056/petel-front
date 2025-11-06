import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { REVIEW001Req } from '../interfaces/REVIEW001Req.interface';
import { Observable } from 'rxjs';
import { REVIEW001Res } from '../interfaces/REVIEW001Res.interface';
import { HttpWithRetry } from './http-with-retry.service';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    /** 注入 HttpWithRetry（自動重試 401） */
    constructor(private http: HttpWithRetry) { }

    addReviewUrl = `${environment.BASE_URL}/review/create`;

    /**
     * 新增評論 API
     * @param postData
     * @returns
     */
    onAddReviceApi(postData: REVIEW001Req): Observable<REVIEW001Res> {
        return this.http.post<REVIEW001Res>(this.addReviewUrl, postData, {
            withCredentials: true
        })
    }

}
