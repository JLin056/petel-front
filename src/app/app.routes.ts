import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { RoomInfoEditPage } from './pages/room-info-edit-page/room-info-edit-page';
import { MerchantHomePage } from './pages/merchant-home-page/merchant-home-page';
import { AuthorizingPage } from './pages/authorizing-page/authorizing-page';


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
        path: 'merchants/homepage',
        component: MerchantHomePage
    },
    {
        path: 'book/authorize',
        component: AuthorizingPage
    }
];
