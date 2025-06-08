import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PendingRequestsComponent } from './pages/pending-requests/pending-requests.component';
import { ApprovedRequestsComponent } from './pages/approved-requests/approved-requests.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
    {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'pending', component: PendingRequestsComponent },
      { path: 'approved', component: ApprovedRequestsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'pending', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfficerRoutingModule { }
