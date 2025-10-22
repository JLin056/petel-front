import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Hotel } from '../../core/interfaces/ADMIN006Res.interface';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

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
    SharedConfirmDialog
  ],
  templateUrl: './admin-hotel-table.html',
  styleUrl: './admin-hotel-table.css'
})
export class AdminHotelTable implements OnInit {
  constructor(private http: HttpClient) {}

  hotelList: Hotel[] = [];
  loading: boolean = true;

  // Filter variables
  searchValue: string = '';
  propertyIdFilter: string = '';
  propertyNameFilter: string = '';
  telFilter: string = '';
  addressFilter: string = '';
  sellerNameFilter: string = '';
  businessCodeFilter: string = '';

  // Confirm dialog
  deleteConfirmVisible: boolean = false;
  selectedHotel: Hotel | null = null;

  ngOnInit() {
    // 模擬資料載入
    this.hotelList = [
      {
        "PROPERTY_ID": "P000000001",
        "PROPERTY_NAME": "快樂毛孩-台北信義館",
        "TEL": "02-27001234",
        "POSTAL_CODE": "110",
        "ADDRESS": "台北市信義區信義路五段7號",
        "BANK_ACCOUNT": "012-1234567890",
        "SELLER_NAME": "快樂毛孩寵物旅館",
        "BUSINESS_CODE": "12345678"
      },
      {
        "PROPERTY_ID": "P0002",
        "PROPERTY_NAME": "快樂毛孩-台北大安館",
        "TEL": "02-27001235",
        "POSTAL_CODE": "106",
        "ADDRESS": "台北市大安區敦化南路二段123號",
        "BANK_ACCOUNT": "012-1234567891",
        "SELLER_NAME": "快樂毛孩寵物旅館",
        "BUSINESS_CODE": "12345678"
      },
      {
        "PROPERTY_ID": "P0003",
        "PROPERTY_NAME": "愛心寶貝-新北板橋館",
        "TEL": "02-29501234",
        "POSTAL_CODE": "220",
        "ADDRESS": "新北市板橋區中山路一段50號",
        "BANK_ACCOUNT": "012-2345678901",
        "SELLER_NAME": "愛心寶貝寵物住宿",
        "BUSINESS_CODE": "23456789"
      }
    ];

    this.loading = false;
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
      // TODO: 呼叫 API 刪除旅館
      // this.http.delete(`/api/hotels/${this.selectedHotel.PROPERTY_ID}`).subscribe(...);

      // 從列表中移除
      this.hotelList = this.hotelList.filter(h => h.PROPERTY_ID !== this.selectedHotel!.PROPERTY_ID);

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
}
