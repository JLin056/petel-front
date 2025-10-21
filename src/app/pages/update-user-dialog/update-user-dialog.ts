import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-user-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './update-user-dialog.html',
  styleUrl: './update-user-dialog.css'
})
export class UpdateUserDialog {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    @Input() user: {accountId: string, name: string, phone: string, avatarUrl: string} | null = null;
    @Output() saved = new EventEmitter<{accountId: string, name: string, phone: string, avatarUrl: string}>();

    // 顯示用欄位
    name = '';
    phone = '';

    // 頭貼處理
    previewFile: File | null = null;
    previewUrl: string | null = null;
    removeAvatarFlag = false;
    avatarError = '';

    loading = false;

    ngOnChanges(): void {
        if (this.user) {
            this.name = this.user.name ?? '';
            this.phone = this.user.phone ?? '';
            this.previewFile = null;
            this.previewUrl = null;
            this.removeAvatarFlag = false;
            this.avatarError = '';
        }
    }

    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onFilePicked(e: Event) {
        this.avatarError = '';
        const input = e.target as HTMLInputElement;
        const f = input.files && input.files[0];
        if (!f) return;

        // 檔案檢核
        if (!f.type.startsWith('image/')) {
            this.avatarError = '檔案格式錯誤，請選擇圖片。';
            input.value = '';
            return;
        }
        if (f.size > 2 * 1024 * 1024) {
            this.avatarError = '檔案過大，請小於 2MB。';
            input.value = '';
            return;
        }

        this.previewFile = f;
        this.previewUrl = URL.createObjectURL(f);
        this.removeAvatarFlag = false;
        input.value = '';
    }

    removeAvatar() {
        this.previewFile = null;
        this.previewUrl = null;
        this.removeAvatarFlag = true;
        this.avatarError = '';
    }

   onSave(nameCtrl: any, phoneCtrl: any) {
        nameCtrl.control.markAsTouched();
        phoneCtrl.control.markAsTouched();
        if (nameCtrl.invalid || phoneCtrl.invalid || this.avatarError) return;

        const nextAvatar =
        this.removeAvatarFlag ? '' : (this.previewUrl ?? this.user?.avatarUrl ?? '');

        const result = {
        accountId: this.user?.accountId ?? '',
        name: this.name.trim(),
        phone: this.phone.trim(),
        avatarUrl: nextAvatar
        };

        this.saved.emit(result);
        this.onHideDialog();
  }
}
