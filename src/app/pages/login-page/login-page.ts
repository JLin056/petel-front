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
import { finalize, take } from 'rxjs';
import { AddUserInfoDialog } from '../add-user-info-dialog/add-user-info-dialog';
import { UserService } from '../../core/services/user.service';
import { USER001Req } from '../../core/interfaces/USER001Req.interface';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, AddUserInfoDialog, MessageModule],
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
    /** 填寫會員資訊 dialog */
    showFillDialog = false;

    dialogName = '';
    dialogPhone = '';
    dialogAvatarUrl: string | null = null;

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
        private userService: UserService,
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

        this.authService.onLoginApi(payload).pipe(
            take(1),
            finalize(() => (this.isLoading = false))
        ).subscribe({
            next: (res: AUTH002Res) => {
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
                    // 判斷是否填寫過會員資訊
                    this.authService.onProfileCheck().subscribe({
                        next: (chk) => {
                            if (chk?.TRANRS?.filled === false) {
                                // 尚未填 → 打開 dialog
                                this.toast.add({
                                    severity: 'info',
                                    summary: '請完成會員資料',
                                    detail: '請填寫姓名與電話以繼續使用服務'
                                })
                                this.showFillDialog = true;
                            } else {
                                // 已填 → 直接導頁
                                const redirect = this.getRedirectUrl();
                                this.toast.add({
                                    severity: 'success',
                                    summary: '登入成功',
                                    detail: '歡迎回來！'
                                });
                                this.router.navigateByUrl(redirect, { replaceUrl: true });
                            }
                        },
                        error: () => {
                            this.toast.add({
                                severity: 'error',
                                summary: '資料檢查失敗',
                                detail: '請稍後再試'
                            });
                        }
                    });
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: '登入失敗',
                        detail: '帳號或密碼錯誤'
                    });
                }
            },
            error: () => {
                this.isLoading = false;
                this.toast.add({ severity: 'error', summary: '系統錯誤', detail: '請稍後再試' });
            }
        });
    }

    /**
     * 送出會員資訊
     */
     onDialogSave(e: { name: string; phone: string; avatarMediaId: string }) {
        const req: USER001Req = {
            MWHEADER: {
                MSGID: 'USER-001'
            },
            TRANRQ: {
                name: e.name,
                phone: e.phone,
                mediaId: e.avatarMediaId
            }
        };

        this.userService.onAddUserApi(req).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.toast.add({ severity: 'success', summary: '會員資料已建立', detail: '感謝您的填寫' });
                    this.showFillDialog = false;
                    const redirect = this.getRedirectUrl();
                    this.router.navigateByUrl(redirect, { replaceUrl: true });
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: '建立失敗',
                        detail: res.MWHEADER.RETURNDESC
                    });
                }
            },
            error: () => {
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
