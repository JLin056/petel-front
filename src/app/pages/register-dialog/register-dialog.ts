import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AUTH001Res } from '../../core/interfaces/AUTH001Res.interface';
import { Auth } from '../../core/services/auth.service';
import { AUTH001Req } from '../../core/interfaces/AUTH001Req.interface';

@Component({
  selector: 'app-register-dialog',
  imports: [
    CommonModule,
    Dialog,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule
],
  templateUrl: './register-dialog.html',
  styleUrl: './register-dialog.css'
})
export class RegisterDialog {
    /** visible */
    @Input() visible = false;
    /** visibleChange */
    @Output() visibleChange = new EventEmitter<boolean>();
    /** goLogin */
    @Output() goLogin = new EventEmitter<void>();
    /** registerSuccess */
    @Output() registerSuccess = new EventEmitter<AUTH001Res>();

    /**
     * 注入
     * @param fb
     * @param authService
     * @param messageService
     */
    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private messageService: MessageService
    ) {}

    /** 註冊表單 */
    registerForm!: FormGroup;
    /** isLoading */
    isLoading = false;
    /** errorMessage */
    errorMessage = '';

    /**
     * 密碼驗證
     * @param group
     * @returns
     */
    private passwordsMatch(group: AbstractControl): ValidationErrors | null {
        const pwd = group.get('password')?.value;
        const confirm = group.get('confirm')?.value;
        return pwd && confirm && pwd !== confirm ? { passwordsMismatch: true } : null;
    }

    /**
     * 初始化表單
     */
    private initForm(): void {
        this.registerForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirm: ['', [Validators.required]]
            },
            {
                validators: this.passwordsMatch.bind(this)
            }
        );
    }

    /**
     * 取 email
     * @readonly
     * @memberof RegisterDialog
     */
    get emailControl() {
        return this.registerForm.get('email');
    }

    /**
     * 取 密碼
     * @readonly
     * @memberof RegisterDialog
     */
    get passwordControl() {
        return this.registerForm.get('password');
    }

    /**
     * 取確認密碼
     * @readonly
     * @memberof RegisterDialog
     */
    get confirmControl() {
        return this.registerForm.get('confirm');
    }

    /**
     * 清空表單
     */
    private clearForm(): void {
        this.registerForm.reset();
        this.errorMessage = '';
        this.isLoading = false;
    }

    /**
     * 關閉 dialog
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
    onRegister(){
        this.registerForm.markAllAsTouched();

        if (this.registerForm.invalid) {
            if (this.registerForm.hasError('passwordsMismatch')) {
                this.errorMessage = '密碼與確認密碼不一致';
            } else {
                this.errorMessage = '請正確填寫所有欄位';
            }
            return;
        }

        this.errorMessage = '';
        this.isLoading = true;

        const payload: AUTH001Req = {
            MWHEADER: {
                MSGID: 'AUTH-001'
            },
            TRANRQ: {
                email: this.registerForm.value.email,
                password: this.registerForm.value.password,
                role: 'user'
            }
        }

        this.authService.onRegisterApi(payload).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    console.log('註冊成功');
                    this.isLoading = false;
                    this.registerSuccess.emit(res);
                    this.onGoLogin();
                } else if (res.MWHEADER.RETURNDESC === 'Email 已被使用') {
                    this.errorMessage = res.MWHEADER.RETURNDESC;
                    this.isLoading = false;
                } else {
                    this.errorMessage = '註冊失敗';
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.log('註冊失敗');
                this.errorMessage = '發生錯誤，請稍後再試';
                this.isLoading = false;
            }
        });
    }

    /**
     * 錯誤訊息
     * @param controlName
     * @returns
     */
    getErrorMessage(controlName: string): string {
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
     * 跳轉登入頁
     */
    onGoLogin() {
        this.onHideDialog();
        this.goLogin.emit();
    }

    /**
     * 初始化表單
     */
    ngOnInit(): void {
        this.initForm();
    }
}
