import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { LoginDialog } from '../../../pages/login-dialog/login-dialog';
import { RegisterDialog } from '../../../pages/register-dialog/register-dialog';
import { ForgotPasswordDialog } from '../../../pages/forgot-password-dialog/forgot-password-dialog';
import { Auth } from '../../../core/services/auth.service';
import { SharedConfirmDialog } from '../../../pages/shared-confirm-dialog/shared-confirm-dialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

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
    LoginDialog,
    RegisterDialog,
    ForgotPasswordDialog,
    SharedConfirmDialog
],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
    /** loginDialogVisible */
    loginDialogVisible = false;
    /** registerDialogVisible */
    registerDialogVisible = false;
    /** forgotDialogVisible */
    forgotDialogVisible = false;
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
    ) {}

    /**
     * 跳出 login 框
     */
    showLogin() {
        this.loginDialogVisible = true;
    }

    /**
     * login 成功
     */
    onLoginSuccess() {
        this.isLoggedIn = true;
        this.loginDialogVisible = false;
    }

    /**
     * 跳出註冊框
     */
    showRegister() {
        this.registerDialogVisible = true;
    }

    /**
     * 轉到註冊框
     */
    openRegister() {
        this.loginDialogVisible = false;
        this.registerDialogVisible = true;
    }

    /**
     * 打開 login 框
     */
    openLogin() {
        this.registerDialogVisible = false;
        this.loginDialogVisible = true;
    }

    /**
     * 轉到 忘記密碼 框
     */
    openForgot() {
        this.loginDialogVisible = false;
        this.forgotDialogVisible = true;
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
            this.loginDialogVisible = true;
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
            this.loginDialogVisible = true;
            return;
        }
        this.router.navigate(['/history']);
    }


    ngOnInit() {
        this.onCheckLoginStatus();
    }

}
