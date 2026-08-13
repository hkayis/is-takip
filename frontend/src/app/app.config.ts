import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { authInterceptor } from './interceptors/auth-interceptor';
import { hataInterceptor } from './interceptors/hata-interceptor';
import { routes } from './app.routes';

registerLocaleData(localeTr)

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, hataInterceptor])),
    {provide: LOCALE_ID, useValue: 'tr-TR' },
  ]
};
