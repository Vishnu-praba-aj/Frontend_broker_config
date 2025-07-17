import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]), // your existing routing config
    provideHttpClient(withInterceptorsFromDi()) // ✅ enable HttpClient in Angular 17+
  ]
};
