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

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
    loginForm!: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    private getRedirectUrl(): string {
        // 先看 query param
        const q = this.route.snapshot.queryParamMap.get('redirect');
        // 或從 navigation state（可當備援）
        const s = history.state?.redirect as string | undefined;
        // 預設首頁
        return q || s || '/';
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    get emailControl() {
        return this.loginForm.get('email');
    }
    get passwordControl() {
        return this.loginForm.get('password');
    }

    getErrorMessage(ctrl: 'email'|'password'): string {
        const c = this.loginForm.get(ctrl);
        if (c?.hasError('required')) return `${ctrl === 'email' ? '信箱' : '密碼'}為必填欄位`;
        if (ctrl === 'email' && c?.hasError('email')) return '請輸入有效的信箱格式';
        if (ctrl === 'password' && c?.hasError('minlength')) return '密碼至少需要 6 個字元';
        return '';
    }

    onLogin() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.invalid) { this.errorMessage = '請正確填寫所有欄位'; return; }

        this.errorMessage = '';
        this.isLoading = true;

        const payload: AUTH002Req = {
        MWHEADER: { MSGID: 'AUTH-002' },
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
                this.router.navigateByUrl(redirect, {
                    replaceUrl: true
                });
            } else {
            this.errorMessage = '登入失敗';
            }
        },
        error: () => { this.errorMessage = '發生錯誤，請稍後再試'; this.isLoading = false; }
        });
    }
}
