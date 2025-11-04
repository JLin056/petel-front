import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth.service';
import { AUTH001Req } from '../../core/interfaces/AUTH001Req.interface';
import { AUTH001Res } from '../../core/interfaces/AUTH001Res.interface';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-merchant-register-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './merchant-register-page.html',
  styleUrl: './merchant-register-page.css'
})
export class MerchantRegisterPage {
/** 註冊表單 */
    registerForm!: FormGroup;
    /** 是否還在跑 */
    isLoading = false;
    /** 錯誤訊息 */
    errorMessage = '';

    /**
     * 注入
     * @param fb
     * @param authService
     * @param router
     * @param toast
     */
    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private router: Router,
        private toast: MessageService
    ) {}

    /**
     * 驗證密碼是否一致
     * @param group
     * @returns
     */
    private passwordsMatch(group: AbstractControl): ValidationErrors | null {
        const passCtrl = group.get('password');
        const confirmCtrl = group.get('confirm');
        if (!passCtrl || !confirmCtrl) return null;

        const pass = passCtrl.value;
        const confirm = confirmCtrl.value;
        const currentErrors = confirmCtrl.errors || {};

        if (pass && confirm && pass !== confirm) {
            confirmCtrl.setErrors({ ...currentErrors, passwordsMismatch: true });
            return { passwordsMismatch: true };
        } else {
            if ('passwordsMismatch' in currentErrors) {
                const { passwordsMismatch, ...rest } = currentErrors;
                confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
            }
            return null;
        }
    }

    /**
     * 取得 email
     * @readonly
     * @memberof RegisterPage
     */
    get emailControl() {
        return this.registerForm.get('email');
    }

    /**
     * 取得密碼
     * @readonly
     * @memberof RegisterPage
     */
    get passwordControl() {
        return this.registerForm.get('password');
    }

    /**
     * 取得確認密碼
     * @readonly
     * @memberof RegisterPage
     */
    get confirmControl()  {
        return this.registerForm.get('confirm');
    }

    /**
     * 錯誤訊息
     * @param controlName
     * @returns
     */
    getErrorMessage(controlName: 'email' | 'password' | 'confirm'): string {
        const control = this.registerForm.get(controlName);
        if (control?.hasError('required')) {
        if (controlName === 'email') return '信箱為必填欄位';
        if (controlName === 'password') return '密碼為必填欄位';
        if (controlName === 'confirm') return '確認密碼為必填欄位';
        }
        if (controlName === 'email' && control?.hasError('email')) {
            return '請輸入有效的信箱格式';
        }
        if (controlName === 'password' && control?.hasError('minlength')) {
            return '密碼至少需要 6 個字元';
        }
        if (controlName === 'confirm' && this.registerForm.hasError('passwordsMismatch') && control?.touched) {
            return '密碼與確認密碼不一致';
        }
        return '';
    }

    /**
     * 前往登入頁
     */
    goLoginPage() {
        this.router.navigate(['merchants/userPage/login']);
    }

    /**
     * 註冊
     * @returns
     */
    onRegister() {
        this.registerForm.markAllAsTouched();
        if (this.registerForm.invalid) {
        this.errorMessage = this.registerForm.hasError('passwordsMismatch')
            ? '密碼與確認密碼不一致'
            : '請正確填寫所有欄位';
            this.toast.add({
                severity: 'warn',
                summary: '註冊失敗',
                detail: this.errorMessage
            })
        return;
        }

        this.isLoading = true;

        const payload: AUTH001Req = {
        MWHEADER: { MSGID: 'AUTH-001' },
        TRANRQ: {
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            role: 'seller'
        }
        };

        this.authService.onRegisterApi(payload).subscribe({
            next: (res: AUTH001Res) => {
                this.isLoading = false;

                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.toast.add({ severity: 'success', summary: '註冊成功', detail: '請使用新帳號登入' });
                    this.router.navigateByUrl('merchants/userPage/login', { replaceUrl: true });
                } else if (res.MWHEADER.RETURNDESC === 'Email 已被使用') {
                    this.toast.add({ severity: 'error', summary: '註冊失敗', detail: 'Email 已被使用' });
                } else {
                    this.toast.add({ severity: 'error', summary: '註冊失敗', detail: '請稍後再試' });
                }
            },
            error: () => {
                this.isLoading = false;
                this.toast.add({ severity: 'error', summary: '系統錯誤', detail: '請稍後再試' });
            }
        });
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.registerForm = this.fb.group(
        {
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirm: ['', [Validators.required]]
        },
        { validators: this.passwordsMatch.bind(this) }
        );
    }
}

