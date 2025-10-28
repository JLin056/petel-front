import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { Toast } from "primeng/toast";
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { UpdateUserDialog } from "../update-user-dialog/update-user-dialog";
import { Router } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';
import { UpdateSellerInfoDialog } from '../update-seller-info-dialog/update-seller-info-dialog';


@Component({
  selector: 'app-user-merchant-page',
  imports: [Button, Toast, SharedConfirmDialog, UpdateSellerInfoDialog],
  templateUrl: './user-merchant-page.html',
  styleUrl: './user-merchant-page.css',
  providers: [MessageService]
})
export class UserMerchantPage implements OnInit {
  editVisible = false;
  deleteUserVisible = false;
  deleteOrderVisible = false;
  /** deleteRoomVisible */
  deletePropertyVisible = false;
  /** roomToDelete */
  propertyToDelete: any = null;
  /** roomList */
  hotelList: any[] = [];

  /** isLoading */
  isLoading = false;
  /** isDeleting */
  isDeleting = false;
  /** errorMessage */
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
    private merchService: MerchService
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
    console.log('1. 從 localStorage 取得的 accountId:', accountId);
    console.log('2. accountId 類型:', typeof accountId);
    console.log('3. accountId 長度:', accountId?.length);

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

    // 👈 在這裡加入 console.log 看實際發送的內容
    console.log('4. 準備發送 API 請求');

    this.merchService.getSellerInfo(accountId).subscribe({
      next: (res) => {
        console.log('5. API 回應成功:', res);
        this.isLoading = false;

        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          const data = res.TRANRS;
          console.log('商家資訊取得成功', data);

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
              ? `assets/img/avatars/${data.mediaId}.png`
              : 'assets/img/avatar.png'
          };

        } else {
          console.log('7. API 回傳錯誤:', res.MWHEADER);
          this.toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: `取得商家資訊失敗`
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('8. API 錯誤:', err);
        console.error('錯誤詳情:', err.error);
      }
    });
  }

  openEdit() {
    this.editVisible = true;
  }

  onEditSaved(updated: any) {
    this.user = { ...this.user, ...updated };
    this.fetchSellerInfo(); // 如果想立即重新抓 API 更新資料
  }


  showConfirm() {
    this.deleteUserVisible = true;
  }

  onDeleteUserConfirmed() {
    // 呼叫你的 service 來刪除會員
    // this.userService.deleteUser(this.user.id).subscribe(...);

    this.deleteUserVisible = false;

    // 顯示成功訊息
    this.toast.add({
      severity: 'success',
      summary: '成功',
      detail: '會員已刪除'
    });

    // 👈 刪除後清除 localStorage 並導回登入頁
    localStorage.removeItem('accountId');
    localStorage.removeItem('token');
    setTimeout(() => {
      this.router.navigate(['/merchants/login']);
    }, 1500);
  }

  onPropertyClick(): void {
    this.router.navigate(['/merchants/property/homepage']);
  }

  onAddHotel() {
    this.router.navigate(['/merchants/property/insert']);
  }

  onEditHotel(property: any): void {
    if (!property || !property.id) {
      this.errorMessage = '無法取得房型資料';
      return;
    }
    this.router.navigate(['/merchants/property/edit'], {
      state: { property: property }
    });
  }

  onHotelDetail(property: any): void {
    if (!property || !property.id) {
      this.errorMessage = '無法取得旅館 ID (property.id 遺失)。請檢查後端 API 返回的旅館物件中 ID 欄位的名稱。';
      console.error(this.errorMessage, property);
      return;
    }
    this.router.navigate(['/merchants/property/info'], { state: { propertyId: property.id } });
  }

  showDeleteHotelConfirm(property: any) {
    if (!property || !property.id) {
      this.errorMessage = '無法取得旅館';
      return;
    }
    this.propertyToDelete = property;
    this.deletePropertyVisible = true;
    this.errorMessage = '';
  }

  /**
   * 刪除
   */
  onDelete() {
    if (!this.propertyToDelete || !this.propertyToDelete.id) {
      this.errorMessage = '無法取得旅館，請稍後再試';
      return;
    }
    this.isDeleting = true;
    this.errorMessage = '';

    this.merchService.deleteRoomDetail(this.propertyToDelete.id).subscribe({
      next: (res) => {
        console.log('刪除API回應', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          const index = this.hotelList.indexOf(this.propertyToDelete);
          if (index > -1) {
            this.hotelList.splice(index, 1);
          }
          console.log('已成功刪除旅館', this.propertyToDelete.name)
          this.propertyToDelete = null;
          this.deletePropertyVisible = false;
        } else {
          this.errorMessage = '刪除失敗';
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('刪除失敗', err);
        this.errorMessage = err.error?.TRANRS?.message || '刪除旅館時發生錯誤，請稍後再試';
        this.isDeleting = false;
        this.deletePropertyVisible = false;
        this.propertyToDelete = null;
      }
    });
  }

  // loadHotels(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';

  //   const tranrq = {
  //     propertyId: this.confirm
  //   };

  //   this.merchService.queryPropertyRooms(tranrq).subscribe({
  //     next: (res) => {
  //       console.log('API 回應:', res);

  //       if (res.MWHEADER.RETURNCODE === '0000') {
  //         this.roomList = (res.TRANRS?.rooms || []).map((room: any) => ({
  //           ...room,
  //           // 轉換 petTypeId 成 petTypeName
  //           petTypeName: this.petTypeMap[room.petTypeId] || '未知寵物',
  //           // 格式化 roomSize，將 "100x200x300" 轉換成 "100公分 x 200公分 x 300公分"
  //           formattedRoomSize: this.formatRoomSize(room.roomSize)
  //         }));
  //         this.stats = res.TRANRS?.stats?.length > 0 ? res.TRANRS.stats : this.stats;
  //         console.log('房間列表載入成功', this.roomList);
  //       } else {
  //         this.errorMessage = '載入房型列表失敗';
  //         this.roomList = [];
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('載入房間列表失敗', err);
  //       this.errorMessage = '無法載入房型列表，請稍後再試';
  //       this.isLoading = false;
  //       this.roomList = [];
  //     }
  //   });
  }
