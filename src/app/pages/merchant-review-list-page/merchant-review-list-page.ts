import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

interface Review {
  orderNo: string;
  comment: string;
  price: number;
  environment: number;
  service: number;
  date?: string;
  userName?: string;
}

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
    TagModule,
    DividerModule
  ],
  templateUrl: './merchant-review-list-page.html',
  styleUrl: './merchant-review-list-page.css'
})
export class MerchantReviewListPage {
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 3; // 👈 加入這個屬性

  reviews: Review[] = [
    {
      orderNo: '1236595403',
      comment: '超棒的住宿體驗！環境乾淨舒適，服務人員態度親切。',
      price: 5,
      environment: 5,
      service: 5,
      date: '2025-01-15',
      userName: '王小明'
    },
    {
      orderNo: '1233847590',
      comment: '不錯的體驗！寵物也很喜歡這裡。',
      price: 4,
      environment: 4,
      service: 4,
      date: '2025-01-10',
      userName: '李美麗'
    },
    {
      orderNo: '1379487623',
      comment: '床很舒服，但服務還有進步空間。',
      price: 4,
      environment: 4,
      service: 3,
      date: '2025-01-08',
      userName: '張大華'
    },
  ];

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    console.log('頁面變更:', event);
  }

  // 計算平均分數
  getAverageRating(review: Review): number {
    const avg = (review.price + review.environment + review.service) / 3;
    return Math.round(avg * 10) / 10;
  }
}