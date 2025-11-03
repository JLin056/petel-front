import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';
import { propertyList } from '../../core/interfaces/MERCH013Res.interface';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { UpdateSellerInfoDialog } from '../update-seller-info-dialog/update-seller-info-dialog';
import { AdminService } from '../../core/services/admin.service';
import { MERCH010Tranrq } from '../../core/interfaces/MERCH010Req.interface';
import { PropertyStateService } from '../../core/services/property-state.service';
import { MediaService } from '../../core/services/media.service';
import { Subscription } from 'rxjs';
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-user-merchant-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    SharedConfirmDialog,
    UpdateSellerInfoDialog,
    ButtonModule
],
  templateUrl: './user-merchant-page.html',
  styleUrls: ['./user-merchant-page.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserMerchantPage implements OnInit, OnDestroy {
  /** editVisible */
  editVisible = false;
  /** deleteOrderVisible */
  deletePropertyVisible = false;
  /** showFillDialog */
  showFillDialog = false;
  /** propertyToDelete */
  propertyToDelete: any = null;
  /** hotelList */
  hotelList: propertyList[] = [];
  /** isLoading */
  isLoading = false;
  /** isLoadingHotels */
  isLoadingHotels = false;
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

  /** 儲存旅館首圖 */
  hotelImages: { [hotelId: string]: string } = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private confirm: ConfirmationService,
    private toast: MessageService,
    private router: Router,
    private merchService: MerchService,
    private adminService: AdminService,
    private propertyStateService: PropertyStateService,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.fetchSellerInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /** 取得商家會員資訊 */
  fetchSellerInfo(): void {
    this.isLoading = true;
    const accountId = localStorage.getItem('accountId');

    if (!accountId) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得帳號資訊，請重新登入' });
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/merchants/login']), 2000);
      return;
    }

    const sub = this.merchService.getSellerInfo(accountId).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          const data = res.TRANRS;
          this.user = {
            accountId: data.accountId,
            name: data.name,
            email: data.email || '無電子郵件',
            phone: data.phone || '無電話號碼',
            avatarUrl: data.mediaId ? `data:image/png;base64,${data.mediaId}` : 'assets/img/avatar.png',
            id: data.id,
            mediaId: data.mediaId
          };
          if (data.id) {
            this.loadHotels(data.id);
          }
        } else {
          this.toast.add({ severity: 'error', summary: '錯誤', detail: '取得商家資訊失敗' });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API 錯誤:', err);
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '載入失敗，請稍後再試' });
      }
    });

    this.subscriptions.push(sub);
  }

  /** 修改會員資訊彈跳視窗 */
  openEdit() {
    this.showFillDialog = true;
  }

  /** 儲存修改後的會員資訊 */
  onDialogSave(updated: { name: string; phone: string; avatarMediaId?: string }) {
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

    const sub = this.merchService.editSellerInfo(tranrq).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.toast.add({ severity: 'success', summary: '成功', detail: '會員資料已更新' });
          this.user = {
            ...this.user,
            ...updated,
            avatarUrl: updated.avatarMediaId
              ? `data:image/png;base64,${updated.avatarMediaId}`
              : this.user.avatarUrl,
            mediaId: updated.avatarMediaId || this.user.mediaId
          };
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

    this.subscriptions.push(sub);
  }

  /** 取消修改 */
  onDialogCancel() {
    this.showFillDialog = false;
  }

  /** 載入商家底下旅館列表 */
  loadHotels(sellerId: string): void {
    this.isLoadingHotels = true;
    const tranrq = { sellerId };

    const sub = this.merchService.querySellerProperties(tranrq).subscribe({
      next: (res) => {
        this.isLoadingHotels = false;
        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
          this.hotelList = res.TRANRS.properties || [];
          this.loadHotelImages();
        } else {
          this.hotelList = [];
          this.toast.add({ severity: 'error', summary: '錯誤', detail: '取得旅館列表失敗' });
        }
      },
      error: (err) => {
        this.isLoadingHotels = false;
        this.hotelList = [];
        console.error('載入旅館列表失敗:', err);
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '載入旅館列表失敗' });
      }
    });

    this.subscriptions.push(sub);
  }

  /** 串旅館首圖 */
  private loadHotelImages(): void {
    this.hotelList.forEach(property => {
      if (!property.id) return;

      console.log(`🖼️ 載入旅館 ${property.name} (ID: ${property.id}) 封面圖片`);

      const sub = this.mediaService.onGetMediaApi({
        MWHEADER: { MSGID: 'MEDIA-004' },
        TRANRQ: { propertyId: property.id }
      }).subscribe({
        next: (res) => {
          if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias?.length > 0) {
            console.log(`📊 ${property.name} 原始圖片資料:`, res.TRANRS.medias.map((m: any) => ({
              mediaId: m.mediaId,
              sortOrder: m.sortOrder,
              fileName: m.fileName
            })));

            // 排序取第一張
            const sorted = res.TRANRS.medias.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const first = sorted[0];

            this.hotelImages[property.id] = `data:image/jpeg;base64,${first.base64Data}`;
            console.log(`✅ ${property.name} 封面圖設定完成`);
          } else {
            console.warn(`⚠️ ${property.name} 沒有圖片，使用預設圖`);
            this.hotelImages[property.id] = 'img/hotelImg.png';
          }
        },
        error: (err) => {
          console.error(`❌ ${property.name} 封面圖載入失敗`, err);
          this.hotelImages[property.id] = 'img/hotelImg.png';
        }
      });

      this.subscriptions.push(sub);
    });
  }


  /** 取得旅館首圖 */
  getHotelImage(hotelId: string): string {
    return this.hotelImages[hotelId] || 'img/hotelImg.png';
  }

  /** 進入單筆旅館首頁 */
  onPropertyClick(property: propertyList): void {
    if (!property || !property.id) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館資訊' });
      return;
    }
    this.propertyStateService.setCurrentPropertyId(property.id, property.name);
    this.router.navigate(['/merchants/property/homepage']);
  }

  /** 新增旅館 */
  onAddHotel() {
    this.router.navigate(['/merchants/property/insert']);
  }

  /** 修改旅館 */
  onEditHotel(property: any): void {
    if (!property || !property.id) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館資訊' });
      return;
    }
    this.router.navigate(['/merchants/property/edit'], { state: { property } });
  }

  /** 詳細旅館資訊頁 */
  onHotelDetail(property: any): void {
    if (!property || !property.id) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館資訊' });
      return;
    }
    this.router.navigate(['/merchants/property/info'], { state: { propertyId: property.id } });
  }

  /** 刪除旅館確認框 */
  showDeleteHotelConfirm(property: any) {
    if (!property || !property.id) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館資訊' });
      return;
    }
    this.propertyToDelete = property;
    this.deletePropertyVisible = true;
  }

  /** 刪除旅館 */
  onDelete() {
    if (!this.propertyToDelete || !this.propertyToDelete.id) {
      this.toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館，請稍後再試' });
      return;
    }
    this.isDeleting = true;

    const postData = {
      MWHEADER: { MSGID: 'ADMIN-006' },
      TRANRQ: { propertyId: this.propertyToDelete.id }
    };

    const sub = this.adminService.deleteHotel(postData).subscribe({
      next: (res) => {
        this.isDeleting = false;
        if (res.MWHEADER.RETURNCODE === '0000') {
          const index = this.hotelList.indexOf(this.propertyToDelete);
          if (index > -1) this.hotelList.splice(index, 1);
          this.toast.add({ severity: 'success', summary: '成功', detail: '旅館已刪除' });
          this.propertyToDelete = null;
          this.deletePropertyVisible = false;
        } else {
          this.toast.add({ severity: 'error', summary: '錯誤', detail: '刪除旅館失敗' });
        }
      },
      error: (err) => {
        console.error('刪除失敗:', err);
        this.isDeleting = false;
        this.deletePropertyVisible = false;
        this.propertyToDelete = null;
        this.toast.add({ severity: 'error', summary: '錯誤', detail: '刪除旅館失敗' });
      }
    });

    this.subscriptions.push(sub);
  }

  /** 追蹤 hotelList 的 trackBy */
  trackByHotelId(index: number, hotel: any): string {
    return hotel.id;
  }
}
