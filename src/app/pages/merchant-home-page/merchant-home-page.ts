import { Component, OnInit } from '@angular/core';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { Router } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merchant-home-page',
  imports: [CommonModule, SharedConfirmDialog],
  templateUrl: './merchant-home-page.html',
  styleUrl: './merchant-home-page.css'
})
export class MerchantHomePage implements OnInit {
  /** deleteRoomVisible */
  deleteRoomVisible = false;
  /** roomToDelete */
  roomToDelete: any = null;
  /** propertyId */
  propertyId: string = '';
  /** roomList */
  roomList: any[] = [];
  /** status */
  stats: any[] = [];
  /** isLoading */
  isLoading = false;
  /** isDeleting */
  isDeleting = false;
  /** errorMessage */
  errorMessage = '';

  /**
   * 注入
   * @param router 
   * @param merchService 
   */
  constructor(private router: Router, private merchService: MerchService) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  /**
   * 載入房間列表
   */
  loadRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const tranrq = {
      propertyId: this.propertyId
    };

    this.merchService.queryPropertyRooms(tranrq).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.roomList = res.TRANRS?.rooms || [];
          this.stats = res.TRANRS?.stats || [];
          console.log('房間列表載入成功', this.roomList);
        } else {
          this.errorMessage = '載入房型列表失敗';
          this.roomList = [];
          this.stats = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入房間列表失敗', err);
        this.errorMessage = '無法載入房型列表，請稍後再試';
        this.isLoading = false;
        this.roomList = [];
        this.stats = [];
      }
    });
  }

  /**
   * 新增房型
   */
  onAdd(): void {
    this.router.navigate(['/merchants/property/roomInfo/insert'])
  }

  /**
   * 修改房型
   * @param room 
   * @returns 
   */
  onEdit(room: any): void {
    if (!room || !room.id) {
      this.errorMessage = '無法取得房型資料';
      return;
    }
    this.router.navigate(['/merchants/property/roomInfo/edit'], {
      state: { room: room }
    });
  }

  /**
   * 顯示刪除確認對話框
   * @param room 
   */
  showDeleteConfirm(room: any) {
    if (!room || !room.id) {
      this.errorMessage = '無法取得房型，請稍後再試';
      return;
    }
    this.roomToDelete = room;
    this.deleteRoomVisible = true;
    this.errorMessage = '';
  }

  /**
   * 刪除
   */
  onDelete() {
    if (!this.roomToDelete || !this.roomToDelete.id) {
      this.errorMessage = '無法取得房型，請稍後再試';
      return;
    }
    this.isDeleting = true;
    this.errorMessage = '';

    this.merchService.deleteRoomDetail(this.roomToDelete.id).subscribe({
      next: (res) => {
        console.log('刪除API回應', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          const index = this.roomList.indexOf(this.roomToDelete);
          if (index > -1) {
            this.roomList.splice(index, 1);
          }
          console.log('已成功刪除房型', this.roomToDelete.name)
          this.roomToDelete = null;
          this.deleteRoomVisible = false;
        } else {
          this.errorMessage = '刪除失敗';
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('刪除失敗', err);
        this.errorMessage = err.error?.TRANRS?.message || '刪除房型時發生錯誤，請稍後再試';
        this.isDeleting = false;
        this.deleteRoomVisible = false;
        this.roomToDelete = null;
      }
    });
  }
}

