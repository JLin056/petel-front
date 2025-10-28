import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../core/services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AUTH005Req } from '../../core/interfaces/AUTH005Req.interface';

@Component({
    selector: 'app-reset-password-page',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, DialogModule, PasswordModule, MessageModule, ButtonModule],
    templateUrl: './reset-password-page.html',
    styleUrl: './reset-password-page.css'
})
export class ResetPasswordPage {
    /** Reactive Form */
    resetForm: FormGroup;
    /** submitted */
    submitted = false;
    /** isLoading */
    isLoading = false;
    /** errorMessage */
    errorMessage = '';

    /** token */
    token = '';
    /** successDialogVisible */
    successDialogVisible = false;
    /** redirectTimer */
    redirectTimer?: ReturnType<typeof setTimeout>;

    /**
     * 注入
     * @param fb
     * @param route
     * @param router
     * @param auth
     * @param toast
     */
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth,
        private toast: MessageService
    ) {
        this.resetForm = this.fb.group(
        {
            password: [
            '',
            [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(64),
            ],
            ],
            confirmPassword: ['', Validators.required],
        },
        { validators: this.passwordsMatch }
        );
    }

    /**
     * 取得 密碼
     * @readonly
     * @type {(AbstractControl | null)}
     * @memberof ResetPasswordPage
     */
    get password(): AbstractControl | null {
        return this.resetForm.get('password');
    }

    /**
     * 取得 忘記密碼
     * @readonly
     * @type {(AbstractControl | null)}
     * @memberof ResetPasswordPage
     */
    get confirmPassword(): AbstractControl | null {
        return this.resetForm.get('confirmPassword');
    }
    /** form?.errors */
    get form(): FormGroup {
        return this.resetForm;
    }

    /**
     * 驗證密碼一致
     * @param group
     * @returns
     */
    passwordsMatch(group: AbstractControl): ValidationErrors | null {
        const pw = group.get('password')?.value;
        const cpw = group.get('confirmPassword')?.value;
        return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
    }

    /**
     * 重設密碼
     * @returns
     */
    onReset(): void {
        this.submitted = true;
        this.resetForm.markAllAsTouched();

        if (!this.token) {
            this.toast.add({ severity: 'error', summary: '連結無效', detail: '請從重設密碼信件重新進入' });
            return;
        }
        if (this.resetForm.invalid) {
            this.toast.add({ severity: 'warn', summary: '送出失敗', detail: '請正確填寫欄位' });
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const newPassword = this.password?.value as string;

        const payload: AUTH005Req = {
            MWHEADER: {
                MSGID: 'AUTH-005'
            },
            TRANRQ: {
                token: this.token,
                newPassword: this.resetForm.value.password
            }
        };

        this.auth.onResetPassword(payload).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.toast.add({
                        severity: 'success',
                        summary: '重設成功',
                        detail: '將於 3 秒後自動帶您回登入頁',
                        life: 300
                    });
                    this.redirectTimer = setTimeout(() => {
                        this.router.navigate(['login']);
                    }, 3000);
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: '重設失敗',
                        detail: '請稍後再試'
                    });
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.toast.add({
                    severity: 'error',
                    summary: '重設失敗',
                    detail: '請稍後再試'
                })
            }
        });
    }

    /**
     * 前往登入頁
     */
    goLogin(): void {
        this.successDialogVisible = false;
        this.router.navigate(['login']);
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.route.queryParams.subscribe((p) => {
        this.token = p['token'] ?? '';
        });
    }
}
