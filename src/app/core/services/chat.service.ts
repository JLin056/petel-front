import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { CHAT002Req } from '../interfaces/CHAT002Req.interface';
import { Observable } from 'rxjs';
import { CHAT002Res } from '../interfaces/CHAT002Res.interface';
import { CHAT003Req } from '../interfaces/CHAT003Req.interface';
import { CHAT003Res } from '../interfaces/CHAT003Res.interface';
import { CHAT001Req } from '../interfaces/CHAT001Req.interface';
import { CHAT001Res } from '../interfaces/CHAT001Res.interface';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    /** 注入 HttpClient */
    constructor(private http: HttpClient){}

    /** 建立聊天室 URL */
    createChatRoomUrl = `${environment.BASE_URL}/chat/create`;
    /** 取得聊天室列表 URL */
    getThreadUrl = `${environment.BASE_URL}/chat/threads`;
    /** 取得單間訊息紀錄 URL */
    getMessageUrl = `${environment.BASE_URL}/chat/threads/get`;

    /** headers */
    private readonly headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    /**
     * 建立聊天室
     * @param postData
     * @returns
     */
    onCreateChatRoomApi(postData: CHAT001Req): Observable<CHAT001Res> {
        return this.http.post<CHAT001Res>(this.createChatRoomUrl, postData, {
            headers: this.headers,
            withCredentials: true
        })
    }

    /**
     * 取得聊天室列表
     * @param postData
     * @returns
     */
    onGetThreadApi(postData: CHAT002Req): Observable<CHAT002Res> {
        return this.http.post<CHAT002Res>(this.getThreadUrl, postData, {
            headers: this.headers,
            withCredentials: true
        })
    }

    /**
     * 取得單間聊天室訊息內容
     * @param postData
     * @returns
     */
    onGetMessageApi(postData: CHAT003Req): Observable<CHAT003Res> {
        return this.http.post<CHAT003Res>(this.getMessageUrl, postData, {
            headers: this.headers,
            withCredentials: true
        })
    }
}
