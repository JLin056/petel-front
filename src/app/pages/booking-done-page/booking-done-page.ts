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

    // 訂單資訊
    numberOfRooms: number = 2;
    roomType: string = '豪華雙人房';
    suitablePets: string = 'different_name_of_pet(s)';
    maxPets: number = 4;

    onChat(): void {
    }

    onViewHistory(): void {
    }

    onEditOrder(): void {
    }

    onCancelOrder(): void {
    }
}
