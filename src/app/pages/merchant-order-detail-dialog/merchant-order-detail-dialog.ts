import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { forkJoin } from 'rxjs';

import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { MerchService } from '../../core/services/merch-service';
import { MERCH014Tranrq } from '../../core/interfaces/MERCH014Req.interface';
import { BookService } from '../../core/services/book-service';
import { BOOK004Req } from '../../core/interfaces/BOOK004Req.interface';
import { MERCH001Tranrq } from '../../core/interfaces/MERCH001Req.interface';
import { MERCH002Tranrq } from '../../core/interfaces/MERCH002Req.interface';
import { PropertyStateService } from '../../core/services/property-state.service';

@Component({
  selector: 'app-merchant-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TagModule, SelectModule],
  templateUrl: './merchant-order-detail-dialog.html',
  styleUrl: './merchant-order-detail-dialog.css'
})
export class MerchantOrderDetailDialog implements OnChanges {
  @Input() visible = false;
  @Input() order: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() noteUpdated = new EventEmitter<{ orderId: string, note: string }>();
  @Output() statusUpdated = new EventEmitter<{ orderId: string, status: string }>();

  editedNote: string = '';
  originalStatus: string = '';
  roomInfo: string = '';
  roomQuantity: number = 0;

  statuses: Status[] = [
    { label: '待付款', value: '待付款' },
    { label: '已確認', value: '已確認' },
    { label: '已完成', value: '已完成' },
    { label: '已取消', value: '已取消' }
  ];

  constructor(
    private merchService: MerchService,
    private bookService: BookService,
    private propertyStateService: PropertyStateService
  ) {}

  ngOnChanges(): void {
    if (this.order) {
      console.log('=== 訂單詳細資料 ngOnChanges ===');
      console.log('訂單 ID:', this.order.ORDER_ID);
      console.log('ADMIN003 回傳的 ROOM:', this.order.ROOM);
      console.log('ADMIN003 回傳的 QUANTITY:', this.order.QUANTITY);

      this.editedNote = this.order.NOTE || '';
      this.originalStatus = this.order.STATUS;

      // 嘗試從 order 取得房型資訊
      if (this.order.ROOM) {
        this.roomInfo = this.order.ROOM;
        console.log('✓ 使用 ADMIN003 的房型名稱:', this.roomInfo);
      }

      if (this.order.QUANTITY) {
        this.roomQuantity = this.order.QUANTITY;
        console.log('✓ 使用 ADMIN003 的數量:', this.roomQuantity);
      }

      // 如果沒有房型資訊，呼叫 MERCH-001 + MERCH-002 API
      if (!this.order.ROOM || !this.order.QUANTITY) {
        console.log('⚠️ ADMIN003 缺少房型或數量資訊，呼叫 MERCH-001 + MERCH-002');
        this.loadRoomInfo();
      }
    }
  }

  /**
   * 載入房型資訊（使用 MERCH-001 + MERCH-002 API）
   */
  private loadRoomInfo(): void {
    if (!this.order) return;

    const propertyId = this.propertyStateService.getCurrentPropertyId();
    console.log('📍 當前 propertyId:', propertyId);
    console.log('📅 訂單入住日期 (CHECK_IN):', this.order.CHECK_IN);

    if (!propertyId) {
      console.error('❌ 無法取得 propertyId，無法載入房型資訊');
      this.roomInfo = '無法取得旅館資訊';
      this.roomQuantity = 0;
      return;
    }

    // 準備 MERCH-001 請求（取得訂單詳情）
    const merch001Req: MERCH001Tranrq = {
      propertyId: propertyId,
      arrivalDate: this.order.CHECK_IN,
      page: {
        pageNumber: 1,
        pageSize: 100
      }
    };

    // 準備 MERCH-002 請求（取得房型列表）
    const merch002Req: MERCH002Tranrq = {
      propertyId: propertyId
    };

    console.log('🔄 呼叫 MERCH-001 請求參數:', merch001Req);
    console.log('🔄 呼叫 MERCH-002 請求參數:', merch002Req);

    // 並行呼叫兩個 API
    forkJoin({
      bookings: this.merchService.queryPropertyBooking(merch001Req),
      rooms: this.merchService.queryPropertyRooms(merch002Req)
    }).subscribe({
      next: (result) => {
        console.log('📦 MERCH-001 完整回應:', result.bookings);
        console.log('📦 MERCH-002 完整回應:', result.rooms);

        if (
          result.bookings.MWHEADER.RETURNCODE === '0000' &&
          result.rooms.MWHEADER.RETURNCODE === '0000' &&
          result.bookings.TRANRS &&
          result.rooms.TRANRS
        ) {
          const orderDetails = result.bookings.TRANRS.order_detail || [];
          const roomsList = result.rooms.TRANRS.rooms || [];

          console.log('📋 訂單詳情 (order_detail):', orderDetails);
          console.log('🏠 房型列表 (rooms):', roomsList);

          if (orderDetails.length === 0) {
            console.warn('⚠️ MERCH-001 回傳的 order_detail 是空的！');
            this.roomInfo = '查無房型資訊';
            this.roomQuantity = 0;
            return;
          }

          // 建立 room_id 到房型名稱的對應表
          const roomMap = new Map(roomsList.map(room => [room.id, room.name]));
          console.log('🗺️ 房型對應表:', Array.from(roomMap.entries()));

          // 計算總房間數量
          const totalQuantity = orderDetails.reduce((sum, detail) => sum + detail.room_quantity, 0);
          this.roomQuantity = totalQuantity;

          // 組合房型名稱（將 room_id 對應到實際房型名稱）
          const roomNames = orderDetails.map(detail => {
            const roomName = roomMap.get(detail.room_id) || detail.room_id;
            console.log(`  - room_id: ${detail.room_id} → ${roomName} (${detail.room_quantity}間)`);
            return `${roomName} (${detail.room_quantity}間)`;
          }).join(', ');

          this.roomInfo = roomNames || '未提供房型資訊';

          console.log('✅ 房型資訊已載入:', this.roomInfo);
          console.log('✅ 總數量:', this.roomQuantity);
        } else {
          console.error('❌ API 回應異常');
          console.error('MERCH-001 RETURNCODE:', result.bookings.MWHEADER.RETURNCODE);
          console.error('MERCH-002 RETURNCODE:', result.rooms.MWHEADER.RETURNCODE);
          this.roomInfo = '無法取得房型資訊';
          this.roomQuantity = 0;
        }
      },
      error: (err) => {
        console.error('❌ 載入房型資訊失敗:', err);
        this.roomInfo = '載入失敗';
        this.roomQuantity = 0;
      }
    });
  }

  onHideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onSave() {
    if (!this.order) return;

    // 檢查狀態是否有變更
    const statusChanged = this.order.STATUS !== this.originalStatus;

    // 如果狀態改為「已取消」，需要呼叫 BOOK-004 API
    if (statusChanged && this.order.STATUS === '已取消') {
      console.log('訂單狀態改為已取消，呼叫取消訂單 API');

      const cancelReq: BOOK004Req = {
        MWHEADER: { MSGID: 'BOOK-004' },
        TRANRQ: { order_id: this.order.ORDER_ID }
      };

      this.bookService.onCancelBookingApi(cancelReq).subscribe({
        next: (res) => {
          console.log('取消訂單 API 回應:', res);
          if (res.MWHEADER.RETURNCODE === '0000') {
            console.log('✅ 訂單已成功取消');
            // 推播應該在後端已經處理
            this.updateOrderStatus();
          } else {
            console.error('取消訂單失敗:', res.MWHEADER);
            alert('取消訂單失敗：' + res.MWHEADER.RETURNDESC);
            // 恢復原狀態
            if (this.order) {
              this.order.STATUS = this.originalStatus;
            }
          }
        },
        error: (err) => {
          console.error('取消訂單 API 錯誤:', err);
          alert('取消訂單時發生錯誤，請稍後再試');
          // 恢復原狀態
          if (this.order) {
            this.order.STATUS = this.originalStatus;
          }
        }
      });
    } else if (statusChanged) {
      // 其他狀態變更，直接更新
      this.updateOrderStatus();
    } else {
      // 只更新備註
      this.updateNote();
    }
  }

  /**
   * 更新訂單狀態
   */
  private updateOrderStatus() {
    if (!this.order) return;

    const tranrq: MERCH014Tranrq = {
      id: this.order.ORDER_ID,
      status: this.order.STATUS
    };

    this.merchService.updateOrderStatus(tranrq).subscribe({
      next: (res) => {
        console.log('狀態更新成功:', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.statusUpdated.emit({
            orderId: this.order!.ORDER_ID,
            status: this.order!.STATUS
          });
          // 更新備註
          this.updateNote();
        } else {
          console.error('狀態更新失敗:', res.MWHEADER);
          alert('狀態更新失敗：' + res.MWHEADER.RETURNDESC);
        }
      },
      error: (err) => {
        console.error('狀態更新失敗:', err);
        alert('狀態更新時發生錯誤，請稍後再試');
      }
    });
  }

  /**
   * 更新備註
   */
  private updateNote() {
    if (!this.order) return;

    this.noteUpdated.emit({
      orderId: this.order.ORDER_ID,
      note: this.editedNote
    });
    console.log('儲存成功');
    this.onHideDialog();
  }

  /**
   * 取得狀態標籤的嚴重程度
   */
  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case '已完成':
        return 'success';
      case '已確認':
      case '已付款':
        return 'info';
      case '待付款':
      case '未付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }
}