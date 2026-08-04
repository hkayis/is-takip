import { Routes } from '@angular/router';
import {Login} from './pages/login/login'
import { Jobs } from './pages/jobs/jobs';
import { authGuard } from './guard/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {path: 'dashboard', component: Dashboard, canActivate: [authGuard]},
  { path: 'jobs', component: Jobs, canActivate: [authGuard] },
];
