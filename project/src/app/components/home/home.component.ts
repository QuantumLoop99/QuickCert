import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  features = [
    {
      title: 'Lightning Fast Processing',
      description: 'Get your income statements processed in minutes, not days. Our streamlined digital workflow ensures rapid turnaround times.',
      icon: 'fas fa-bolt',
      iconClass: 'feature-icon-primary'
    },
    {
      title: 'Bank-Level Security',
      description: 'Your sensitive data is protected with military-grade encryption and multi-layer security protocols.',
      icon: 'fas fa-shield-alt',
      iconClass: 'feature-icon-success'
    },
    {
      title: '24/7 Availability',
      description: 'Submit requests and track status anytime, anywhere. Our platform never sleeps, so you don\'t have to wait.',
      icon: 'fas fa-clock',
      iconClass: 'feature-icon-warning'
    },
    {
      title: 'Instant Digital Delivery',
      description: 'Download your verified income statements instantly with QR codes for easy verification by third parties.',
      icon: 'fas fa-download',
      iconClass: 'feature-icon-info'
    },
    {
      title: 'Multi-Language Support',
      description: 'Available in Sinhala, Tamil, and English to serve all citizens of Sri Lanka effectively.',
      icon: 'fas fa-globe',
      iconClass: 'feature-icon-secondary'
    },
    {
      title: 'Mobile Optimized',
      description: 'Fully responsive design works perfectly on all devices - desktop, tablet, and mobile phones.',
      icon: 'fas fa-mobile-alt',
      iconClass: 'feature-icon-primary'
    }
  ];

  steps = [
    {
      title: 'Create Account',
      description: 'Register with your NIC and basic information. Verification is instant for most users.',
      icon: 'fas fa-user-plus'
    },
    {
      title: 'Submit Request',
      description: 'Fill out the digital form with your income details and upload required documents.',
      icon: 'fas fa-file-upload'
    },
    {
      title: 'Official Review',
      description: 'Government officers review and verify your information through our secure system.',
      icon: 'fas fa-search'
    },
    {
      title: 'Download Certificate',
      description: 'Receive your official, digitally signed income statement ready for immediate use.',
      icon: 'fas fa-certificate'
    }
  ];
}