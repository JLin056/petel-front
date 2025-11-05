import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ADMIN003Req } from '../../core/interfaces/ADMIN003Req.interface';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { AdminService } from '../../core/services/admin.service';
import { PropertyStateService } from '../../core/services/property-state.service';
import { MerchantOrderDetailDialog } from "../merchant-order-detail-dialog/merchant-order-detail-dialog";

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
  constructor(
    private adminService: AdminService,
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
  searchCheckIn: string = '';
  searchUserName: string = '';

  /** showDetailDialog */
  showDetailDialog = false;
  selectedOrder: Order | null = null;

  ngOnInit() {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();
    this.propertyName = this.propertyStateService.getCurrentPropertyName();
    this.initStatuses();
    this.loadOrders();
  }

  /**
   * 初始化狀態選項
   */
  initStatuses() {
    this.statuses = [
      { label: '未付款', value: '未付款' },
      { label: '已付款', value: '已付款' },
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

    const postData: ADMIN003Req = {
      MWHEADER: {
        MSGID: 'ADMIN-003'
      },
      TRANRQ: {
        page: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        },
        propertyName: this.propertyName
      }
    };
    // 加入篩選條件
    if (this.searchOrderId) {
      postData.TRANRQ.ORDER_ID = this.searchOrderId;
    }
    if (this.searchCheckIn) {
      postData.TRANRQ.CHECK_IN = this.searchCheckIn;
    }
    if (this.searchUserName) {
      postData.TRANRQ.userName = this.searchUserName;
    }

    this.adminService.queryOrders(postData).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          const allOrders = res.TRANRS?.orders || [];
          if (this.propertyId) {
            this.orderList = allOrders.filter(o => o.PROPERTY_NAME === this.propertyName);
          } else {
            this.orderList = allOrders;
          }
          this.totalRecords = res.TRANRS.totalCount || 0;

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
    this.searchCheckIn = '';
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
   * 狀態更新事件（從 dialog 接收）
   */
  onStatusUpdated(data: { orderId: string; status: string }) {
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