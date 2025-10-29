import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HotelListPage } from './pages/hotel-list-page/hotel-list-page';
import { HotelSinglePage } from './pages/hotel-single-page/hotel-single-page';
import { UserPage } from './pages/user-page/user-page';
import { ChatPage } from './pages/chat-page/chat-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { ResetPasswordPage } from './pages/reset-password-page/reset-password-page';
import { MerchantLoginPage } from './pages/merchant-login-page/merchant-login-page';
import { MerchantRegisterPage } from './pages/merchant-register-page/merchant-register-page';
import { MerchantHomePage } from './pages/merchant-home-page/merchant-home-page';
import { UserMerchantPage } from './pages/user-merchant-page/user-merchant-page';
import { MerchantOrderTablePage } from './pages/merchant-order-table-page/merchant-order-table-page';
import { MerchantReviewListPage } from './pages/merchant-review-list-page/merchant-review-list-page';
import { RoomInfoPage } from './pages/room-info-page/room-info-page';
import { RoomInfoEditPage } from './pages/room-info-edit-page/room-info-edit-page';
import { RoomInfoInsertPage } from './pages/room-info-insert-page/room-info-insert-page';
import { BookingPage } from './pages/booking-page/booking-page';
import { BookingDonePage } from './pages/booking-done-page/booking-done-page';
import { AuthorizingPage } from './pages/authorizing-page/authorizing-page';
import { OrderTableComponent } from './pages/order-table-component/order-table-component';
import { AdminUserTable } from './pages/admin-user-table/admin-user-table';
import { AdminSellerTable } from './pages/admin-seller-table/admin-seller-table';
import { AdminHotelTable } from './pages/admin-hotel-table/admin-hotel-table';
import { UploadImg } from './shared/sharedComponents/upload-img/upload-img';
import { UploadPropertyImage } from './pages/sellers-property-page/upload-property-image/upload-property-image';
import { MerchantPropertyInfoPage } from './pages/merchant-property-info-page/merchant-property-info-page';
import { MerchantPropertyInsertPage } from './pages/merchant-property-insert-page/merchant-property-insert-page';
import { MerchantPropertyEditPage } from './pages/merchant-property-edit-page/merchant-property-edit-page';
import { MerchantChatPage } from './pages/merchant-chat-page/merchant-chat-page';

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
        path: 'history',
        component: UserPage
    },
    {
        path: 'chat',
        component: ChatPage
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
        path: 'forgotPassword',
        component: ForgotPasswordPage
    },
    {
        path: 'resetPassword',
        component: ResetPasswordPage
    },
    {
        path: 'book',
        component: BookingPage
    },
    {
        path: 'book/finish',
        component: BookingDonePage
    },
    {
        path: 'book/authorize',
        component: AuthorizingPage
    },
    {
        path: 'imageTest',
        component: UploadImg
    },
    {
        path: 'uploadImageTest',
        component: UploadPropertyImage
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
        path: 'merchants/userPage/chat',
        component: MerchantChatPage
    },
    {
        path: 'merchants/property/homepage',
        component: MerchantHomePage
    },
    {
        path: 'merchants/property/info',
        component: MerchantPropertyInfoPage
    },
        {
        path: 'merchants/property/insert',
        component: MerchantPropertyInsertPage
    },
        {
        path: 'merchants/property/edit',
        component: MerchantPropertyEditPage
    },
    {
        path: 'merchants/property/roomInfo',
        component: RoomInfoPage
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
        path: 'merchants/userPage',
        component: UserMerchantPage
    },
    {
        path: 'merchants/property/bookings',
        component: MerchantOrderTablePage
    },
    {
        path: 'merchants/property/reviewList',
        component: MerchantReviewListPage
    },
    {
        path: 'admin/orderTable',
        component: OrderTableComponent
    },
    {
        path: 'admin/userTable',
        component: AdminUserTable
    },
    {
        path: 'admin/sellerTable',
        component: AdminSellerTable
    },
    {
        path: 'admin/hotelTable',
        component: AdminHotelTable
    }
];
