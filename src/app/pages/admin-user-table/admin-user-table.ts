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
import { Member, UserStatus, UserRole } from '../../core/interfaces/ADMIN004Res.interface';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

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
    SharedConfirmDialog
  ],
  templateUrl: './admin-user-table.html',
  styleUrl: './admin-user-table.css'
})
export class AdminUserTable implements OnInit {
  constructor(private http: HttpClient) {}

  memberList: Member[] = [];
  statuses: UserStatus[] = [];
  loading: boolean = true;

  // Filter variables
  searchValue: string = '';
  accountIdFilter: string = '';
  emailFilter: string = '';
  nameFilter: string = '';
  phoneFilter: string = '';
  statusFilter: string = '';

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedMember: Member | null = null;

  ngOnInit() {
    // 模擬資料載入
    this.memberList = [
      {
        "ACCOUNT_ID": "A0001",
        "EMAIL": "user1@example.com",
        "NAME": "王小明",
        "PHONE": "0912345678",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0002",
        "EMAIL": "user2@example.com",
        "NAME": "李美玲",
        "PHONE": "0923456789",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0003",
        "EMAIL": "user3@example.com",
        "NAME": "張大偉",
        "PHONE": "0934567890",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0004",
        "EMAIL": "user4@example.com",
        "NAME": "陳怡君",
        "PHONE": "0945678901",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0005",
        "EMAIL": "user5@example.com",
        "NAME": "林小華",
        "PHONE": "0956789012",
        "ROLE": "USER",
        "STATUS": "INACTIVE"
      },
      {
        "ACCOUNT_ID": "A0006",
        "EMAIL": "user6@example.com",
        "NAME": "黃志明",
        "PHONE": "0967890123",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0007",
        "EMAIL": "user7@example.com",
        "NAME": "吳雅婷",
        "PHONE": "0978901234",
        "ROLE": "USER",
        "STATUS": "SUSPENDED"
      },
      {
        "ACCOUNT_ID": "A0008",
        "EMAIL": "user8@example.com",
        "NAME": "劉雅文",
        "PHONE": "0989012345",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0009",
        "EMAIL": "user9@example.com",
        "NAME": "周建國",
        "PHONE": "0990123456",
        "ROLE": "USER",
        "STATUS": "ACTIVE"
      },
      {
        "ACCOUNT_ID": "A0010",
        "EMAIL": "user10@example.com",
        "NAME": "鄭雅雯",
        "PHONE": "0901234567",
        "ROLE": "USER",
        "STATUS": "INACTIVE"
      }
    ];

    this.statuses = [
      { label: '啟用', value: 'ACTIVE' },
      { label: '停用', value: 'INACTIVE' },
      { label: '暫停', value: 'SUSPENDED' }
    ];

    this.loading = false;
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
  confirmDelete(member: Member) {
    this.selectedMember = member;
    this.deleteConfirmVisible = true;
  }

  /**
   * 確認刪除會員
   */
  onDeleteConfirmed() {
    if (this.selectedMember) {
      console.log('刪除會員:', this.selectedMember.ACCOUNT_ID);
      // TODO: 呼叫 API 刪除會員
      // this.http.delete(`/api/members/${this.selectedMember.ACCOUNT_ID}`).subscribe(...);

      // 從列表中移除
      this.memberList = this.memberList.filter(m => m.ACCOUNT_ID !== this.selectedMember!.ACCOUNT_ID);

      this.selectedMember = null;
    }
    this.deleteConfirmVisible = false;
  }

  /**
   * 取消刪除
   */
  onDeleteCancelled() {
    this.selectedMember = null;
    this.deleteConfirmVisible = false;
  }
}
