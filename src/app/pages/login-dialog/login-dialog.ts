import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AUTH002Res } from '../../core/interfaces/AUTH002Res.interface';
import { Auth } from '../../core/services/auth.service';
import { AUTH002Req } from '../../core/interfaces/AUTH002Req.interface';

@Component({
    selector: 'app-login-dialog',
    standalone: true,
    imports: [
        CommonModule,
        Dialog,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        ReactiveFormsModule
    ],
    templateUrl: './login-dialog.html',
    styleUrl: './login-dialog.css'
})
export class LoginDialog {
    /** visible */
    @Input() visible = false;
    /** visibleChange */
    @Output() visibleChange = new EventEmitter<boolean>();
    /** forgot */
    @Output() forgot = new EventEmitter<void>();
    /** goRegister */
    @Output() goRegister = new EventEmitter<void>();
    /** loginSuccess */
    @Output() loginSuccess = new EventEmitter<AUTH002Res>();

    /** loginForm */
    loginForm!: FormGroup;
    /** isLoading */
    isLoading = false;
    /** errorMessage */
    errorMessage = '';

    /**
     * 注入
     * @param fb
     * @param authService
     */
    constructor(
        private fb: FormBuilder,
        private authService: Auth
    ) {}

    /**
     * 初始化表單
     */
    private initForm(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    /**
     * 取得 email
     * @readonly
     * @memberof LoginDialog
     */
    get emailControl() {
       return this.loginForm.get('email');
    }

    /**
     * 取得密碼
     * @readonly
     * @memberof LoginDialog
     */
    get passwordControl() {
        return this.loginForm.get('password');
    }

    /**
     * 跳轉忘記密碼
     */
    onForgot() {
        this.onHideDialog();
        this.forgot.emit();
    }

    /**
     * 清空表單
     */
    private clearForm(): void {
        this.loginForm.reset();
        this.errorMessage = '';
        this.isLoading = false;
    }

    /**
     * 關變 dialog
     */
    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.clearForm();
    }

    /**
     * 註冊
     * @returns
     */
    onLogin(){
        this.loginForm.markAllAsTouched();

        if (this.loginForm.invalid) {
            this.errorMessage = '請正確填寫所有欄位';
            return;
        }

        this.errorMessage = '';
        this.isLoading = true;

        const payload: AUTH002Req = {
            "MWHEADER": {
                "MSGID": "AUTH-002"
            },
            "TRANRQ": {
                "email": this.loginForm.value.email,
                "password": this.loginForm.value.password,
                "role": "user"
            }
        }

        this.authService.onLoginApi(payload).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    if (response.TRANRS) {
                        this.isLoading = false;
                        this.loginSuccess.emit(response);
                        this.onHideDialog();
                    }
                } else {
                    this.errorMessage = '登入失敗';
                    this.isLoading = false;
                }
            },
            error: (_error) => {
                this.errorMessage = '發生錯誤，請稍後再試';
                this.isLoading = false;
            }
        })
    }

    /**
     * 取得欄位錯誤訊息
     */
    getErrorMessage(controlName: string): string {
        const control = this.loginForm.get(controlName);

        if (control?.hasError('required')) {
            return `${controlName === 'email' ? '信箱' : '密碼'}為必填欄位`;
        }

        if (control?.hasError('email')) {
            return '請輸入有效的信箱格式';
        }

        if (control?.hasError('minlength')) {
            return '密碼至少需要 6 個字元';
        }

        return '';
    }

    /**
     * 跳轉 註冊頁
     */
    onGoRegister() {
        this.onHideDialog();
        this.goRegister.emit();
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.initForm();
    }
}
