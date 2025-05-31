import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ApplicationFormComponent } from './application-form/application-form.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'application', component: ApplicationFormComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' } 
];