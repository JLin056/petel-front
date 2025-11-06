import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MerchService } from '../../core/services/merch-service';
import { reviewList } from '../../core/interfaces/MERCH003Res.interface';
import { PropertyStateService } from '../../core/services/property-state.service';

@Component({
  selector: 'app-merchant-review-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorModule,
    CardModule,
    RatingModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './merchant-review-list-page.html',
  styleUrl: './merchant-review-list-page.css'
})
export class MerchantReviewListPage implements OnInit {
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;
  currentPage: number = 1;

  propertyId: string = '';
  reviews: reviewList[] = [];
  isLoading = false;
  errorMessage = '';

  // 統計資料
  avgPriceScore: number = 0;
  avgEnvScore: number = 0;
  avgServiceScore: number = 0;

  // 追蹤每個評價的展開狀態 (orderId -> boolean)
  expandedReviews: Map<string, boolean> = new Map();

  constructor(
    private merchService: MerchService,
    private propertyStateService: PropertyStateService
  ) { }

  ngOnInit(): void {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();

    if (!this.propertyId) {
      this.errorMessage = '無法取得旅館資訊';
      return;
    }
    this.loadReviews();
  }

  /**
   * 載入評價列表
   */
  loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const tranrq = {
      propertyId: this.propertyId,
      page: {
        pageNumber: this.currentPage,
        pageSize: this.rows
      }
    };

    this.merchService.queryPropertyReviews(tranrq).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.reviews = res.TRANRS?.reviews || [];
          this.totalRecords = res.TRANRS?.totalCount || 0;
          this.avgPriceScore = res.TRANRS?.avgPriceScore || 0;
          this.avgEnvScore = res.TRANRS?.avgEnvScore || 0;
          this.avgServiceScore = res.TRANRS?.avgServiceScore || 0;
        } else {
          this.reviews = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.reviews = [];
      }
    });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.currentPage = Math.floor(this.first / this.rows) + 1;
    this.loadReviews();
  }

  /**
   * 計算平均分數 
   */
  getAverageRating(review: reviewList): number {
    return review.avgScore;
  }

  /**
   * 格式化日期時間
   * @param dateString ISO 8601 格式的日期字串
   * @returns 格式化後的日期字串 (YYYY/MM/DD HH:mm)
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

  /**
   * 切換評價展開/收合狀態
   * @param orderId 訂單 ID
   */
  toggleReviewExpand(orderId: string): void {
    const currentState = this.expandedReviews.get(orderId) || false;
    this.expandedReviews.set(orderId, !currentState);
  }

  /**
   * 檢查評價是否已展開
   * @param orderId 訂單 ID
   * @returns 是否已展開
   */
  isReviewExpanded(orderId: string): boolean {
    return this.expandedReviews.get(orderId) || false;
  }
}