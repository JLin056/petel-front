import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { AdminService } from '../../core/services/admin.service';
import { MerchantOrderDetailDialog } from "../merchant-order-detail-dialog/merchant-order-detail-dialog";
import { PropertyStateService } from '../../core/services/property-state.service';
import { MerchService } from '../../core/services/merch-service';
import { MERCH014Tranrq } from '../../core/interfaces/MERCH014Req.interface';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-merchant-order-table-page',
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
    MerchantOrderDetailDialog,
    DatePickerModule
  ],
  templateUrl: './merchant-order-table-page.html',
  styleUrl: './merchant-order-table-page.css'
})
export class MerchantOrderTablePage implements OnInit {
  toggleStatusMenu($event: PointerEvent, _t52: any) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private adminService: AdminService,
    private merchService: MerchService,
    private propertyStateService: PropertyStateService
  ) { }

  /** 當前旅館 ID */
  propertyId: string = '';
  /** 當前旅館名稱 */
  propertyName: string = '';
  /** 當前選中要修改狀態的訂單 */
  currentEditingOrder: Order | null = null;

  orderList: Order[] = [];
  statuses: Status[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  // 分頁相關
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  // 搜尋條件
  searchOrderId: string = '';
  searchUserName: string = '';
  searchCheckIn: Date | null = null;

  // 詳細資料彈窗相關
  showDetailDialog = false;
  selectedOrder: Order | null = null;

  ngOnInit() {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();
    this.propertyName = this.propertyStateService.getCurrentPropertyName();
    console.log('訂單管理頁面取得的 propertyId:', this.propertyId);
    console.log('訂單管理頁面取得的 propertyName:', this.propertyName);

    this.initStatuses();
    this.loadOrders();
  }

  /**
   * 初始化狀態選項
   */
  initStatuses() {
    this.statuses = [
      { label: '待付款', value: '待付款' },
      { label: '已確認', value: '已確認' },
      { label: '已完成', value: '已完成' },
      { label: '已取消', value: '已取消' }
    ];
  }

  /**
   * 載入訂單列表
   */
  loadOrders() {
    this.loading = true;
    this.errorMessage = '';

    const postData = {
      MWHEADER: {
        MSGID: 'ADMIN-003'
      },
      TRANRQ: {
        ORDER_ID: this.searchOrderId || undefined,
        CHECK_IN: this.searchCheckIn ? this.formatDate(this.searchCheckIn) : undefined,
        userName: this.searchUserName || undefined,
        propertyName: this.propertyName || undefined,
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }
    };

    this.adminService.queryOrders(postData).subscribe({
      next: (res) => {
        console.log('=== ADMIN-003 API 完整回應 ===');
        console.log('回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.orderList = res.TRANRS?.orders || [];
          this.totalRecords = res.TRANRS?.totalCount || 0;
          console.log('訂單列表載入成功，總數:', this.totalRecords);
          console.log('訂單列表:', this.orderList);

          // 檢查每個訂單的房型和數量資訊
          this.orderList.forEach((order, index) => {
            console.log(`訂單 ${index + 1} (${order.ORDER_ID}):`, {
              房型名稱: order.ROOM,
              訂購數量: order.QUANTITY,
              完整訂單: order
            });

            if (!order.ROOM) {
              console.warn(`⚠️ 訂單 ${order.ORDER_ID} 缺少房型名稱 (ROOM)`);
            }
            if (!order.QUANTITY) {
              console.warn(`⚠️ 訂單 ${order.ORDER_ID} 缺少訂購數量 (QUANTITY)`);
            }
          });
        } else {
          this.orderList = [];
          console.error('API 返回錯誤:', res.MWHEADER);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('載入訂單列表失敗', err);
        this.loading = false;
        this.orderList = [];
      }
    });
  }

  /**
   * 搜尋訂單
   */
  onSearch() {
    this.currentPage = 1;
    this.loadOrders();
  }

  /**
   * 清除搜尋條件
   */
  onClearSearch() {
    this.searchOrderId = '';
    this.searchUserName = '';
    this.searchCheckIn = null;
    this.currentPage = 1;
    this.loadOrders();
  }

  /**
   * 分頁事件
   */
  onPageChange(event: any) {
    this.currentPage = (event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadOrders();
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    switch (status) {
      case '已完成':
        return 'success';
      case '已付款':
        return 'info';
      case '未付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }

  /**
   * 狀態變更事件
   */
  onStatusChange(order: Order) {
    console.log('訂單狀態已變更:', order.ORDER_ID, '新狀態:', order.STATUS);

    const tranrq: MERCH014Tranrq = {
      id: order.ORDER_ID,
      status: order.STATUS
    };

    this.merchService.updateOrderStatus(tranrq).subscribe({
      next: (res) => {
        console.log('狀態更新成功:', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          // 狀態更新成功，訂單已在 ngModel 雙向綁定中自動更新
          console.log('訂單', order.ORDER_ID, '狀態已更新為', order.STATUS);
        } else {
          console.error('狀態更新失敗:', res.MWHEADER);
          // 可以在這裡添加錯誤提示
        }
      },
      error: (err) => {
        console.error('狀態更新失敗:', err);
        // 可以在這裡添加錯誤提示並恢復原狀態
      }
    });
  }

  /**
   * 更新備註
   */
  onNoteUpdated(data: { orderId: string, note: string }) {
    const orderIndex = this.orderList.findIndex(o => o.ORDER_ID === data.orderId);
    if (orderIndex !== -1) {
      this.orderList[orderIndex].NOTE = data.note;
    }

    if (this.selectedOrder && this.selectedOrder.ORDER_ID === data.orderId) {
      this.selectedOrder.NOTE = data.note;
    }
    console.log('備註已更新:', data);
  }

  showOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.showDetailDialog = true;
  }

  formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date; 
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd = ('0' + d.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }
}