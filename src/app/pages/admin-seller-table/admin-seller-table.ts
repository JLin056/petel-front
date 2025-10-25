import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Seller, SellerStatus, ADMIN002Req, ADMIN002Res } from '../../core/interfaces/ADMIN002Res.interface';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

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
    SharedConfirmDialog
  ],
  templateUrl: './admin-seller-table.html',
  styleUrl: './admin-seller-table.css'
})
export class AdminSellerTable implements OnInit {
  constructor(private http: HttpClient) {}

  sellerList: Seller[] = [];
  statuses: SellerStatus[] = [];

  // Search filter variables
  accountIdFilter: string = '';
  emailFilter: string = '';
  nameFilter: string = '';
  businessCodeFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedSeller: Seller | null = null;

  ngOnInit() {
    this.statuses = [
      { label: '啟用', value: 'ACTIVE' },
      { label: '停用', value: 'INACTIVE' },
      { label: '暫停', value: 'SUSPENDED' }
    ];

    this.loadSellers();
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

    console.log('發送 API 請求:', request);

    this.http.post<ADMIN002Res>('http://localhost:8080/admin/merchant/query', request)
      .subscribe({
        next: (response) => {
          console.log('收到 API 回應:', response);
          if (response.MWHEADER.RETURNCODE === '0000') {
            this.sellerList = response.TRANRS.sellers;
            this.totalCount = response.TRANRS.totalCount;
            this.totalPages = response.TRANRS.totalPages;
            this.currentPage = response.TRANRS.currentPage;
            console.log('賣家列表:', this.sellerList);
            console.log('總筆數:', this.totalCount);
          } else {
            console.error('API 錯誤:', response.MWHEADER.RETURNDESC);
            this.sellerList = [];
            this.totalCount = 0;
          }
        },
        error: (error) => {
          console.error('API 呼叫失敗:', error);
          this.sellerList = [];
          this.totalCount = 0;
        }
      });
  }

  /**
   * 執行搜尋
   */
  onSearch() {
    this.currentPage = 1; // 重置到第一頁
    this.loadSellers();
  }

  /**
   * 分頁改變
   */
  onPageChange(event: any) {
    console.log('分頁事件:', event);
    // PrimeNG 的 onPage 事件使用 first (第一筆的索引) 和 rows (每頁筆數)
    this.currentPage = (event.first / event.rows) + 1;
    this.pageSize = event.rows;
    console.log('切換到第', this.currentPage, '頁，每頁', this.pageSize, '筆');
    this.loadSellers();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case 'ACTIVE':
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
      case 'ACTIVE':
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
   * 顯示刪除確認對話框
   */
  confirmDelete(seller: Seller) {
    this.selectedSeller = seller;
    this.deleteConfirmVisible = true;
  }

  /**
   * 確認刪除賣家
   */
  onDeleteConfirmed() {
    if (this.selectedSeller) {
      console.log('刪除賣家:', this.selectedSeller.SELLER_ID);
      // TODO: 呼叫 API 刪除賣家
      // this.http.delete(`/api/sellers/${this.selectedSeller.SELLER_ID}`).subscribe(...);

      // 從列表中移除
      this.sellerList = this.sellerList.filter(s => s.SELLER_ID !== this.selectedSeller!.SELLER_ID);

      this.selectedSeller = null;
    }
    this.deleteConfirmVisible = false;
  }

  /**
   * 取消刪除
   */
  onDeleteCancelled() {
    this.selectedSeller = null;
    this.deleteConfirmVisible = false;
  }

  /**
   * 前往該賣家的旅館列表
   */
  goToHotels(sellerId: string) {
    console.log('前往 Seller ID 的旅館列表:', sellerId);
    // TODO: 導航到旅館列表頁面，並帶上 sellerId 參數
    // this.router.navigate(['/hotels'], { queryParams: { sellerId: sellerId } });
  }
}
