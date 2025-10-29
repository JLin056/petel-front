import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import PetelTheme from './petel-theme';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { Auth } from './core/services/auth.service';

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

