import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Hotel } from '../../core/interfaces/ADMIN006Res.interface';
import { AdminService } from '../../core/services/admin.service';
import { ADMIN001Req } from '../../core/interfaces/ADMIN001Req.interface';

@Component({
  selector: 'app-admin-hotel-table',
  imports: [
    TableModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './admin-hotel-table.html',
  styleUrl: './admin-hotel-table.css'
})
export class AdminHotelTable implements OnInit {
  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  hotelList: Hotel[] = [];
  loading: boolean = true;

  // Filter variables - 用於後端查詢
  propertyIdFilter: string = '';
  propertyNameFilter: string = '';
  sellerNameFilter: string = '';

  // Pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  private isFirstLoad = true; // 追蹤是否為第一次載入
  private isSearching = false; // 追蹤是否為搜尋操作

  ngOnInit() {
    // 檢查 URL 查詢參數，如果有查詢條件就設定過濾
    this.route.queryParams.subscribe(params => {
      if (params['sellerName']) {
        this.sellerNameFilter = params['sellerName'];
        this.isSearching = true;
      }
      if (params['propertyName']) {
        this.propertyNameFilter = params['propertyName'];
        this.isSearching = true;
      }
    });
    // 初始化時不自動載入，等待 lazy table 觸發
  }

  /**
   * 載入旅館列表
   */
  loadHotels() {
    this.loading = true;

    // 建立請求資料
    const requestData: ADMIN001Req = {
      MWHEADER: {
        MSGID: 'ADMIN-001'
      },
      TRANRQ: {
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }
    };

    // 加入篩選條件（只有在有值的時候才加入）
    if (this.propertyIdFilter) {
      requestData.TRANRQ.propertyId = this.propertyIdFilter;
    }
    if (this.propertyNameFilter) {
      requestData.TRANRQ.propertyName = this.propertyNameFilter;
    }
    if (this.sellerNameFilter) {
      requestData.TRANRQ.sellerName = this.sellerNameFilter;
    }

    // 呼叫 API
    this.adminService.queryHotels(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          this.hotelList = response.TRANRS.hotels;
          this.totalRecords = response.TRANRS.totalCount;
          this.currentPage = response.TRANRS.currentPage;

          // 如果是搜尋操作，顯示成功提示
          if (this.isSearching) {
            // this.messageService.add({
            //   severity: 'success',
            //   summary: '搜尋成功',
            //   detail: `找到 ${this.totalRecords} 筆旅館資料`
            // });
            this.isSearching = false;
          }
        } else {
          console.error('API 回傳錯誤:', response.MWHEADER.RETURNDESC);
          this.hotelList = [];
          this.totalRecords = 0;

          // 如果是搜尋操作，顯示錯誤提示
          if (this.isSearching) {
            this.messageService.add({
              severity: 'error',
              summary: '搜尋失敗',
              detail: response.MWHEADER.RETURNDESC
            });
            this.isSearching = false;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('API 呼叫失敗:', error);
        this.hotelList = [];
        this.totalRecords = 0;
        this.loading = false;

        // 如果是搜尋操作，顯示錯誤提示
        if (this.isSearching) {
          this.messageService.add({
            severity: 'error',
            summary: '搜尋失敗',
            detail: '網路錯誤，請稍後再試'
          });
          this.isSearching = false;
        }
      }
    });
  }

  /**
   * 分頁切換事件（PrimeNG lazy loading）
   */
  onPageChange(event: any) {
    // PrimeNG lazy table 使用 event.first (起始索引) 和 event.rows (每頁筆數)
    // 需要計算當前頁碼：page = first / rows
    const page = event.first !== undefined ? Math.floor(event.first / event.rows) : (event.page || 0);
    const rows = event.rows || this.pageSize;

    // 第一次載入由 lazy table 觸發
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
    }

    this.currentPage = page + 1; // PrimeNG 的 page 是從 0 開始，後端從 1 開始
    this.pageSize = rows;
    this.loadHotels();
  }

  /**
   * 搜尋按鈕點擊事件
   */
  onSearch() {
    this.currentPage = 1; // 重置到第一頁
    this.isSearching = true; // 標記為搜尋操作
    this.loadHotels();
  }

  /**
   * 查看旅館的歷史訂單
   */
  viewHotelOrders(hotel: Hotel) {
    console.log('查看旅館歷史訂單:', hotel.PROPERTY_ID, hotel.PROPERTY_NAME);

    // 導航到訂單列表頁面，並帶上 propertyName 參數
    this.router.navigate(['/admin/orderTable'], {
      queryParams: { propertyName: hotel.PROPERTY_NAME }
    });

    this.messageService.add({
      severity: 'info',
      summary: '正在跳轉',
      detail: `正在查看 ${hotel.PROPERTY_NAME} 的歷史訂單`
    });
  }

  /**
   * 點擊賣家名稱，導航到賣家列表並查詢該賣家
   */
  viewSellerDetails(sellerName: string) {
    this.router.navigate(['/admin/sellerTable'], {
      queryParams: { sellerName: sellerName }
    });
  }
}
