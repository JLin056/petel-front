import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Member as ADMIN007Member } from '../../core/interfaces/ADMIN007Res.interface';
import { UserStatus, UserRole } from '../../core/interfaces/ADMIN004Res.interface';
import { AdminService } from '../../core/services/admin.service';
import { ADMIN007Req } from '../../core/interfaces/ADMIN007Req.interface';

@Component({
  selector: 'app-admin-user-table',
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
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './admin-user-table.html',
  styleUrl: './admin-user-table.css'
})
export class AdminUserTable implements OnInit {
  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}
   
 

  memberList: ADMIN007Member[] = [];
  statuses: UserStatus[] = [];
  loading: boolean = true;

  // Filter variables - 用於後端查詢
  accountIdFilter: string = '';
  emailFilter: string = '';
  nameFilter: string = '';
  phoneFilter: string = '';

  // Pagination
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  private isFirstLoad = true; // 追蹤是否為第一次載入
  private isSearching = false; // 追蹤是否為搜尋操作

  ngOnInit() {
    this.statuses = [
      { label: '啟用', value: 'ACTIVE' },
      { label: '停用', value: 'INACTIVE' },
      { label: '暫停', value: 'SUSPENDED' }
    ];

    // 檢查 URL 查詢參數
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.nameFilter = params['search'];
        // 延遲執行搜尋，等待表格初始化完成
        setTimeout(() => {
          this.onSearch();
        }, 100);
      }
    });
  }

  /**
   * 載入會員列表
   */
  loadMembers() {
    this.loading = true;

    // 建立請求資料
    const requestData: ADMIN007Req = {
      MWHEADER: {
        MSGID: 'ADMIN-007'
      },
      TRANRQ: {
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }
    };

    // 加入篩選條件（只有在有值的時候才加入）
    if (this.accountIdFilter) {
      requestData.TRANRQ.Account_Id = this.accountIdFilter;
    }
    if (this.nameFilter) {
      requestData.TRANRQ.Name = this.nameFilter;
    }
    if (this.emailFilter) {
      requestData.TRANRQ.Email = this.emailFilter;
    }
    if (this.phoneFilter) {
      requestData.TRANRQ.Phone = this.phoneFilter;
    }

    // 呼叫 API
    this.adminService.queryMembers(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          this.memberList = response.TRANRS.members;
          this.totalRecords = response.TRANRS.totalCount;
          this.currentPage = response.TRANRS.currentPage;

          // 如果是搜尋操作，顯示成功提示
          if (this.isSearching) {
            this.messageService.add({
              severity: 'success',
              summary: '搜尋成功',
              detail: `找到 ${this.totalRecords} 筆會員資料`
            });
            this.isSearching = false;
          }
        } else {
          console.error('API 回傳錯誤:', response.MWHEADER.RETURNDESC);
          this.memberList = [];
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
        this.memberList = [];
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
    this.loadMembers();
  }

  /**
   * 搜尋按鈕點擊事件
   */
  onSearch() {
    this.currentPage = 1; // 重置到第一頁
    this.isSearching = true; // 標記為搜尋操作
    this.loadMembers();
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
   * 查看會員的歷史訂單
   */
  viewMemberOrders(member: ADMIN007Member) {
    this.router.navigate(['/admin/orderTable'], {
      queryParams: { userName: member.NAME }
    });
  }
}
