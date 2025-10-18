import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-dialog',
  imports: [Dialog, ButtonModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './login-dialog.html',
  styleUrl: './login-dialog.css'
})
export class LoginDialog {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    email = '';
    password = '';

    onHideDialog() {
        this.visibleChange.emit(false);
    }

    onLogin(){
        if (!this.email || !this.password) return;

    }
}
