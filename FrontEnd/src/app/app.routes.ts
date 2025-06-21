import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent} from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ApplicationFormComponent } from './application-form/application-form.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { ErrorComponent } from './error/error.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TrackApplicationComponent } from './track-application/track-application.component';

  
export const routes: Routes = [

  { path: 'home', component: HomeComponent },
  { path: 'application', component: ApplicationFormComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: 'error', component: ErrorComponent},
  { path: 'privacy-policy', component: PrivacyPolicyComponent},
  { path: 'track', component: TrackApplicationComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];