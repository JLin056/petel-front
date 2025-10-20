import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register-dialog',
  imports: [
    CommonModule,
    Dialog,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FormsModule
],
  templateUrl: './register-dialog.html',
  styleUrl: './register-dialog.css'
})
export class RegisterDialog {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() goLogin = new EventEmitter<void>();

    constructor(private messageService: MessageService) {}

    email = '';
    password = '';
    confirm = '';

    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onRegister(){
        if (!this.email || !this.password || !this.confirm) return;
        if (this.password !== this.confirm) {
            this.messageService.add({ severity: 'warn', summary: '密碼不一致', detail: '請重新確認' });
            return;
        }

        // TODO: 串接 API
        this.onHideDialog();
    }

    onGoLogin() {
        this.onHideDialog();
        this.goLogin.emit();
    }
}
