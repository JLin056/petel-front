import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { LoginDialog } from '../../../pages/login-dialog/login-dialog';
import { RegisterDialog } from '../../../pages/register-dialog/register-dialog';
import { ForgotPasswordDialog } from '../../../pages/forgot-password-dialog/forgot-password-dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    LoginDialog,
    RegisterDialog,
    ForgotPasswordDialog
],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
    loginDialogVisible = false;
    registerDialogVisible = false;
    forgotDialogVisible = false;
    showLogin() {
        this.loginDialogVisible = true;
    }

    showRegister() {
        this.registerDialogVisible = true;
    }

    openRegister() {
        this.loginDialogVisible = false;
        this.registerDialogVisible = true;
    }

    openLogin() {
        this.registerDialogVisible = false;
        this.loginDialogVisible = true;
    }

    openForgot() {
        this.loginDialogVisible = false;
        this.forgotDialogVisible = true;
    }

}
