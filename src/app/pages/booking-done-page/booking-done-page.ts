import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-booking-done-page',
  imports: [ButtonModule],
  templateUrl: './booking-done-page.html',
  styleUrl: './booking-done-page.css'
})
export class BookingDonePage {
  // 住宿資訊
  petelName: string = 'petel_name';
  petelAddress: string = 'petel_address';
  petelOpeningHours: string = 'hh:mm ~ hh:mm';
  petelRating: number = 4.5; // 新增：旅館評分
  petelStars: number = 5; // 新增：星級數

  // 訂單資訊
  numberOfRooms: number = 2;
  roomType: string = '豪華雙人房';
  suitablePets: string = 'different_name_of_pet(s)';
  maxPets: number = 4;

  // 生成星星陣列（用於顯示星級）
  get starArray(): number[] {
    return Array(this.petelStars).fill(0);
  }

  onChat(): void {
    console.log('開始聊天');
  }

  onViewHistory(): void {
    console.log('查看歷史訂單');
  }

  onEditOrder(): void {
    console.log('修改訂單');
  }

  onCancelOrder(): void {
    console.log('取消訂單');
  }
}
