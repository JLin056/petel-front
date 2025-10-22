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

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage {
    registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {}

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

  // 交叉欄位驗證：密碼一致
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

  get emailControl()    { return this.registerForm.get('email'); }
  get passwordControl() { return this.registerForm.get('password'); }
  get confirmControl()  { return this.registerForm.get('confirm'); }

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

  goLoginPage() {
    this.router.navigateByUrl('/login');
  }

  onRegister() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this.errorMessage = this.registerForm.hasError('passwordsMismatch')
        ? '密碼與確認密碼不一致'
        : '請正確填寫所有欄位';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const payload: AUTH001Req = {
      MWHEADER: { MSGID: 'AUTH-001' },
      TRANRQ: {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: 'user'
      }
    };

    this.authService.onRegisterApi(payload).subscribe({
      next: (res: AUTH001Res) => {
        this.isLoading = false;
        if (res.MWHEADER.RETURNCODE === '0000') {
          // 註冊成功 → 導向登入頁（或依你需求導向特定頁）
          this.router.navigateByUrl('/login', { replaceUrl: true });
        } else if (res.MWHEADER.RETURNDESC === 'Email 已被使用') {
          this.errorMessage = res.MWHEADER.RETURNDESC;
        } else {
          this.errorMessage = '註冊失敗';
        }
      },
      error: () => {
        this.errorMessage = '發生錯誤，請稍後再試';
        this.isLoading = false;
      }
    });
  }
}
