import { Mwheader } from './../../core/interfaces/AUTH002Res.interface';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AUTH004Req } from '../../core/interfaces/AUTH004Req.interface';

@Component({
    selector: 'app-forgot-password-page',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, DialogModule, MessageModule, ButtonModule],
    templateUrl: './forgot-password-page.html',
    styleUrl: './forgot-password-page.css'
})
export class ForgotPasswordPage {
    /** Reactive Form */
    forgotPasswordForm: FormGroup;
    /** submitted */
    submitted = false;
    /** isLoading */
    isLoading = false;
    /** errorMessage */
    errorMessage = '';

    /** 模擬郵件 dialog */
    emailDialogVisible = false;

    /** resetPasswordUrl */
    resetPasswordUrl = '';

    /**
     * 注入
     * @param fb
     * @param router
     * @param auth
     * @param toast
     */
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private auth: Auth,
        private toast: MessageService
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    /**
     * 取得 email
     * @readonly
     * @type {(AbstractControl | null)}
     * @memberof ForgotPasswordPage
     */
    get email(): AbstractControl | null {
        return this.forgotPasswordForm.get('email');
    }

    /**
     * 取得 formGroup，供 form.error 使用
     * @readonly
     * @type {FormGroup}
     * @memberof ForgotPasswordPage
     */
    get form(): FormGroup {
        return this.forgotPasswordForm;
    }

    /**
     * 忘記密碼
     * @returns
     */
    onForgot(): void {
        this.submitted = true;
        this.forgotPasswordForm.markAllAsTouched();

        if (this.forgotPasswordForm.invalid){
            this.toast.add({ severity: 'warn', summary: '發送失敗', detail: '請輸入有效的電子信箱' });
            return;
        };

        this.isLoading = true;
        this.errorMessage = '';

        const emailValue = this.email?.value as string;

        const payload: AUTH004Req = {
            MWHEADER: {
                MSGID: 'AUTH-004'
            },
            TRANRQ: {
                email: this.forgotPasswordForm.value.email
            }
        };

        this.auth.onForgotPassword(payload).subscribe({
            next: (res) => {
                this.isLoading = false;

                if (res.MWHEADER.RETURNCODE && res.MWHEADER.RETURNCODE !== '0000') {
                    this.toast.add({
                        severity: 'error',
                        summary: '發送失敗',
                        detail: '請稍後再試'
                    });
                    return;
                }

                this.resetPasswordUrl = res.TRANRS?.resetUrl ?? '';
                if (!this.resetPasswordUrl) {
                    this.toast.add({
                        severity: 'error',
                        summary: '發送失敗',
                        detail: '請稍後再試'
                    });
                    return;
                }

                this.toast.add({
                    severity: 'success',
                    summary: '寄送成功',
                    detail: '重設密碼連結已寄出！'
                });

                this.emailDialogVisible = true;
            },
            error: () => {
                this.isLoading = false;
                this.toast.add({
                        severity: 'error',
                        summary: '發送失敗',
                        detail: '請稍後再試'
                });
            }
        });
    }

    /**
     * 前往 重設密碼頁。並攜帶 token
     * @returns
     */
    goToResetPassword(): void {
        this.emailDialogVisible = false;
        try {
            const url = new URL(this.resetPasswordUrl);
            const token = url.searchParams.get('token');

            const isMerchant = this.router.url.includes('/merchant/userPage');

            if (token) {
                if (isMerchant) {
                    this.router.navigate(['/merchant/userPage/resetPassword'], { queryParams: { token } });
                } else {
                    this.router.navigate(['resetPassword'], { queryParams: { token } });
                }
                return;
            }
        } catch {
            window.location.href = this.resetPasswordUrl;
        }
    }

    /**
     * 前往登入頁
     */
    goLogin(): void {
        const url = this.router.url;
        if (url.includes('merchanys/userPage')) {
            this.router.navigate(['/merchant/userPage/login'])
        } else {
            this.router.navigate(['login']);
        }
    }
}
