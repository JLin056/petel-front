import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/sharedComponents/header/header';
import { Footer } from './shared/sharedComponents/footer/footer';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MerchantPropertyHeader } from './shared/sharedComponents/merchant-property-header/merchant-property-header';
import { filter } from 'rxjs';
import { MerchantUserpageHeader } from "./shared/sharedComponents/merchant-userpage-header/merchant-userpage-header";
import { MerchantUserpageFooter } from "./shared/sharedComponents/merchant-userpage-footer/merchant-userpage-footer";
import { AdminHeader } from './pages/admin-header/admin-header';
import { AdminFooter } from './pages/admin-footer/admin-footer';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, MerchantPropertyHeader, Footer, ToastModule, ConfirmDialogModule, ReactiveFormsModule, MerchantUserpageHeader, MerchantUserpageFooter, AdminHeader, AdminFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('petelFrontTest');
  isMerchantRoute = false;
  isMerchantUserpageRoute = false;
  isMerchantUserpageFooterRoute = false;
  isAdminRoute = false;
  constructor(private router: Router) { }

  ngOnInit() {
    // 監聽路由變化，判斷是否為商家後台或管理員後台
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.url.includes('/admin/');
      this.isMerchantRoute = event.url.includes('/merchants/property') ||
        event.url.includes('/orderTable');
      this.isMerchantUserpageRoute = event.url.includes('/merchants/userPage');
      this.isMerchantUserpageFooterRoute = event.url.includes('/merchants/userPage');
    });
  }
}