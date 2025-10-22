import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-add-user-info-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
    templateUrl: './add-user-info-dialog.html',
    styleUrl: './add-user-info-dialog.css'
})
export class AddUserInfoDialog {
    /** visible */
    @Input() visible = false;
    /** visibleChange */
    @Output() visibleChange = new EventEmitter<boolean>();

    /** 初始資料 */
    @Input() name = '';
    @Input() phone = '';
    @Input() avatarUrl: string | null = null;

    /** 事件：點「儲存」 */
    @Output() save = new EventEmitter<{ name: string; phone: string; file: File | null }>();
    /** 事件：點「取消」或關閉 */
    @Output() cancel = new EventEmitter<void>();

    loading = false;
    previewFile: string | ArrayBuffer | null = null;
    avatarError = '';
    private file: File | null = null;

    /** dialog 隱藏 */
    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    /** 檔案 */
    onFilePicked(ev: Event) {
        this.avatarError = '';
        const input = ev.target as HTMLInputElement;
        const f = input.files?.[0] ?? null;
        if (!f) return;

        if (!/^image\/(png|jpeg|jpg)$/.test(f.type)) {
            this.avatarError = '只支援 JPG/PNG';
            return;
        }
        if (f.size > 2 * 1024 * 1024) {
            this.avatarError = '檔案大小不可超過 2MB';
            return;
        }
        this.file = f;

        const reader = new FileReader();
        reader.onload = () => (this.previewFile = reader.result);
        reader.readAsDataURL(f);
    }

    /** 移除頭貼 */
    removeAvatar() {
        this.file = null;
        this.previewFile = null;
        this.avatarUrl = null;
    }

    /** 點擊儲存 */
    onSave(nameCtrl: NgModel, phoneCtrl: NgModel) {
        if (nameCtrl.invalid || phoneCtrl.invalid) {
            nameCtrl.control.markAsTouched();
            phoneCtrl.control.markAsTouched();
            return;
        }
        this.loading = true;
        this.save.emit({
            name: this.name.trim(),
            phone: this.phone.trim(),
            file: this.file
        });
        this.loading = false;
    }
}
