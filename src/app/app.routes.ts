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
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { MerchantLoginPage } from './pages/merchant-login-page/merchant-login-page';
import { MerchantRegisterPage } from './pages/merchant-register-page/merchant-register-page';

export const routes: Routes = [
    {
        path: '',
        component: HomePage
    },
    {
        path: 'login',
        component: LoginPage
    },
    {
        path: 'register',
        component: RegisterPage
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
        path: 'merchants/login',
        component: MerchantLoginPage
    },
    {
        path: 'merchants/register',
        component: MerchantRegisterPage
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
        path: 'merchants/reviewList',
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
        path:'orderTable',
        component:OrderTableComponent
    }
];
