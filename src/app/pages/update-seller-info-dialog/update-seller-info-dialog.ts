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
  selector: 'app-update-seller-info-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './update-seller-info-dialog.html',
  styleUrls: ['./update-seller-info-dialog.css']
})
export class UpdateSellerInfoDialog {
  /** Dialog 是否顯示 */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** 傳入的使用者資料 */
  @Input() user: any = {};

  /** 修改後資料輸出 */
  @Output() save = new EventEmitter<{ name: string; phone: string; avatarMediaId?: string }>();
  @Output() cancel = new EventEmitter<void>();

  /** 狀態 */
  loading = false;
  loadingAvatars = false;

  /** 頭貼資料 */
  avatars: Media[] = [];
  selectedIndex: number | null = null;
  selectedMediaId: string | null = null;

  /** 表單欄位 */
  name = '';
  phone = '';

  constructor(private mediaService: MediaService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadAvatars();
      this.initForm();
    }
  }

  /** 初始化表單欄位 */
  private initForm() {
    this.name = this.user?.name || '';
    this.phone = this.user?.phone || '';
  }

  /** 關閉 Dialog */
  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  /** 載入頭貼清單 */
  loadAvatars(force = false) {
    if (this.loadingAvatars) return;
    if (!force && this.avatars.length) return;

    this.loadingAvatars = true;
    const payload: MEDIA004Req = {
      MWHEADER: { MSGID: 'MEDIA-004' },
      TRANRQ: { bucket: 'Seller_Profile' }
    };

    this.mediaService.onGetMediaApi(payload).subscribe({
      next: (res: MEDIA004Res) => {
        this.avatars = res?.TRANRS?.medias ?? [];
        this.loadingAvatars = false;

        // 若有與 user.mediaId 對應的，預選
        if (this.avatars.length > 0) {
          const idx = this.avatars.findIndex(m => m.mediaId === this.user?.mediaId);
          this.selectedIndex = idx >= 0 ? idx : 0;
          this.selectedMediaId = this.avatars[this.selectedIndex]?.mediaId ?? null;
        }
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

  /** 儲存修改 */
  onSave(nameCtrl: NgModel, phoneCtrl: NgModel) {
    if (nameCtrl.invalid || phoneCtrl.invalid) {
      nameCtrl.control.markAsTouched();
      phoneCtrl.control.markAsTouched();
      return;
    }

    // 若沒選擇頭像但有清單 → 預設第一張
    if (!this.selectedMediaId && this.avatars.length > 0) {
      this.selectedIndex = 0;
      this.selectedMediaId = this.avatars[0].mediaId;
    }

    this.loading = true;
    this.save.emit({
      name: this.name.trim(),
      phone: this.phone.trim(),
      avatarMediaId: this.selectedMediaId || this.user.mediaId
    });
    this.loading = false;
  }
}
