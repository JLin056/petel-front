import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { catchError, finalize, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
    private loggingOut = false;

    constructor(
        private route: Router,
        private authService: Auth,
        private toast: MessageService
    ) {}

    showMerchantLogin() {
        const role = this.authService.getRoleSync();
        const loggedIn = !!this.authService.getAccessToken();

        const goLogin = () =>
        this.route.navigate(['/merchants/login'], {
            queryParams: { redirect: '/merchants/userPage' }
        });

        const goPortal = () =>
        this.route.navigate(['/merchants/userPage']);

        /** 根據角色決策 */
        const decide = (r: string | null): void => {
            if (r === 'seller') {
                // 商家帳號 → 直接進後台
                goPortal();
                return;
            }
            if (r === 'user' || r === 'admin') {
                // 一般或管理員 → 先登出再去商家登入
                if (this.loggingOut) return;
                this.loggingOut = true;
                this.authService
                .forceLogout$()
                .pipe(
                    take(1),
                    finalize(() => (this.loggingOut = false))
                )
                .subscribe(() => {
                    this.toast.add({
                    severity: 'info',
                    summary: '請重新登入',
                    detail: '請使用商家帳號登入後台'
                    });
                    goLogin();
                });
                return;
            }
            // 未登入或沒有角色 → 直接去商家登入
            goLogin();
        };

        // 已有角色或未登入 → 直接判斷
        // 已登入但尚未取得角色（ex. 剛開頁面）→ 先撈 /auth/me 補一次再判斷
        if (role || !loggedIn) {
            decide(role);
        } else {
            this.authService
                .onGetInfo()
                .pipe(
                take(1),
                switchMap(() => of(this.authService.getRoleSync()))
                )
                .subscribe(decide);
        }
    }

    showMerchantRegister() {
        this.route.navigate(['merchants/register'])
    }
}
