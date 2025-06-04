import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ApplicationFormComponent } from './application-form/application-form.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'application', component: ApplicationFormComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'error', component: ErrorComponent},
  { path: '', redirectTo: '/error', pathMatch: 'full' } 
];