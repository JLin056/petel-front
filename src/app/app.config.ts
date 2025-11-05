import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { Auth } from './core/services/auth.service';
import PetelTheme from './petel-theme';

function bootstrapAuth() {
    const auth = inject(Auth);
    return () => auth.bootstrap();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastModule, ConfirmDialogModule),
    providePrimeNG({
      theme: {
        preset: PetelTheme
      },
      ripple: true // 需要水波特效就開
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: APP_INITIALIZER, useFactory: bootstrapAuth, multi: true},
    MessageService,
    ConfirmationService
  ]
};

