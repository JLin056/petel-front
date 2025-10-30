import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';
import { Media } from '../../core/interfaces/MEDIA004Res.interface';
import { MediaService } from '../../core/services/media.service';
import { MEDIA004Req } from '../../core/interfaces/MEDIA004Req.interface';

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
  @Input() user: Partial<MERCH011Tranrs & { avatarUrl?: string | null; mediaId?: string; mediaBase64?: string }> = {};

  /** 事件：儲存 */
  @Output() save = new EventEmitter<{ name: string; phone: string; avatarMediaId: string | undefined }>();
  /** 事件：取消 */
  @Output() cancel = new EventEmitter<void>();

  loading = false;

  /** formData 用來綁定表單 */
  formData: { name: string; phone: string } = { name: '', phone: '' };

  // 頭貼處理
  avatars: Media[] = [];
  loadingAvatars = false;
  selectedIndex: number | null = null;
  selectedMediaId: string | undefined = undefined;

  constructor(private mediaService: MediaService) {}

  toDataUrl(m: Media): string {
    return `data:${m.mimeType};base64,${m.base64Data}`;
  }

  get previewSrc(): string | null {
    if (this.selectedIndex !== null && this.avatars[this.selectedIndex]) {
      return this.toDataUrl(this.avatars[this.selectedIndex]);
    }
    return this.user?.mediaBase64 ?? null;
  }

  /** Dialog 隱藏 */
  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  private syncSelectedIndexByMediaId(): void {
    if (!this.avatars.length) {
      this.selectedIndex = null;
      this.selectedMediaId = undefined;
      return;
    }

    const target = this.user?.mediaId ?? this.selectedMediaId ?? this.avatars[0].mediaId;
    const i = this.avatars.findIndex(a => a.mediaId === target);
    this.selectedIndex = i >= 0 ? i : 0;
    this.selectedMediaId = this.avatars[this.selectedIndex].mediaId;
  }

  loadAvatars(force = false): void {
    if (this.loadingAvatars) return;
    if (!force && this.avatars.length) {
      this.syncSelectedIndexByMediaId();
      return;
    }

    this.loadingAvatars = true;
    const payload: MEDIA004Req = {
      MWHEADER: {
        MSGID: 'MEDIA-004'
      },
      TRANRQ: {
        bucket: 'Seller_Profile'
      }
    }

    this.mediaService.onGetMediaApi(payload).subscribe({
      next: (res) => {
        this.avatars = res.TRANRS.medias ?? [];
        this.loadingAvatars = false;
        this.syncSelectedIndexByMediaId();
      },
      error: () => {
        this.avatars = [];
        this.loadingAvatars = false;
        this.selectedIndex = null;
      }
    })
  }

  selectAvatar(i: number): void {
    this.selectedIndex = i;
    this.selectedMediaId = this.avatars[i]?.mediaId ?? this.selectedMediaId;
  }

  /** 儲存 */
  onSave(nameCtrl: NgModel, phoneCtrl: NgModel): void {
    nameCtrl.control.markAsTouched();
    phoneCtrl.control.markAsTouched();
    if (nameCtrl.invalid || phoneCtrl.invalid) return;

    this.loading = true;
    this.save.emit({
      name: this.formData.name.trim(),
      phone: this.formData.phone.trim(),
      avatarMediaId: this.selectedMediaId
    });
    this.loading = false;
    this.onHideDialog();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.formData = {
        name: this.user.name || '',
        phone: this.user.phone || ''
      };
      this.selectedMediaId = this.user.mediaId ?? this.selectedMediaId;
    }
    if (changes['visible']?.currentValue === true) {
      this.loadAvatars();
    }
  }
}
