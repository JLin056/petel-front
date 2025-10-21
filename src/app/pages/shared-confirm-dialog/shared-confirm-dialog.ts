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
    /** visible */
    @Input() visible = false;
    /** 標題 */
    @Input() header: string = '確認';
    /** 內文 */
    @Input() message: string = '是否確定？';
    /** 按鈕字 */
    @Input() confirmLabel:string = '確定';
    /** 按鈕字 */
    @Input() cancelLabel:string = '取消';
    /** visibleChange */
    @Output() visibleChange = new EventEmitter<boolean>();
    /** confirm */
    @Output() confirm = new EventEmitter<void>();
    /** cancel */
    @Output() cancel = new EventEmitter<void>();

    /**
     * 確認按鈕
     */
    onConfirm() {
        this.confirm.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }

    /**
     * 取消按鈕
     */
    onCancel() {
        this.cancel.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }

    /**
     * 隱藏 dialog
     */
    onDialogHide() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }
}
