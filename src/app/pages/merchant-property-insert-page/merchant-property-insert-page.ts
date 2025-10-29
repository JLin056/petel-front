import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-merchant-property-insert-page',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './merchant-property-insert-page.html',
  styleUrl: './merchant-property-insert-page.css'
})
export class MerchantPropertyInsertPage {
  hotel = {
    name: '汪星樂園寵物旅館',
    tel: '02-2233-5566',
    address: '台北市信義區松山路88號',
    info: '提供舒適安全的寵物住宿環境，專為毛孩設計的貼心旅館。每日清潔消毒，並有專業照護人員陪伴。',
    checkNotice: '入住時間：15:00 後｜退房時間：11:00 前。請提前通知入住與退房時間以便安排。',
    petNotice: '入住寵物需攜帶疫苗證明及日常用品，禁止攜帶攻擊性動物。寵物需能獨立排泄。',
    propertyNotice: '旅館內全面禁菸，請勿攜帶外食與危險物品。若有特殊需求可提前告知。',
    propertyImages: [
      { base64Data: 'https://picsum.photos/600/300?random=10' },
      { base64Data: 'https://picsum.photos/600/300?random=11' },
      { base64Data: 'https://picsum.photos/600/300?random=12' }
    ],
    facilities: [
      { facilityName: '寵物游泳池' },
      { facilityName: '專屬遊戲區' },
      { facilityName: '24小時監視系統' },
      { facilityName: '寵物美容服務' },
      { facilityName: '免費停車場' }
    ]
  };

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.hotel.propertyImages.push({ base64Data: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  addFacility() {
    this.hotel.facilities.push({ facilityName: '' });
  }

  removeFacility(index: number) {
    this.hotel.facilities.splice(index, 1);
  }

  saveHotel() {
    console.log('✅ 儲存資料：', this.hotel);
    alert('旅館資訊已儲存（目前為前端假儲存）');
  }

  resetForm() {
    this.hotel = {
      name: '',
      tel: '',
      address: '',
      info: '',
      checkNotice: '',
      petNotice: '',
      propertyNotice: '',
      propertyImages: [],
      facilities: []
    };
  }
}
