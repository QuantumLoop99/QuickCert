import { Component } from '@angular/core';
import { OfficerSidebarComponent } from '../sidebar/officer-sidebar/officer-sidebar.component';
import { OfficerTopbarComponent } from '../topbar/officer-topbar/officer-topbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [OfficerSidebarComponent, OfficerTopbarComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
}
