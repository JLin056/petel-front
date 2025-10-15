import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Listbox } from 'primeng/listbox';
import { DecimalPipe } from '@angular/common';
import { Rating } from 'primeng/rating';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
    selector: 'app-hotel-list-page',
    imports: [
        FormsModule,
        Select,
        ButtonModule,
        DatePicker,
        FloatLabel,
        IftaLabelModule,
        InputNumber,
        InputGroup,
        InputGroupAddonModule,
        Listbox,
        DecimalPipe,
        Rating,
        PaginatorModule
    ],
    templateUrl: './hotel-list-page.html',
    styleUrl: './hotel-list-page.css'
})
export class HotelListPage {
    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;
    value: number = 4;
    priceRanges: priceRange[] = [];
    hotFilters: Option[] = [];
    sortSelect: Option[] = [];
    first: number = 0;
    rows: number = 10;

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }

    ngOnInit() {
        this.cities = [
            { id: 'TPE', name: '臺北市' },
            { id: 'KEE', name: '基隆市' },
            { id: 'NWT', name: '新北市' },
            { id: 'ILA', name: '宜蘭縣' },
            { id: 'HSZ', name: '新竹市' },
            { id: 'HSQ', name: '新竹縣' },
            { id: 'TAO', name: '桃園市' },
            { id: 'MIA', name: '苗栗縣' },
            { id: 'TXG', name: '臺中市' },
            { id: 'CHA', name: '彰化縣' },
            { id: 'NAN', name: '南投縣' },
            { id: 'CYI', name: '嘉義市' },
            { id: 'CYQ', name: '嘉義縣' },
            { id: 'YUN', name: '雲林縣' },
            { id: 'TNN', name: '臺南市' },
            { id: 'KHH', name: '高雄市' },
            { id: 'PIF', name: '屏東縣' },
            { id: 'TTT', name: '臺東縣' },
            { id: 'HUA', name: '花蓮縣' }
        ];


        this.types = [
            { id: 'W001', name: '貓貓' },
            { id: 'W002', name: '狗狗' }
        ];

        this.priceRanges = [
            { min: 800,  max: 1000 },
            { min: 1000, max: 1500 },
            { min: 1500, max: 1800 },
            { min: 1800, max: 2200 },
            { min: 2200, max: 5000 }
        ]

        this.hotFilters = [
            { id: 'free-cancel', name: '免費取消' },
            { id: 'suite',       name: '獨立套房' },
            { id: 'sea',         name: '海景房' },
            { id: 'multi',       name: '多寵物共享' },
            { id: 'outdoor',     name: '戶外空間' },
            { id: 'no-deposit',  name: '免訂金' }
        ];

        this.sortSelect = [
            {id: 1, name: '依價位（由高到低）'},
            {id: 2, name: '依價位（由低到高）'},
            {id: 3, name: '依評價'}
        ]
    }
}
