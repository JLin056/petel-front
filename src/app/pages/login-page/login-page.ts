import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../core/services/auth.service';
import { AUTH002Req } from '../../core/interfaces/AUTH002Req.interface';
import { AUTH002Res } from '../../core/interfaces/AUTH002Res.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
    /** 登入表單 */
    loginForm!: FormGroup;
    /** 是否還在跑 */
    isLoading = false;
    /** 錯誤訊息 */
    errorMessage = '';

    /**
     * 注入
     * @param fb
     * @param authService
     * @param route
     * @param router
     * @param toast
     */
    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private route: ActivatedRoute,
        private router: Router,
        private toast: MessageService
    ) {}

    /**
     * 前往之前點擊登入頁的前一頁
     * @returns
     */
    private getRedirectUrl(): string {
        // 先看 query param
        const q = this.route.snapshot.queryParamMap.get('redirect');
        // 或從 navigation state（可當備援）
        const s = history.state?.redirect as string | undefined;
        // 預設首頁
        return q || s || '/';
    }

    /**
     * 取得 email
     * @readonly
     * @memberof LoginPage
     */
    get emailControl() {
        return this.loginForm.get('email');
    }

    /**
     * 取得 密碼
     * @readonly
     * @memberof LoginPage
     */
    get passwordControl() {
        return this.loginForm.get('password');
    }

    /**
     * 錯誤訊息
     * @param ctrl
     * @returns
     */
    getErrorMessage(ctrl: 'email'|'password'): string {
        const c = this.loginForm.get(ctrl);
        if (c?.hasError('required')) return `${ctrl === 'email' ? '信箱' : '密碼'}為必填欄位`;
        if (ctrl === 'email' && c?.hasError('email')) return '請輸入有效的信箱格式';
        if (ctrl === 'password' && c?.hasError('minlength')) return '密碼至少需要 6 個字元';
        return '';
    }

    /**
     * 前往註冊頁
     */
    goRegister() {
        this.router.navigate(['register']);
    }

    /**
     * 前往忘記密碼頁
    */
    goForgotPassword() {
        this.router.navigate(['forgotPassword']);
    }

    /**
     * 登入
     * @returns
     */
    onLogin() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.invalid) {
            this.toast.add({ severity: 'warn', summary: '登入失敗', detail: '請正確填寫所有欄位' });
            return;
        }

        this.isLoading = true;

        const payload: AUTH002Req = {
            MWHEADER: {
                MSGID: 'AUTH-002'
            },
            TRANRQ: {
                email: this.loginForm.value.email,
                password: this.loginForm.value.password,
                role: 'user'
            }
        };

        this.authService.onLoginApi(payload).subscribe({
            next: (res: AUTH002Res) => {
                this.isLoading = false;
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
                    const redirect = this.getRedirectUrl();
                    this.toast.add({ severity: 'success', summary: '登入成功', detail: '歡迎回來！' });
                    this.router.navigateByUrl(redirect, {
                        replaceUrl: true
                    });
                } else {
                    this.toast.add({ severity: 'error', summary: '登入失敗', detail: '帳號或密碼錯誤' });
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
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }
}
