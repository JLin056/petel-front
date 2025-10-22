import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { RoomInfoEditPage } from './pages/room-info-edit-page/room-info-edit-page';
import { RoomInfoInsertPage } from './pages/room-info-insert-page/room-info-insert-page';
import { MerchantHomePage } from './pages/merchant-home-page/merchant-home-page';
import { UserPage } from './pages/user-page/user-page';
import { HotelSinglePage } from './pages/hotel-single-page/hotel-single-page';
import { UploadPropertyImage } from './pages/sellers-property-page/upload-property-image/upload-property-image';


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
        path: 'singleHotel',
        component: HotelSinglePage
    },
    {
        path: 'uploadImageTest',
        component: UploadPropertyImage
    },
    {
        path: 'imageTest',
        component: UploadImg
    },
    {
        path: 'history',
        component: UserPage
    },
    {
        path: 'merchants/roomInfo/edit',
        component: RoomInfoEditPage
    },
    {
        path: 'merchants/roomInfo/insert',
        component: RoomInfoInsertPage
    },
    {
        path: 'merchants/homepage',
        component: MerchantHomePage
    }
];
