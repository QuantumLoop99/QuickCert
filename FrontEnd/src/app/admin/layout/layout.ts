import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Topbar, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {}
