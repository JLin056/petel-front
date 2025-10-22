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
import { Seller, SellerStatus } from '../../core/interfaces/ADMIN005Res.interface';
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
  loading: boolean = true;

  // Filter variables
  searchValue: string = '';
  sellerIdFilter: string = '';
  accountIdFilter: string = '';
  emailFilter: string = '';
  nameFilter: string = '';
  businessCodeFilter: string = '';

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedSeller: Seller | null = null;

  ngOnInit() {
    // 模擬資料載入
    this.sellerList = [
      {
        "SELLER_ID": "S000000001",
        "ACCOUNT_ID": "A000000006",
        "EMAIL": "seller1@pethotel.com",
        "NAME": "快樂毛孩寵物旅館",
        "BUSINESS_CODE": "特寵業繁字第U1130696號",
        "ROLE": "SELLER",
        "STATUS": "ACTIVE"
      },
      {
        "SELLER_ID": "S0003",
        "ACCOUNT_ID": "A0008",
        "EMAIL": "seller3@pethotel.com",
        "NAME": "溫馨小窩寵物旅館",
        "BUSINESS_CODE": "34567890",
        "ROLE": "SELLER",
        "STATUS": "ACTIVE"
      },
      {
        "SELLER_ID": "S0004",
        "ACCOUNT_ID": "A0009",
        "EMAIL": "seller4@pethotel.com",
        "NAME": "寵愛一生寵物飯店",
        "BUSINESS_CODE": "45678901",
        "ROLE": "SELLER",
        "STATUS": "ACTIVE"
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
}
