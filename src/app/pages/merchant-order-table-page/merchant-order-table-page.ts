import { Component, OnInit } from '@angular/core';
import { Order, Status } from '../../core/interfaces/ADMIN003Res.interface';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { OrderDetailDialog } from '../order-detail-dialog/order-detail-dialog';
import { HttpClient } from '@angular/common/http';

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
    OrderDetailDialog
  ],
  templateUrl: './merchant-order-table-page.html',
  styleUrl: './merchant-order-table-page.css'
})
export class MerchantOrderTablePage implements OnInit {
  constructor(private http : HttpClient){}
  orderList: Order[] = [];
  statuses: Status[] = [];
  loading: boolean = true;

  // 詳細資料彈窗相關
  showDetailDialog = false;
  selectedOrder: Order | null = null;

  ngOnInit() {
    // 模擬資料載入
    this.orderList = [
      {
        "ORDER_ID": "O010",
        "STAY_DATE": "2025-11-10",
        "CHECK_IN": "2025-11-10",
        "CHECK_OUT": "2025-11-12",
        "USER_NAME": "林志強",
        "USER_PHONE": "0956000000",
        "PROPERTY_NAME": "愛心寶貝-新北板橋館",
        "PROPERTY_PHONE": "02-29501234",
        "ROOM": "大型犬總統套房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 7000,
        "PRICE_EVERYNIGHT": 3500,
        "STATUS": "待付款",
        "NOTE": "測試",
        "CREATED_AT": "2025-10-22",
        "UPDATED_AT": "2025-10-22"
      },
      {
        "ORDER_ID": "O010",
        "STAY_DATE": "2025-11-11",
        "CHECK_IN": "2025-11-10",
        "CHECK_OUT": "2025-11-12",
        "USER_NAME": "林志強",
        "USER_PHONE": "0956000000",
        "PROPERTY_NAME": "愛心寶貝-新北板橋館",
        "PROPERTY_PHONE": "02-29501234",
        "ROOM": "大型犬總統套房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 7000,
        "PRICE_EVERYNIGHT": 3500,
        "STATUS": "待付款",
        "NOTE": null,
        "CREATED_AT": "2025-10-22",
        "UPDATED_AT": "2025-10-22"
      },
      {
        "ORDER_ID": "O009",
        "STAY_DATE": "2025-11-03",
        "CHECK_IN": "2025-11-03",
        "CHECK_OUT": "2025-11-04",
        "USER_NAME": "陳雅婷",
        "USER_PHONE": "0945678901",
        "PROPERTY_NAME": "貓咪天堂-台中北區館",
        "PROPERTY_PHONE": "04-22501234",
        "ROOM": "貓咪經濟房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 3600,
        "PRICE_EVERYNIGHT": 3600,
        "STATUS": "已確認",
        "NOTE": "貓咪有服藥需求，請聯繫我",
        "CREATED_AT": "2025-10-21",
        "UPDATED_AT": "2025-10-21"
      },
      {
        "ORDER_ID": "O009",
        "STAY_DATE": "2025-11-02",
        "CHECK_IN": "2025-11-02",
        "CHECK_OUT": "2025-11-03",
        "USER_NAME": "陳雅婷",
        "USER_PHONE": "0945678901",
        "PROPERTY_NAME": "貓咪天堂-台中北區館",
        "PROPERTY_PHONE": "04-22501234",
        "ROOM": "貓咪經濟房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 3600,
        "PRICE_EVERYNIGHT": 3600,
        "STATUS": "已確認",
        "NOTE": "貓咪有服藥需求，請聯繫我",
        "CREATED_AT": "2025-10-21",
        "UPDATED_AT": "2025-10-21"
      },
      {
        "ORDER_ID": "O009",
        "STAY_DATE": "2025-11-01",
        "CHECK_IN": "2025-11-01",
        "CHECK_OUT": "2025-11-02",
        "USER_NAME": "陳雅婷",
        "USER_PHONE": "0945678901",
        "PROPERTY_NAME": "貓咪天堂-台中北區館",
        "PROPERTY_PHONE": "04-22501234",
        "ROOM": "貓咪經濟房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 3600,
        "PRICE_EVERYNIGHT": 3600,
        "STATUS": "已確認",
        "NOTE": "貓咪有服藥需求，請聯繫我",
        "CREATED_AT": "2025-10-21",
        "UPDATED_AT": "2025-10-21"
      },
      {
        "ORDER_ID": "O008",
        "STAY_DATE": "2025-10-28",
        "CHECK_IN": "2025-10-28",
        "CHECK_OUT": "2025-10-31",
        "USER_NAME": "陳小芳",
        "USER_PHONE": "0945000000",
        "PROPERTY_NAME": "快樂毛孩-台北大安館",
        "PROPERTY_PHONE": "02-27001235",
        "ROOM": "小型犬標準房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 13500,
        "PRICE_EVERYNIGHT": 4500,
        "STATUS": "待付款",
        "NOTE": "小型犬，請提供玩具",
        "CREATED_AT": "2025-10-20",
        "UPDATED_AT": "2025-10-20"
      },
      {
        "ORDER_ID": "O008",
        "STAY_DATE": "2025-10-30",
        "CHECK_IN": "2025-10-28",
        "CHECK_OUT": "2025-10-31",
        "USER_NAME": "陳小芳",
        "USER_PHONE": "0945000000",
        "PROPERTY_NAME": "快樂毛孩-台北大安館",
        "PROPERTY_PHONE": "02-27001235",
        "ROOM": "小型犬標準房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 13500,
        "PRICE_EVERYNIGHT": 4500,
        "STATUS": "待付款",
        "NOTE": "小型犬，請提供玩具",
        "CREATED_AT": "2025-10-20",
        "UPDATED_AT": "2025-10-20"
      },
      {
        "ORDER_ID": "O008",
        "STAY_DATE": "2025-10-29",
        "CHECK_IN": "2025-10-28",
        "CHECK_OUT": "2025-10-31",
        "USER_NAME": "陳小芳",
        "USER_PHONE": "0945000000",
        "PROPERTY_NAME": "快樂毛孩-台北大安館",
        "PROPERTY_PHONE": "02-27001235",
        "ROOM": "小型犬標準房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 13500,
        "PRICE_EVERYNIGHT": 4500,
        "STATUS": "待付款",
        "NOTE": "小型犬，請提供玩具",
        "CREATED_AT": "2025-10-20",
        "UPDATED_AT": "2025-10-20"
      },
      {
        "ORDER_ID": "O007",
        "STAY_DATE": "2025-10-21",
        "CHECK_IN": "2025-10-21",
        "CHECK_OUT": "2025-10-23",
        "USER_NAME": "李美玲",
        "USER_PHONE": "0923456789",
        "PROPERTY_NAME": "寵愛之家-高雄左營館",
        "PROPERTY_PHONE": "07-58612345",
        "ROOM": "貓咪經濟房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 3200,
        "PRICE_EVERYNIGHT": 1600,
        "STATUS": "已完成",
        "NOTE": "我的貓有病，請小心照顧",
        "CREATED_AT": "2025-10-10",
        "UPDATED_AT": "2025-10-23"
      },
      {
        "ORDER_ID": "O007",
        "STAY_DATE": "2025-10-22",
        "CHECK_IN": "2025-10-21",
        "CHECK_OUT": "2025-10-23",
        "USER_NAME": "李美玲",
        "USER_PHONE": "0923456789",
        "PROPERTY_NAME": "寵愛之家-高雄左營館",
        "PROPERTY_PHONE": "07-58612345",
        "ROOM": "貓咪經濟房",
        "QUANTITY": 1,
        "HOTEL_CHARGES": 3200,
        "PRICE_EVERYNIGHT": 1600,
        "STATUS": "已完成",
        "NOTE": null,
        "CREATED_AT": "2025-10-10",
        "UPDATED_AT": "2025-10-23"
      }
    ];

    this.statuses = [
      { label: '待付款', value: '待付款' },
      { label: '已確認', value: '已確認' },
      { label: '已完成', value: '已完成' },
      { label: '已取消', value: '已取消' }
    ];

    this.loading = false;
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

  // 開啟詳細資料彈窗
  showOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.showDetailDialog = true;
  }

  // 更新備註
  onNoteUpdated(data: { orderId: string, note: string }) {
    // 更新訂單列表中的備註
    const orderIndex = this.orderList.findIndex(o => o.ORDER_ID === data.orderId);
    if (orderIndex !== -1) {
      this.orderList[orderIndex].NOTE = data.note;
    }

    // 更新選中的訂單
    if (this.selectedOrder && this.selectedOrder.ORDER_ID === data.orderId) {
      this.selectedOrder.NOTE = data.note;
    }

    console.log('備註已更新:', data);
    // TODO: 這裡可以加入 API 呼叫來更新後端資料
  }
}
