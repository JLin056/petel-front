import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { OrderDetailDialog } from '../order-detail-dialog/order-detail-dialog';
import { AdminService } from '../../core/services/admin.service';
import { ADMIN003Req } from '../../core/interfaces/ADMIN003Req.interface';
import { PricePipe } from '../../shared/pipes/price-pipe';

@Component({
  selector: 'app-order-table-component',
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    OrderDetailDialog,
    ToastModule,
    TooltipModule,
    PricePipe
  ],
  providers: [MessageService],
  templateUrl: './order-table-component.html',
  styleUrl: './order-table-component.css'
})
export class OrderTableComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  orderList: Order[] = [];
  statuses: Status[] = [];
  loading: boolean = true;

  // Filter variables - 用於後端查詢
  orderIdFilter: string = '';
  checkInFilter: string = '';
  userNameFilter: string = '';
  propertyNameFilter: string = '';

  // Pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  // 詳細資料彈窗相關
  showDetailDialog = false;
  selectedOrder: Order | null = null;

  private isFirstLoad = true; // 追蹤是否為第一次載入
  private isSearching = false; // 追蹤是否為搜尋操作

  ngOnInit() {
    this.statuses = [
      { label: '待付款', value: '待付款' },
      { label: '已確認', value: '已確認' },
      { label: '已完成', value: '已完成' },
      { label: '已取消', value: '已取消' },
      { label: '未付款', value: '未付款' }
    ];

    // 檢查 URL 查詢參數，設定過濾條件
    this.route.queryParams.subscribe(params => {
      if (params['userName']) {
        this.userNameFilter = params['userName'];
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
   * 載入訂單列表
   */
  loadOrders() {
    this.loading = true;

    // 建立請求資料
    const requestData: ADMIN003Req = {
      MWHEADER: {
        MSGID: 'ADMIN-003'
      },
      TRANRQ: {
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }
    };

    // 加入篩選條件（只有在有值的時候才加入）
    if (this.orderIdFilter) {
      requestData.TRANRQ.ORDER_ID = this.orderIdFilter;
    }
    if (this.checkInFilter) {
      requestData.TRANRQ.CHECK_IN = this.checkInFilter;
    }
    if (this.userNameFilter) {
      requestData.TRANRQ.userName = this.userNameFilter;
    }
    if (this.propertyNameFilter) {
      requestData.TRANRQ.propertyName = this.propertyNameFilter;
    }

    // 呼叫 API
    this.adminService.queryOrders(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          this.orderList = response.TRANRS.orders;
          this.totalRecords = response.TRANRS.totalCount;
          this.currentPage = response.TRANRS.currentPage;

          // 如果是搜尋操作，顯示成功提示
          if (this.isSearching) {
            // this.messageService.add({
            //   severity: 'success',
            //   summary: '搜尋成功',
            //   detail: `找到 ${this.totalRecords} 筆訂單資料`
            // });
            this.isSearching = false;
          }
        } else {
          console.error('API 回傳錯誤:', response.MWHEADER.RETURNDESC);
          this.orderList = [];
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
        this.orderList = [];
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
    this.loadOrders();
  }

  /**
   * 搜尋按鈕點擊事件
   */
  onSearch() {
    this.currentPage = 1; // 重置到第一頁
    this.isSearching = true; // 標記為搜尋操作
    this.loadOrders();
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case '已完成':
        return 'success';
      case '已付款':
        return 'info';
      case '未付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }

  // 開啟詳細資料彈窗
  showOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.showDetailDialog = true;
  }

  // 更新備註
  onNoteUpdated(data: { orderId: string, note: string }) {
    // 更新訂單列表中的備註
    const orderIndex = this.orderList.findIndex(o => o.ORDER_ID === data.orderId);
    if (orderIndex !== -1) {
      this.orderList[orderIndex].NOTE = data.note;
    }

    // 更新選中的訂單
    if (this.selectedOrder && this.selectedOrder.ORDER_ID === data.orderId) {
      this.selectedOrder.NOTE = data.note;
    }

    console.log('備註已更新:', data);
    // TODO: 這裡可以加入 API 呼叫來更新後端資料
  }
}
