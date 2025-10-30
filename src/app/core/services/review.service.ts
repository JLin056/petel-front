import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { REVIEW001Req } from '../interfaces/REVIEW001Req.interface';
import { Observable } from 'rxjs';
import { REVIEW001Res } from '../interfaces/REVIEW001Res.interface';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    /** 注入 HttpClient */
    constructor(private http: HttpClient) { }

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
