import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Seller, SellerStatus, ADMIN002Req, ADMIN002Res } from '../../core/interfaces/ADMIN002Res.interface';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-seller-table',
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
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './admin-seller-table.html',
  styleUrl: './admin-seller-table.css'
})
export class AdminSellerTable implements OnInit {
  @ViewChild('dt') table!: Table;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  sellerList: Seller[] = [];
  statuses: SellerStatus[] = [];
  loading: boolean = false;

  // Search filter variables
  accountIdFilter: string = '';
  emailFilter: string = '';
  nameFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;

  private isSearching = false; // 追蹤是否為搜尋操作

  ngOnInit() {
    this.statuses = [
      { label: '啟用', value: 'active' },
      { label: '停用', value: 'INACTIVE' },
      { label: '暫停', value: 'SUSPENDED' }
    ];

    // 檢查 URL 查詢參數，如果有 sellerName 就設定過濾條件
    this.route.queryParams.subscribe(params => {
      if (params['sellerName']) {
        this.nameFilter = params['sellerName'];
        this.isSearching = true; // 標記為搜尋操作
      }
      this.loadSellers();
    });
  }

  /**
   * 載入賣家列表
   */
  loadSellers() {
    const request: ADMIN002Req = {
      MWHEADER: {
        MSGID: 'ADMIN-002'
      },
      TRANRQ: {
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }
    };

    // 添加搜尋條件
    if (this.accountIdFilter) {
      request.TRANRQ.Account_Id = this.accountIdFilter;
    }
    if (this.nameFilter) {
      request.TRANRQ.Name = this.nameFilter;
    }
    if (this.emailFilter) {
      request.TRANRQ.Email = this.emailFilter;
    }
    this.http.post<ADMIN002Res>('http://localhost:8080/admin/merchant/query', request)
      .subscribe({
        next: (response) => {
          if (response.MWHEADER.RETURNCODE === '0000') {
            this.sellerList = response.TRANRS.sellers;
            this.totalCount = response.TRANRS.totalCount;
            this.totalPages = response.TRANRS.totalPages;
            this.currentPage = response.TRANRS.currentPage;
            // 如果是搜尋操作，顯示成功提示
            if (this.isSearching) {
              // this.messageService.add({
              //   severity: 'success',
              //   summary: '搜尋成功',
              //   detail: `找到 ${this.totalCount} 筆賣家資料`
              // });
              this.isSearching = false;
            }
          } else {
            this.sellerList = [];
            this.totalCount = 0;

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
        },
        error: (error) => {
          this.sellerList = [];
          this.totalCount = 0;

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
   * 執行搜尋
   */
  onSearch() {
    this.currentPage = 1; // 重置到第一頁
    this.isSearching = true; // 標記為搜尋操作
    this.loadSellers();
  }

  /**
   * 分頁改變
   */
  onPageChange(event: any) {
    // PrimeNG 的 onPage 事件使用 first (第一筆的索引) 和 rows (每頁筆數)
    this.currentPage = (event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadSellers();
    this.loading = false;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case 'active':
        return 'success';
      case 'INACTIVE':
        return 'warn';
      case 'SUSPENDED':
        return 'danger';
      default:
        return null;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return '啟用';
      case 'INACTIVE':
        return '停用';
      case 'SUSPENDED':
        return '暫停';
      default:
        return status;
    }
  }

  /**
   * 前往該賣家的旅館列表
   */
  goToHotels(sellerId: string) {
    // 找到該賣家的名稱
    const seller = this.sellerList.find(s => s.SELLER_ID === sellerId);
    if (seller) {
      // 導航到旅館列表頁面，並帶上 sellerName 參數
      this.router.navigate(['/admin/hotelTable'], {
        queryParams: { sellerName: seller.NAME }
      });

      this.messageService.add({
        severity: 'info',
        summary: '正在跳轉',
        detail: `正在查看 ${seller.NAME} 的旅館列表`
      });
    }
  }
}
