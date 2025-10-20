import { Component } from '@angular/core';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-merchant-review-list-page',
  imports: [PaginatorModule],
  templateUrl: './merchant-review-list-page.html',
  styleUrl: './merchant-review-list-page.css'
})
export class MerchantReviewListPage {
  first: number = 0;
  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  reviews = [
    { orderNo: '1236595403', comment: '超棒的住宿體驗！', price: 5, environment: 5, service: 5 },
    { orderNo: '1233847590', comment: '不錯的體驗！', price: 4, environment: 4, service: 4 },
    { orderNo: '1379487623', comment: '床很舒服。', price: 4, environment: 4, service: 3 },
  ];
}
