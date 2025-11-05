import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AUTH002Req } from '../../core/interfaces/AUTH002Req.interface';
import { Auth } from '../../core/services/auth.service';
import { MessageModule } from 'primeng/message';
import { finalize, take } from 'rxjs';

@Component({
    selector: 'app-admin-login-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
    templateUrl: './admin-login-page.html',
    styleUrl: './admin-login-page.css'
})
export class AdminLoginPage implements OnInit {
    /** 登入表單 */
    loginForm!: FormGroup;
    /** 是否還在跑 */
    isLoading = false;

    /**
     * 注入
     */
    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private route: ActivatedRoute,
        private router: Router,
        private toast: MessageService
    ) { }

    /**
     * 取得 email
     */
    get emailControl() {
        return this.loginForm.get('email');
    }

    /**
     * 取得密碼
     */
    get passwordControl() {
        return this.loginForm.get('password');
    }

    /**
     * 錯誤訊息
     */
    getErrorMessage(ctrl: 'email' | 'password'): string {
        const c = this.loginForm.get(ctrl);
        if (c?.hasError('required')) return `${ctrl === 'email' ? '信箱' : '密碼'}為必填欄位`;
        if (ctrl === 'email' && c?.hasError('email')) return '請輸入有效的信箱格式';
        if (ctrl === 'password' && c?.hasError('minlength')) return '密碼至少需要 6 個字元';
        return '';
    }

    /**
     * 取消登入，返回首頁
     */
    onCancel() {
        this.router.navigate(['']);
    }

    /**
     * 登入
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
                role: 'admin'
            }
        };

        this.authService.onLoginApi(payload).pipe(
            take(1),
            finalize(() => (this.isLoading = false))
        ).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
                    // console.log('=== 管理員登入成功 ===');

                    this.toast.add({
                        severity: 'success',
                        summary: '登入成功',
                        detail: '歡迎回來，管理員！'
                    });

                    // 導向管理員後台首頁（會員列表）
                    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/admin/userTable';
                    this.router.navigate([redirect]);
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: '登入失敗',
                        detail: res.MWHEADER.RETURNDESC || '帳號或密碼錯誤'
                    });
                }
            },
            error: (err) => {
                this.isLoading = false;
                // console.error('登入錯誤:', err);
                this.toast.add({
                    severity: 'error',
                    summary: '系統錯誤',
                    detail: '請稍後再試'
                });
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
