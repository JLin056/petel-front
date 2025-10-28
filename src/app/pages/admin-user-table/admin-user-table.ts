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
import { Member as ADMIN007Member } from '../../core/interfaces/ADMIN007Res.interface';
import { UserStatus, UserRole } from '../../core/interfaces/ADMIN004Res.interface';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { AdminService } from '../../core/services/admin.service';
import { ADMIN007Req } from '../../core/interfaces/ADMIN007Req.interface';
import { ADMIN008Req } from '../../core/interfaces/ADMIN008Req.interface';

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
    SharedConfirmDialog,
    TooltipModule
  ],
  templateUrl: './admin-user-table.html',
  styleUrl: './admin-user-table.css'
})
export class AdminUserTable implements OnInit {
  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
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

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedMember: ADMIN007Member | null = null;

  private isFirstLoad = true; // 追蹤是否為第一次載入

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
        } else {
          console.error('API 回傳錯誤:', response.MWHEADER.RETURNDESC);
          this.memberList = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('API 呼叫失敗:', error);
        this.memberList = [];
        this.totalRecords = 0;
        this.loading = false;
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
   * 顯示刪除確認對話框
   */
  confirmDelete(member: ADMIN007Member) {
    this.selectedMember = member;
    this.deleteConfirmVisible = true;
  }

  /**
   * 確認刪除會員
   */
  onDeleteConfirmed() {
    if (!this.selectedMember) {
      this.deleteConfirmVisible = false;
      return;
    }

    const memberToDelete = this.selectedMember;

    // 建立刪除請求資料
    const requestData: ADMIN008Req = {
      MWHEADER: {
        MSGID: 'ADMIN-008'
      },
      TRANRQ: {
        usersId: memberToDelete.USER_ID
      }
    };

    // 呼叫刪除 API
    this.adminService.deleteMember(requestData).subscribe({
      next: (response) => {
        if (response.MWHEADER.RETURNCODE === '0000') {
          console.log('刪除成功:', response.TRANRS.message);

          // 從列表中移除該會員
          this.memberList = this.memberList.filter(m => m.USER_ID !== memberToDelete.USER_ID);

          // 如果當前頁沒有資料了，且不是第一頁，則回到上一頁
          if (this.memberList.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadMembers();
          } else if (this.memberList.length === 0) {
            // 如果是第一頁且沒資料，重新載入
            this.loadMembers();
          }

          // TODO: 顯示成功訊息給使用者
          alert('刪除成功：' + response.TRANRS.message);
        } else {
          console.error('刪除失敗:', response.MWHEADER.RETURNDESC);
          // TODO: 顯示錯誤訊息給使用者
          alert('刪除失敗：' + response.MWHEADER.RETURNDESC);
        }

        this.selectedMember = null;
        this.deleteConfirmVisible = false;
      },
      error: (error) => {
        console.error('刪除 API 呼叫失敗:', error);
        // TODO: 顯示錯誤訊息給使用者
        alert('刪除失敗：' + (error.error?.MWHEADER?.RETURNDESC || '網路錯誤，請稍後再試'));

        this.selectedMember = null;
        this.deleteConfirmVisible = false;
      }
    });
  }

  /**
   * 取消刪除
   */
  onDeleteCancelled() {
    this.selectedMember = null;
    this.deleteConfirmVisible = false;
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
