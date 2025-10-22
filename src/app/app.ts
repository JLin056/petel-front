import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/sharedComponents/header/header';
import { Footer } from './shared/sharedComponents/footer/footer';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MerchantPropertyHeader } from './shared/sharedComponents/merchant-property-header/merchant-property-header';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, MerchantPropertyHeader, Footer, ToastModule, ConfirmDialogModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('petelFrontTest');
  isMerchantRoute = false;
  constructor(private router: Router) { }

  ngOnInit() {
    // 監聽路由變化，判斷是否為商家後台
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 如果路由包含 /merchants 或 /orderTable，就顯示商家 header
      this.isMerchantRoute = event.url.includes('/merchants') ||
        event.url.includes('/orderTable');
    });
  }
}