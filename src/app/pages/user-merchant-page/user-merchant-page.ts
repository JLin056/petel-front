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
  isLoading = true;

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
}