import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';

@Component({
  selector: 'app-update-seller-info-dialog',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './update-seller-info-dialog.html',
  styleUrls: ['./update-seller-info-dialog.css']
})
export class UpdateSellerInfoDialog {
  /** 控制 Dialog 顯示 */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** 接收 user 資料 */
  @Input() user: Partial<MERCH011Tranrs & { avatarUrl?: string | null }> = {};

  /** 事件：儲存 */
  @Output() save = new EventEmitter<{ name: string; phone: string; file: File | null }>();
  /** 事件：取消 */
  @Output() cancel = new EventEmitter<void>();

  loading = false;
  previewFile: string | ArrayBuffer | null = null;
  avatarError = '';
  private file: File | null = null;
  /** formData 用來綁定表單 */
  formData: { name: string; phone: string } = { name: '', phone: '' };

  ngOnChanges() {
    if (this.visible && this.user) {
      this.formData = {
        name: this.user.name || '',
        phone: this.user.phone || ''
      };
      this.previewFile = this.user.avatarUrl || null;
      this.file = null;
      this.avatarError = '';
    }
  }

  /** Dialog 隱藏 */
  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  /** 選擇檔案 */
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
    this.user.avatarUrl = null;
  }

  /** 儲存 */
  onSave(nameCtrl: NgModel, phoneCtrl: NgModel) {
    if (nameCtrl.invalid || phoneCtrl.invalid) {
      nameCtrl.control.markAsTouched();
      phoneCtrl.control.markAsTouched();
      return;
    }

    this.loading = true;
    this.save.emit({
      name: this.formData.name.trim(),
      phone: this.formData.phone.trim(),
      file: this.file
    });
    this.loading = false;
  }
}
