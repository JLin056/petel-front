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
    cities: City[] | undefined;
    date: Date | undefined;
    types: petType[] | undefined;
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
            { name: '臺北市', code: 'TPE' },
            { name: '基隆市', code: 'KEE' },
            { name: '新北市', code: 'NWT' },
            { name: '宜蘭縣', code: 'ILA' },
            { name: '新竹市', code: 'HSZ' },
            { name: '新竹縣', code: 'HSQ' },
            { name: '桃園市', code: 'TAO' },
            { name: '苗栗縣', code: 'MIA' },
            { name: '臺中市', code: 'TXG' },
            { name: '彰化縣', code: 'CHA' },
            { name: '南投縣', code: 'NAN' },
            { name: '嘉義市', code: 'CYI' },
            { name: '嘉義縣', code: 'CYQ' },
            { name: '雲林縣', code: 'YUN' },
            { name: '臺南市', code: 'TNN' },
            { name: '高雄市', code: 'KHH' },
            { name: '屏東縣', code: 'PIF' },
            { name: '臺東縣', code: 'TTT' },
            { name: '花蓮縣', code: 'HUA' }
        ];

        this.types = [
            { typeId: 'W001', typeName: '貓貓' },
            { typeId: 'W002', typeName: '狗狗' }
        ];

        this.dogHotels = [
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
