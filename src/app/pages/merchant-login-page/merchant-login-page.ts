import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AUTH002Req } from '../../core/interfaces/AUTH002Req.interface';
import { USER001Req } from '../../core/interfaces/USER001Req.interface';
import { Auth } from '../../core/services/auth.service';
import { MerchService } from '../../core/services/merch-service';
import { AddSellerInfoDialog } from '../add-seller-info-dialog/add-seller-info-dialog';
import { MERCH009Tranrq } from '../../core/interfaces/MERCH009Req.interface';

@Component({
    selector: 'app-merchant-login-page',
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, AddSellerInfoDialog],
    templateUrl: './merchant-login-page.html',
    styleUrl: './merchant-login-page.css'
})
export class MerchantLoginPage {
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
        private merchService: MerchService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: MessageService
    ) { }


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
    getErrorMessage(ctrl: 'email' | 'password'): string {
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
        // 確保不被阻擋，直接導航
        this.showFillDialog = false; // 如果 dialog 打開，先關閉
        this.router.navigate(['merchants/userPage/register']).then(() => {
            window.scrollTo(0, 0);
        });
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
                role: 'seller'
            }
        };

        this.authService.onLoginApi(payload).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
                    console.log('=== 登入成功 ===');
                    console.log('完整回應:', res);
                    console.log('TRANRS:', res.TRANRS);
                    console.log('accountId:', res.TRANRS.AccountId);
                    if (res.TRANRS.AccountId) {
                        localStorage.setItem('accountId', res.TRANRS.AccountId);
                        console.log('已儲存 accountId 到 localStorage:', res.TRANRS.AccountId);
                    } else {
                        console.error('警告：API 回應中沒有 accountId！');
                    }
                    const savedAccountId = localStorage.getItem('accountId');
                    console.log('驗證儲存結果:', savedAccountId);

                    if (res.TRANRS.accessToken) {
                        localStorage.setItem('token', res.TRANRS.accessToken);
                        this.authService.setAccessToken(res.TRANRS.accessToken);
                    }

                    this.authService.onProfileCheck().subscribe({
                        next: (chk) => {
                            if (chk?.TRANRS?.filled === false) {
                                this.toast.add({
                                    severity: 'info',
                                    summary: '請完成會員資料',
                                    detail: '請填寫姓名與電話以繼續使用服務'
                                });
                                this.showFillDialog = true;
                            } else {
                                // 已填 → 直接導頁
                                this.toast.add({
                                    severity: 'success',
                                    summary: '登入成功',
                                    detail: '歡迎回來！'
                                });
                                this.router.navigate(['/merchants/userPage']);
                            }
                        },
                        error: () => {
                            this.isLoading = false;
                            this.toast.add({
                                severity: 'error',
                                summary: '資料檢查失敗',
                                detail: '請稍後再試'
                            });
                        }
                    })
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
                this.toast.add({
                    severity: 'error',
                    summary: '系統錯誤',
                    detail: '請稍後再試'
                });
            }
        });
    }

    /**
    * 送出會員資訊
    */
    onDialogSave(e: { name: string; phone: string; file?: File | null }) {
        // Step 1: 若有頭貼，先處理上傳（可串真實 API）
        const mediaId = 'M000000001'; // 暫時先寫死或等上傳成功後取得

        const req = {
            name: e.name,
            phone: e.phone,
            mediaId
        };

        this.merchService.createSellerInfo(req).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.toast.add({
                        severity: 'success',
                        summary: '會員資料已建立',
                        detail: '感謝您的填寫'
                    });
                    this.showFillDialog = false;
                    this.router.navigate(['/merchants/userPage']);
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: '建立失敗',
                        detail: res.MWHEADER.RETURNDESC
                    });
                }
            },
            error: () => {
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
