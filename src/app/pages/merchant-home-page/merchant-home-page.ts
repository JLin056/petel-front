import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-home-page',
  imports: [],
  templateUrl: './merchant-home-page.html',
  styleUrl: './merchant-home-page.css'
})
export class MerchantHomePage {
  stats = [
    { label: '當月銷售總額', value: '$55000', change: '+15% from last month' },
    { label: '總訂單數', value: '45', change: '+10% from last month' },
    { label: '新增房客人數', value: '5', change: '+3% from last month' },
    { label: '房型數', value: '12', change: '+5% from last month' }
  ];
  rooms = [
    {
      name: '陽光豪華房',
      size: '高125cm X 寛112cm X 長114cm',
      info: '適合老貓或術後需休養的貓咪‘',
      facilities: '1台智能可旋轉24監控',
      totalUnits: 11,
      image: 'assets/rooms/room1.jpg'
    },
    {
      name: '時尚森林房',
      size: '高250cm X 寛112~136cm X 長114cm',
      info: '提供各式窗型因應不同貓咪習性',
      facilities: '1台智能可旋轉24監控',
      totalUnits: 5,
      image: 'assets/rooms/room2.jpg'
    },
    {
      name: '無邊海景房',
      size: '高300cm X 寛212cm X 長114cm',
      info: '面向101，適合喜愛景觀房的主子',
      facilities: '2台智能可旋轉24監控',
      totalUnits: 8,
      image: 'assets/rooms/room3.jpg'
    }
  ];
}

