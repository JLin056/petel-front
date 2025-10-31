import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';
import { propertyList } from '../../core/interfaces/MERCH013Res.interface';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { UpdateSellerInfoDialog } from '../update-seller-info-dialog/update-seller-info-dialog';
import { AdminService } from '../../core/services/admin.service';
import { MERCH010Tranrq } from '../../core/interfaces/MERCH010Req.interface';

@Component({
  selector: 'app-user-merchant-page',
  imports: [
    CommonModule,
    Toast,
    SharedConfirmDialog,
    UpdateSellerInfoDialog
  ],
  templateUrl: './user-merchant-page.html',
  styleUrl: './user-merchant-page.css',
  providers: [MessageService]
})
export class UserMerchantPage implements OnInit {
  editVisible = false;
  deleteUserVisible = false;
  deleteOrderVisible = false;
  deletePropertyVisible = false;
  showFillDialog = false;  // 👈 加入這行
  propertyToDelete: any = null;
  hotelList: propertyList[] = [];
  isLoading = false;
  isLoadingHotels = false;
  isDeleting = false;
  errorMessage = '';

  user: Partial<MERCH011Tranrs & { avatarUrl: string }> = {
    accountId: '',
    name: '載入中...',
    email: '載入中...',
    phone: '載入中...',
    avatarUrl: 'img/avatar.png',
  };

  constructor(
    private confirm: ConfirmationService,
    private toast: MessageService,
    private router: Router,
    private merchService: MerchService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.fetchSellerInfo();
  }

  /**
   * 取得商家會員資訊 (MERCH-011)
   */
  fetchSellerInfo(): void {
    this.isLoading = true;
    const accountId = localStorage.getItem('accountId');

    console.log('=== 開始取得商家資訊 ===');
    console.log('1. accountId:', accountId);

    if (!accountId) {
      this.toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: '無法取得帳號資訊，請重新登入'
      });
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/merchants/login']);
      }, 2000);
      return;
    }

    this.merchService.getSellerInfo(accountId).subscribe({
      next: (res) => {
        console.log('商家資訊 API 回應:', res);
        this.isLoading = false;

        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          const data = res.TRANRS;
          this.user = {
            accountId: data.accountId,
            name: data.name,
            email: data.email || '無電子郵件',
            phone: data.phone || '無電話號碼',
            avatarUrl: data.mediaId
              ? `assets/img/avatars/${data.mediaId}.png`
              : 'assets/img/avatar.png',
            id: data.id,
            mediaId: data.mediaId
          };
          if (data.id) {
            this.loadHotels(data.id);
          }
        } else {
          this.toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: '取得商家資訊失敗'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API 錯誤:', err);
        this.toast.add({
          severity: 'error',
          summary: '錯誤',
          detail: '載入失敗，請稍後再試'
        });
      }
    });
  }

  /**
   * 修改會員資訊彈跳視窗
   */
  openEdit() {
    this.showFillDialog = true; // 打開彈窗
  }

  /**
   * 儲存修改後的會員資訊
   * @param updated
   * @returns
   */
  onDialogSave(updated: { name: string; phone: string; avatarMediaId: string | undefined }) {
    if (!this.user.accountId) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '找不到帳號資料' });
      return;
    }

    const tranrq: MERCH010Tranrq = {
      accountId: this.user.accountId,
      name: updated.name,
      phone: updated.phone,
      mediaId: updated.avatarMediaId
    };

    this.merchService.editSellerInfo(tranrq).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.toast.add({ severity: 'success', summary: '成功', detail: '會員資料已更新' });
          // 更新 user 資料
          this.user = { ...this.user, name: updated.name, phone: updated.phone };
          this.showFillDialog = false;
        } else {
          this.toast.add({ severity: 'error', summary: '錯誤', detail: res.MWHEADER.RETURNDESC || '修改失敗' });
        }
      },
      error: (err) => {
        console.error('修改會員失敗', err);
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '修改會員資訊失敗' });
      }
    });
  }

  /**
   * 取消修改
   */
  onDialogCancel() {
    this.showFillDialog = false;
  }

  /**
   * 旅館圖片
   */
  getHotelImage(hotelId: string): string {
    // 之後可改為實際 API
    return 'img/hotelImg.png';
  }

  trackByHotelId(index: number, hotel: any): string {
    return hotel.id;
  }

  /**
   * 載入商家底下的旅館列表 (MERCH-013)
   */
  loadHotels(sellerId: string): void {
    this.isLoadingHotels = true;
    this.errorMessage = '';

    console.log('=== 開始載入旅館列表 ===');
    console.log('sellerId:', sellerId);

    if (!sellerId) {
      this.errorMessage = '無法取得商家帳號資訊';
      this.isLoadingHotels = false;
      this.toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      return;
    }

    const tranrq = { sellerId };

    this.merchService.querySellerProperties(tranrq).subscribe({
      next: (res) => {
        console.log('旅館列表 API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          this.hotelList = res.TRANRS.properties || [];
          console.log('旅館列表載入成功，數量:', this.hotelList.length);
          console.log('旅館列表內容:', this.hotelList);
        } else {
          this.errorMessage = res.MWHEADER.RETURNDESC || '載入旅館列表失敗';
          this.hotelList = [];
          this.toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: this.errorMessage
          });
        }
        this.isLoadingHotels = false;
      },
      error: (err) => {
        console.error('載入旅館列表失敗:', err);
        this.errorMessage = '無法載入旅館列表，請稍後再試';
        this.isLoadingHotels = false;
        this.hotelList = [];
        this.toast.add({
          severity: 'error',
          summary: '錯誤',
          detail: this.errorMessage
        });
      }
    });
  }

  /**
   * 進入單筆旅館首頁
   */
  onPropertyClick(): void {
    this.router.navigate(['/merchants/property/homepage']);
  }

  /**
   * 新增旅館
   */
  onAddHotel() {
    this.router.navigate(['/merchants/property/insert']);
  }

  /**
   * 修改旅館
   * @param property 
   * @returns 
   */
  onEditHotel(property: any): void {
    if (!property || !property.id) {
      this.errorMessage = '無法取得旅館資料';
      this.toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      return;
    }
    this.router.navigate(['/merchants/property/edit'], {
      state: { property: property }
    });
  }

  /**
   * 詳細旅館資訊頁
   * @param property 
   * @returns 
   */
  onHotelDetail(property: any): void {
    if (!property || !property.id) {
      this.errorMessage = '無法取得旅館 ID';
      console.error(this.errorMessage, property);
      this.toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      return;
    }
    this.router.navigate(['/merchants/property/info'], {
      state: { propertyId: property.id }
    });
  }

  /**
   * 刪除旅館確認框
   * @param property 
   * @returns 
   */
  showDeleteHotelConfirm(property: any) {
    if (!property || !property.id) {
      this.errorMessage = '無法取得旅館';
      this.toast.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      return;
    }
    this.propertyToDelete = property;
    this.deletePropertyVisible = true;
    this.errorMessage = '';
  }

  /**
   * 刪除旅館
   */
  onDelete() {
    if (!this.propertyToDelete || !this.propertyToDelete.id) {
      this.errorMessage = '無法取得旅館，請稍後再試';
      return;
    }
    this.isDeleting = true;
    this.errorMessage = '';

    const postData = {
      MWHEADER: { MSGID: 'ADMIN-006' },
      TRANRQ: { propertyId: this.propertyToDelete.id }
    };

    this.adminService.deleteHotel(postData).subscribe({
      next: (res) => {
        console.log('刪除 API 回應:', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          const index = this.hotelList.indexOf(this.propertyToDelete);
          if (index > -1) {
            this.hotelList.splice(index, 1);
          }
          console.log('已成功刪除旅館:', this.propertyToDelete.name);
          this.toast.add({
            severity: 'success',
            summary: '成功',
            detail: '旅館已刪除'
          });
          this.propertyToDelete = null;
          this.deletePropertyVisible = false;
        } else {
          this.errorMessage = res.MWHEADER.RETURNDESC || '刪除失敗';
          this.toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: this.errorMessage
          });
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('刪除失敗:', err);
        this.errorMessage = err.error?.MWHEADER?.RETURNDESC || '刪除旅館時發生錯誤，請稍後再試';
        this.isDeleting = false;
        this.deletePropertyVisible = false;
        this.propertyToDelete = null;
        this.toast.add({
          severity: 'error',
          summary: '錯誤',
          detail: this.errorMessage
        });
      }
    });
  }
}