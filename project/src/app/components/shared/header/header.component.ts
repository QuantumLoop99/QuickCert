import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-section')) {
        this.showUserMenu = false;
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/home']);
  }

  getDashboardRoute(): string {
    switch (this.currentUser?.userType) {
      case 'citizen': return '/citizen/dashboard';
      case 'gn_officer': return '/gn-officer/dashboard';
      case 'ds_officer': return '/ds-officer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/home';
    }
  }

  getUserRoleDisplay(userType: string): string {
    switch (userType) {
      case 'citizen': return 'Citizen';
      case 'gn_officer': return 'GN Officer';
      case 'ds_officer': return 'DS Officer';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  }
}