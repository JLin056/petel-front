import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth.service';
import { SharedConfirmDialog } from '../../../pages/shared-confirm-dialog/shared-confirm-dialog';
import { MessageService } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    SharedConfirmDialog
],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
    /** 確認登入狀態 */
    isLoggedIn = false; /** 確認登入狀態 */
    /** confirmVisible */
    confirmVisible = false;

    /**
     * 注入
     * @param router
     * @param authService
     * @param toast
     */
    constructor(
        private router: Router,
        private authService: Auth,
        private toast: MessageService
    ) {
        this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => this.onCheckLoginStatus());
    }

    /**
     * 跳出 login
     */
    onClickLogin() {
        this.router.navigate(['/login']);
    }

    onLogout() {
        this.authService.onLogoutApi().subscribe({
            next: (res) => {
                this.isLoggedIn = false;
                this.confirmVisible = false;
                console.log('登出成功');
            },
            error: (err) => {
                this.confirmVisible = false;

                this.toast.add({
                    severity: 'error',
                    summary: '登出失敗',
                    detail: '請稍後再試'
                });
            }
        });
    }

    onCheckLoginStatus() {
        this.authService.onCheckLoginStatus().subscribe({
            next: (res) => {
                if (res.TRANRS.valid) {
                    this.isLoggedIn = true;
                } else {
                    this.isLoggedIn = false;
                }
            },
            error: () => {
                this.isLoggedIn = false;
            }
        });
    }

    onClickHome() {
        this.router.navigate(['']);
    }

    onClickDog() {
        this.router.navigate(['/dogHotels']);
    }

    onClickChat() {
        if (!this.isLoggedIn) {
            this.toast.add({
                severity: 'warn',
                summary: '尚未登入',
                detail: '請先登入後再使用聊天室功能'
            });
            this.router.navigate(['/login'], { queryParams: { redirect: '/chat' } });
            return;
        }
        this.router.navigate(['/chat']);
    }

    onClickProfile() {
        if (!this.isLoggedIn) {
            this.toast.add({
                severity: 'warn',
                summary: '尚未登入',
                detail: '請先登入後再看會員資訊'
            });
            this.router.navigate(['/login'], { queryParams: { redirect: '/history' } });
            return;
        }
        this.router.navigate(['/history']);
    }


    ngOnInit() {
        this.onCheckLoginStatus();
    }

}
