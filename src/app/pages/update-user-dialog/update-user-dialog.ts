import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tranrs } from '../../core/interfaces/USER004Res.interface';
import { Media } from '../../core/interfaces/MEDIA004Res.interface';
import { MediaService } from '../../core/services/media.service';
import { MEDIA004Req } from '../../core/interfaces/MEDIA004Req.interface';

@Component({
  selector: 'app-update-user-dialog',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule, PasswordModule, FormsModule],
  templateUrl: './update-user-dialog.html',
  styleUrl: './update-user-dialog.css'
})
export class UpdateUserDialog {
    /** visible */
    @Input() visible = false;
    /** visibleChange */
    @Output() visibleChange = new EventEmitter<boolean>();

    @Input() user: Tranrs | null = null;
    @Output() saved = new EventEmitter<{name: string, phone: string, avatarMediaId: string | undefined}>();

    // 顯示用欄位
    name = '';
    phone = '';

    // 頭貼處理
    avatars: Media[] = [];
    loadingAvatars = false;
    selectedIndex: number | null = null;
    selectedMediaId: string | undefined = undefined;

    loading = false;

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

    onHideDialog() {
        this.visible = false;
        this.visibleChange.emit(false);
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
                bucket: 'User_Profile'
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

    onSave(nameCtrl: NgModel, phoneCtrl: NgModel): void {
        nameCtrl.control.markAsTouched();
        phoneCtrl.control.markAsTouched();
        if (nameCtrl.invalid || phoneCtrl.invalid) return;

        this.loading = true;
        this.saved.emit({
            name: this.name.trim(),
            phone: this.phone.trim(),
            avatarMediaId: this.selectedMediaId
        });
        this.loading = false;
        this.onHideDialog();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user'] && this.user) {
            this.name = this.user.name || '';
            this.phone = this.user.phone || '';
            this.selectedMediaId = this.user.mediaId ?? this.selectedMediaId;
        }
        if (changes['visible']?.currentValue === true) {
            this.loadAvatars();
        }
    }
}
