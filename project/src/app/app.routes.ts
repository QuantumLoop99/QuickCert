import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(c => c.RegisterComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'citizen',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'citizen' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/citizen/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'new-request',
        loadComponent: () => import('./components/citizen/new-request/new-request.component').then(c => c.NewRequestComponent)
      },
      {
        path: 'track-status/:id',
        loadComponent: () => import('./components/citizen/track-status/track-status.component').then(c => c.TrackStatusComponent)
      },
      {
        path: 'document-viewer/:id',
        loadComponent: () => import('./components/citizen/document-viewer/document-viewer.component').then(c => c.DocumentViewerComponent)
      }
    ]
  },
  {
    path: 'gn-officer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'gn_officer' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/officer/gn-dashboard/gn-dashboard.component').then(c => c.GnDashboardComponent)
      }
    ]
  },
  {
    path: 'ds-officer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ds_officer' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/officer/ds-dashboard/ds-dashboard.component').then(c => c.DsDashboardComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(c => c.AdminDashboardComponent)
      }
    ]
  },
  {
    path: 'services',
    children: [
      {
        path: 'calculator',
        loadComponent: () => import('./components/services/income-calculator/income-calculator.component').then(c => c.IncomeCalculatorComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./components/services/faq/faq.component').then(c => c.FaqComponent)
      },
      {
        path: 'verify',
        loadComponent: () => import('./components/services/certificate-verification/certificate-verification.component').then(c => c.CertificateVerificationComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./components/services/about/about.component').then(c => c.AboutComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./components/services/contact/contact.component').then(c => c.ContactComponent)
      },

    ]
  },
  { path: '**', redirectTo: '/home' }
];