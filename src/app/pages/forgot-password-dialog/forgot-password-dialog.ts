import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [Dialog, ButtonModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './forgot-password-dialog.html',
  styleUrl: './forgot-password-dialog.css'
})
export class ForgotPasswordDialog {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    constructor(private confirm: ConfirmationService,
        private toast: MessageService) {}

    email = '';
    password = '';
    loading = false;

    get emailValid(): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    }

    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onSend() {
        if (!this.emailValid) {
            this.toast.add({ severity: 'warn', summary: '請輸入有效的 Email' });
            return;
        }

        this.loading = true;
        this.confirm.confirm({
          header: '已寄出',
          message: `重設密碼連結已寄至 ${this.email}，請前往收信。`,
          icon: 'pi pi-envelope',
          rejectVisible: false,
          acceptLabel: '好',
          accept: () => this.onHideDialog()
        });
    }
}
