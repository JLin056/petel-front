import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MediaService } from '../../core/services/media.service';
import { Media, MEDIA004Res } from '../../core/interfaces/MEDIA004Res.interface';
import { MEDIA004Req } from '../../core/interfaces/MEDIA004Req.interface';

@Component({
  selector: 'app-add-seller-info-dialog',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './add-seller-info-dialog.html',
  styleUrl: './add-seller-info-dialog.css'
})
export class AddSellerInfoDialog {
  /** visible */
  @Input() visible = false;
  /** visibleChange */
  @Output() visibleChange = new EventEmitter<boolean>();

  /** 初始資料 */
  @Input() name = '';
  @Input() phone = '';
  @Input() avatarUrl: string | null = null;

  /** 事件：點「儲存」 */
  @Output() save = new EventEmitter<{ name: string; phone: string; avatarMediaId: string }>();
  /** 事件：點「取消」或關閉 */
  @Output() cancel = new EventEmitter<void>();

  /** 載入 */
  loading = false;
  loadingAvatars = false;

  /** 頭貼 */
  avatars: Media[] = [];
  selectedIndex: number | null = null;
  selectedMediaId: string | null = null;

  /**
   * 注入
   * @param mediaService
   */
  constructor(
    private mediaService: MediaService
  ){}

  /** dialog 隱藏 */
  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  /**
   * 載入圖片
   * @param force
   * @returns
   */
  loadAvatars(force = false) {
    if (this.loadingAvatars) return;
    if (!force && this.avatars.length) return;

    this.loadingAvatars = true;

    const payload: MEDIA004Req = {
      MWHEADER: {
        MSGID: 'MEDIA-004'
      },
      TRANRQ: {
        bucket: "Seller_Profile"
      }
    }

    this.mediaService.onGetMediaApi(payload).subscribe({
      next: (res: MEDIA004Res) => {
        this.avatars = res?.TRANRS?.medias ?? [];

        if (this.avatars.length > 0 && this.selectedIndex === null) {
          this.selectedIndex = 0;
          this.selectedMediaId = this.avatars[0].mediaId;
        }

        this.loadingAvatars = false;
      },
      error: () => {
        this.avatars = [];
        this.loadingAvatars = false;
      }
    });
  }

  toDataUrl(m: Media): string {
    return `data:${m.mimeType};base64,${m.base64Data}`;
  }

  get previewSrc(): string | null {
    if (this.selectedIndex !== null) {
      const m = this.avatars[this.selectedIndex];
      if (m) return this.toDataUrl(m);
    }

    return null;
  }

  selectAvatar(i: number) {
    this.selectedIndex = i;
    this.selectedMediaId = this.avatars[i]?.mediaId ?? null;
  }

  clearSelection() {
    if (this.avatars.length > 0) {
      this.selectedIndex = 0;
      this.selectedMediaId = this.avatars[0].mediaId;
    } else {
      this.selectedIndex = null;
      this.selectedMediaId = null;
    }
  }

  /** 點擊儲存 */
  onSave(nameCtrl: NgModel, phoneCtrl: NgModel) {
    if (nameCtrl.invalid || phoneCtrl.invalid) {
      nameCtrl.control.markAsTouched();
      phoneCtrl.control.markAsTouched();
      return;
    }

    if (!this.selectedMediaId && this.avatars.length > 0) {
      this.selectedIndex = 0;
      this.selectedMediaId = this.avatars[0].mediaId;
    }
    if (!this.selectedMediaId) return;

    this.loading = true;
    this.save.emit({
      name: this.name.trim(),
      phone: this.phone.trim(),
      avatarMediaId: this.selectedMediaId
    });
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadAvatars();
    }
  }
}
