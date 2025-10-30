import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';

import { Review001Tranrq } from '../../core/interfaces/REVIEW001Req.interface';
import { InputTextModule } from 'primeng/inputtext';


@Component({
    selector: 'app-add-review-dialog',
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, RatingModule, InputTextModule],
    templateUrl: './add-review-dialog.html',
    styleUrl: './add-review-dialog.css'
})
export class AddReviewDialog {
    /** Dialog 顯示控制 */
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    /** 要評論的訂單 */
    @Input() order: {
        orderId: string;
        propertyName: string;
        checkIn?: string;
        checkOut?: string;
    } | null = null;

    /** 送出成功事件 */
    @Output() saved = new EventEmitter<Review001Tranrq>();

    /** 送出時可選的 loading 狀態 */
    @Input() submitting = false;

    priceScore = 0;
    envScore = 0;
    serviceScore = 0;
    content = '';

    ngOnChanges(changes: SimpleChanges): void {
        // 每次打開或切換訂單時初始化
        if ('visible' in changes && this.visible) {
            this.resetForm();
        }
        if ('order' in changes && this.visible) {
        this.resetForm();
        }
    }

    close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    isValid(): boolean {
        return (
            !!this.order &&
            this.priceScore > 0 &&
            this.envScore > 0 &&
            this.serviceScore > 0 &&
            this.content.trim().length > 0
        );
    }

    submit(): void {
        if (!this.order || !this.isValid()) return;

        const payload: Review001Tranrq = {
            orderId: this.order.orderId,
            priceScore: this.priceScore,
            envScore: this.envScore,
            serviceScore: this.serviceScore,
            content: this.content.trim()
        };

        this.saved.emit(payload);
    }

    private resetForm(): void {
        this.priceScore = 0;
        this.envScore = 0;
        this.serviceScore = 0;
        this.content = '';
    }
}
