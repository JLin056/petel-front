import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { OrderTableComponent } from './pages/order-table-component/order-table-component';

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
        path:'orderTable',
        component:OrderTableComponent
    }
];
