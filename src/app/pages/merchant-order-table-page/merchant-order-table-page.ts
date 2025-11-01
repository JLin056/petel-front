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

  propertyId: string = '';
  propertyName: string = '';
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
        console.log('TRANRS:', res.TRANRS);
        console.log('orders 陣列:', res.TRANRS?.orders);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.orderList = res.TRANRS?.orders || [];
          this.totalRecords = res.TRANRS?.totalCount || 0;
          console.log('訂單列表載入成功，總數:', this.totalRecords);
          console.log('訂單列表:', this.orderList);

          if (this.orderList.length > 0) {
            const firstOrder = this.orderList[0];
          }
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
      case '已確認':
        return 'info';
      case '待付款':
        return 'warn';
      case '已取消':
        return 'danger';
      default:
        return null;
    }
  }

  /**
   * 狀態更新事件（從 dialog 接收）
   */
  onStatusUpdated(data: { orderId: string; status: string }) {
    console.log('訂單狀態已更新:', data);

    // 更新列表中的訂單狀態
    const index = this.orderList.findIndex(o => o.ORDER_ID === data.orderId);
    if (index !== -1) {
      this.orderList[index].STATUS = data.status;
    }

    if (this.selectedOrder && this.selectedOrder.ORDER_ID === data.orderId) {
      this.selectedOrder.STATUS = data.status;
    }
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