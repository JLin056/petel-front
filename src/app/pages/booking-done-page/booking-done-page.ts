import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HotelService } from '../../core/services/hotel-service';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-booking-done-page',
    imports: [ButtonModule, Rating, FormsModule],
    templateUrl: './booking-done-page.html',
    styleUrl: './booking-done-page.css'
})
export class BookingDonePage {

    // 訂單資訊
    numberOfRooms: number = 2;
    roomType: string = '豪華雙人房';
    suitablePets: string = 'different_name_of_pet(s)';
    maxPets: number = 4;

    // 旅館相關屬性：begin

    propertyName = '';
    propertyTel = '';
    propertyAddress = '';
    propertyInfo = '';
    checkNotice = '';
    petNotice = '';
    propertyNotice = '';

    propertyScore: number = 4.8; // related to PETEL_REVIEWS

    // 旅館相關屬性：end

    roomName = 'xx';
    roomQuantity = 1
    checkIn = '2025-10-23';
    checkOut = '2025-10-24';

    constructor(private hotelService: HotelService) {};

    ngOnInit(): void {
        this.hotelService.queryHotelDetail('P000000001').subscribe({ // 暫時使用假資料
            next: (response) => {

                if (response.MWHEADER.RETURNCODE !== '0000') {
                    return;
                }

                const propertyDetail = response.TRANRS.property_details.at(0);
                this.propertyName = propertyDetail!.name;
                this.propertyTel = propertyDetail!.tel;
                this.propertyAddress = propertyDetail!.address;
                this.propertyInfo = propertyDetail!.info;
                this.checkNotice = propertyDetail!.checkNotice;
                this.petNotice = propertyDetail!.petNotice;
                this.propertyNotice = propertyDetail!.propertyNotice;
            }
        });
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
