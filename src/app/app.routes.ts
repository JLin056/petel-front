import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { RoomInfoEditPage } from './pages/room-info-edit-page/room-info-edit-page';
import { RoomInfoInsertPage } from './pages/room-info-insert-page/room-info-insert-page';
import { MerchantHomePage } from './pages/merchant-home-page/merchant-home-page';
import { UserPage } from './pages/user-page/user-page';
import { BookingDonePage } from './pages/booking-done-page/booking-done-page';
import { MerchantReviewListPage } from './pages/merchant-review-list-page/merchant-review-list-page';

import { AuthorizingPage } from './pages/authorizing-page/authorizing-page';
import { ChatPage } from './pages/chat-page/chat-page';

import { BookingPage } from './pages/booking-page/booking-page';
import { OrderTableComponent } from './pages/order-table-component/order-table-component';
import { AdminUserTable } from './pages/admin-user-table/admin-user-table';
import { AdminSellerTable } from './pages/admin-seller-table/admin-seller-table';

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
        path: 'history',
        component: UserPage
    },
    {
        path: 'merchants/property/roomInfo/edit',
        component: RoomInfoEditPage
    },
    {
        path: 'merchants/property/roomInfo/insert',
        component: RoomInfoInsertPage
    },
    {
        path: 'merchants/property/homepage',
        component: MerchantHomePage
    },
    {
        path: 'book/finish',
        component: BookingDonePage
    },
    {
        path: 'book',
        component: BookingPage
    },
    {
        path: 'merchants/property/reviewList',
        component: MerchantReviewListPage
    },
    {
        path: 'book/authorize',
        component: AuthorizingPage
    },
    {
        path: 'chat',
        component: ChatPage
    },
    {
        path:'admin/orderTable',
        component:OrderTableComponent
    },
      {
        path:'admin/userTable',
        component:AdminUserTable
    },
      {
        path:'admin/sellerTable',
        component:AdminSellerTable
    }
];
