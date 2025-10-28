import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Res } from '../interfaces/Res.interface';
import { USER004Tranrs } from '../interfaces/USER004Res.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    http = inject(HttpClient);

    /**
     * USER-004 取得會員資訊
     * @returns
     */
    getUserInfo(): Observable<Res<USER004Tranrs>> {
        return this.http.post<Res<USER004Tranrs>>('http://localhost:8080/user/get', {}, {
            withCredentials: true
        });
    }

}
