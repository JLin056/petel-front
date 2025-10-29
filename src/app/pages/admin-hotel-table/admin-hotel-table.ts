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
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
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
    SharedConfirmDialog,
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
    private router: Router
  ) {}

  hotelList: Hotel[] = [];
  loading: boolean = true;

  // Filter variables - 用於後端查詢
  propertyIdFilter: string = '';
  propertyNameFilter: string = '';

  // Pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedHotel: Hotel | null = null;

  private isFirstLoad = true; // 追蹤是否為第一次載入
  private isSearching = false; // 追蹤是否為搜尋操作

  ngOnInit() {
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

    // 呼叫 API
    this.adminService.queryHotels(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          this.hotelList = response.TRANRS.hotels;
          this.totalRecords = response.TRANRS.totalCount;
          this.currentPage = response.TRANRS.currentPage;

          // 如果是搜尋操作，顯示成功提示
          if (this.isSearching) {
            this.messageService.add({
              severity: 'success',
              summary: '搜尋成功',
              detail: `找到 ${this.totalRecords} 筆旅館資料`
            });
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
   * 顯示刪除確認對話框
   */
  confirmDelete(hotel: Hotel) {
    this.selectedHotel = hotel;
    this.deleteConfirmVisible = true;
  }

  /**
   * 確認刪除旅館
   */
  onDeleteConfirmed() {
    if (this.selectedHotel) {
      console.log('刪除旅館:', this.selectedHotel.PROPERTY_ID);
      const hotelName = this.selectedHotel.PROPERTY_NAME;

      // TODO: 呼叫 API 刪除旅館
      // this.http.delete(`/api/hotels/${this.selectedHotel.PROPERTY_ID}`).subscribe(...);

      // 從列表中移除
      this.hotelList = this.hotelList.filter(h => h.PROPERTY_ID !== this.selectedHotel!.PROPERTY_ID);

      // 顯示成功訊息
      this.messageService.add({
        severity: 'success',
        summary: '刪除成功',
        detail: `已成功刪除旅館 ${hotelName}`
      });

      this.selectedHotel = null;
    }
    this.deleteConfirmVisible = false;
  }

  /**
   * 取消刪除
   */
  onDeleteCancelled() {
    this.selectedHotel = null;
    this.deleteConfirmVisible = false;
  }

  /**
   * 查看旅館的歷史訂單
   */
  viewHotelOrders(hotel: Hotel) {
    console.log('查看旅館歷史訂單:', hotel.PROPERTY_ID, hotel.PROPERTY_NAME);
    // TODO: 實作導航到訂單列表頁面，並根據旅館名稱進行篩選
    // 方式 1: 使用 Router 導航並傳遞參數
    // this.router.navigate(['/orders'], { queryParams: { hotelId: hotel.PROPERTY_ID, hotelName: hotel.PROPERTY_NAME } });

    // 方式 2: 使用狀態管理或 Service 傳遞篩選條件
    // this.orderService.setHotelFilter(hotel.PROPERTY_NAME);
    // this.router.navigate(['/orders']);
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
