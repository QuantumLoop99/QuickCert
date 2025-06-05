import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent} from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ApplicationFormComponent } from './application-form/application-form.component';
import { FeedbackComponent } from './feedback/feedback.component';

export const routes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent},
    { path: 'home', component: HomeComponent },
    { path: 'application', component: ApplicationFormComponent },
    { path: 'feedback', component: FeedbackComponent },
    { path: '', redirectTo: 'admin', pathMatch: 'full' },
    {path: 'admin',
     loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
    }

];
