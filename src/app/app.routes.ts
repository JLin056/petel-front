import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { RoomInfoEditPage } from './pages/room-info-edit-page/room-info-edit-page';
import { RoomInfoInsertPage } from './pages/room-info-insert-page/room-info-insert-page';
import { MerchantHomePage } from './pages/merchant-home-page/merchant-home-page';


export const routes: Routes = [
    {
        path: '',
        component: HomePage
    },
    {
        path: 'dogHotels',
        component: HotelListPage
    },
    {
        path: 'imageTest',
        component: UploadImg
    },
    {
        path: 'merchants/roomInfo/edit',
        component: RoomInfoEditPage
    },
    {
        path: 'merchants/roomInfo/insert',
        component: RoomInfoInsertPage
        path: 'merchants/homepage',
        component: MerchantHomePage
    }
];
