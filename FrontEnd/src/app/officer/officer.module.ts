import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerRoutingModule } from './officer-routing.module';
import { OfficerSidebarComponent } from './sidebar/officer-sidebar/officer-sidebar.component';
import { OfficerTopbarComponent } from './topbar/officer-topbar/officer-topbar.component';
import { PendingRequestsComponent } from './pages/pending-requests/pending-requests.component';
import { LayoutComponent } from './layout/layout.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OfficerRoutingModule,
    LayoutComponent,
    OfficerSidebarComponent,
    OfficerTopbarComponent,
    PendingRequestsComponent
  ]
})
export class OfficerModule {}
