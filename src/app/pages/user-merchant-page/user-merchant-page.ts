import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { Toast } from "primeng/toast";
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { UpdateUserDialog } from "../update-user-dialog/update-user-dialog";
import { Router } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';


@Component({
  selector: 'app-user-merchant-page',
  imports: [Button, Toast, SharedConfirmDialog, UpdateUserDialog],
  templateUrl: './user-merchant-page.html',
  styleUrl: './user-merchant-page.css',
  providers: [MessageService] // 確保 Toast 使用的 MessageService 可用
})
export class UserMerchantPage implements OnInit { // 實作 OnInit 介面
  editVisible = false;
  deleteUserVisible = false;
  deleteOrderVisible = false;
  isLoading = true; // 新增 loading 狀態

  // 修正 user 屬性的型別，匹配 API 介面，並給予預設值
  // Partial<MERCH011Tranrs & { avatarUrl: string }> 表示它是部分 MERCH011Tranrs 資料加上 avatarUrl
  user: Partial<MERCH011Tranrs & { avatarUrl: string }> = {
    accountId: '',
    name: '載入中...',
    email: '載入中...',
    phone: '載入中...',
    avatarUrl: 'img/avatar.png', // 預設頭貼路徑
  };


  // 要操作的 訂單ID
  currentOrderId?: string;

  constructor(
    private confirm: ConfirmationService,
    private toast: MessageService,
    private router: Router,
    private merchService: MerchService // 注入 MerchService
  ) { }

  ngOnInit(): void {
    this.fetchSellerInfo(); // 在元件初始化時取得商家資訊
  }

  /**
   * 取得商家會員資訊 (MERCH-011)
   */
  fetchSellerInfo(): void {
    this.isLoading = true;
    this.merchService.getSellerInfo().subscribe({
      next: (res) => {
        this.isLoading = false;
        // 檢查回傳碼和資料是否存在
        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          const data = res.TRANRS;
          console.log('商家資訊取得成功:', data);

          // 💡 使用 API 取得的資料更新 user 物件
          this.user = {
            accountId: data.accountId,
            name: data.name,
            email: data.email || '無電子郵件',
            phone: data.phone || '無電話號碼',
            // 處理 mediaId，這裡假設如果 mediaId 存在，就建立頭貼路徑
            avatarUrl: data.mediaId ? `img/avatars/${data.mediaId}.png` : 'img/avatar.png',
            id: data.id,
            mediaId: data.mediaId
          };

        } else {
          // 顯示 API 錯誤訊息
          this.toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: `取得商家資訊失敗: '未知錯誤'`
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API 錯誤:', err);
        this.toast.add({
          severity: 'error',
          summary: '網路錯誤',
          detail: '無法連接伺服器，請稍後再試。'
        });
      }
    });
  }


  openEdit() {
    this.editVisible = true;
  }
  onEditSaved(updated: any) {
    this.user = { ...this.user, ...updated };
  }

  showConfirm() {
    this.deleteUserVisible = true;
  }

  // 確認刪除會員
  onDeleteUserConfirmed() {
    // 執行刪除會員的邏輯
    console.log('刪除會員');
    // 呼叫你的 service 來刪除會員
    // this.userService.deleteUser(this.user.id).subscribe(...);

    this.deleteUserVisible = false;

    // 顯示成功訊息
    this.toast.add({
      severity: 'success',
      summary: '成功',
      detail: '會員已刪除'
    });
  }

  // 顯示取消訂單確認
  confirmDeleteOrder(event: Event, orderId?: string) {
    this.currentOrderId = orderId;
    this.deleteOrderVisible = true;
  }

  // 確認取消訂單
  onDeleteOrderConfirmed() {
    // 執行取消訂單的邏輯
    console.log('取消訂單', this.currentOrderId);
    // 呼叫你的 service 來取消訂單
    // this.orderService.cancelOrder(this.currentOrderId).subscribe(...);

    this.deleteOrderVisible = false;

    // 顯示成功訊息
    this.toast.add({
      severity: 'success',
      summary: '成功',
      detail: '訂單已取消'
    });
  }

  onPropertyClick(): void {
    this.router.navigate(['/merchants/property/homepage']);
  }
}
