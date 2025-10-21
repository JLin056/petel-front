import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-confirm-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './shared-confirm-dialog.html',
  styleUrl: './shared-confirm-dialog.css'
})
export class SharedConfirmDialog {
    @Input() visible = false;

    @Input() header: string = '確認';               // 標題
    @Input() message: string = '是否確定？';         // 內文

    @Input() confirmLabel:string = '確定';         // 按鈕字
    @Input() cancelLabel:string = '取消';          // 按鈕字

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
        this.visible = false;
    }

    onCancel() {
        this.cancel.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onDialogHide() {
        this.visible = false;
        this.visibleChange.emit(false);
    }
}
