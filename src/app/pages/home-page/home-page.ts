import { FormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { Carousel, CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, Select, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, InputNumber, CarouselModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;
    dogHotels: Hotel[] = [];
    catHotels: Hotel[] = [];

    responsiveOptions = [
        { breakpoint: '1400px', numVisible: 3, numScroll: 1 },
        { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
        { breakpoint: '767px',  numVisible: 2, numScroll: 1 },
        { breakpoint: '575px',  numVisible: 1, numScroll: 1 }
    ];

    onWheel(e: WheelEvent, c: Carousel) {
        e.preventDefault();
        if (e.deltaY > 0) c.navForward(e as any);
        else c.navBackward(e as any);
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

        this.dogHotels = [
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' },
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' },
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' }
        ];

        this.catHotels = [
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' }
        ];
    }

}
