import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'price'
})
export class PricePipe implements PipeTransform {

    transform(value: number | string): string {

        if (value === null || value === undefined || value === '') {
            return '$0';
        }

        // 轉成數字
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

        // 檢查是否為有效數字
        if (isNaN(numValue)) {
            return '$0';
        }

        // 使用正則表達式加入千分位逗號
        const formattedNumber = numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // 回傳加上$符號
        return `$${formattedNumber}`;
    }

}
