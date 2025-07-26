import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  
  objectives = [
    {
      icon: '👥',
      title: 'Empower Citizens',
      description: 'Provide individuals with a digital platform to submit certification requests, track progress, and receive approvals without unnecessary delays.'
    },
    {
      icon: '⚡',
      title: 'Enhance Government Efficiency',
      description: 'Help Divisional Secretariat officers manage requests more efficiently by reducing paperwork and minimizing processing time.'
    },
    {
      icon: '🔄',
      title: 'Digital Transformation',
      description: 'Modernize traditional administrative procedures by integrating secure online applications and automated approvals.'
    },
    {
      icon: '🔒',
      title: 'Ensure Trust and Security',
      description: 'Implement secure authentication, encrypted storage, and safe payment processing to protect user information.'
    },
    {
      icon: '💳',
      title: 'Seamless Payments',
      description: 'Enable citizens to conveniently pay for certification services through secure payment gateway integration.'
    },
    {
      icon: '📋',
      title: 'Promote Transparency',
      description: 'Provide real-time updates, application tracking, and digital verification to foster accountability and trust.'
    }
  ];

  features = [
    {
      icon: '📝',
      title: 'Online Application',
      description: 'Submit income statement requests online with intuitive forms and validation.'
    },
    {
      icon: '👤',
      title: 'User Registration',
      description: 'Secure account creation with NIC-based authentication and email verification.'
    },
    {
      icon: '📊',
      title: 'Real-time Tracking',
      description: 'Track your application status from submission to approval in real-time.'
    },
    {
      icon: '👮',
      title: 'Officer Portal',
      description: 'Dedicated portal for GN and DS officers to review and approve requests.'
    },
    {
      icon: '📄',
      title: 'Digital Documents',
      description: 'Generate PDF documents with digital signatures and QR codes for verification.'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Email and SMS notifications to keep users informed throughout the process.'
    },
    {
      icon: '💰',
      title: 'Secure Payments',
      description: 'Integrated payment processing for government fees and service charges.'
    },
    {
      icon: '🧮',
      title: 'Income Calculator',
      description: 'Calculate estimated income before submitting your application.'
    }
  ];

  processSteps = [
    {
      icon: '📋',
      title: 'Register & Login',
      description: 'Create your account using your NIC and verify your email address.'
    },
    {
      icon: '📝',
      title: 'Submit Application',
      description: 'Fill out the income statement request form with required details.'
    },
    {
      icon: '👮',
      title: 'Officer Review',
      description: 'GN and DS officers verify your information and income details.'
    },
    {
      icon: '✅',
      title: 'Approval',
      description: 'Receive approval notification and download your digital certificate.'
    }
  ];

  futureEnhancements = [
    {
      icon: '🔍',
      title: 'Advanced Search Engine',
      description: 'Powerful search with filtering options and recommendation algorithms for better user experience.'
    },
    {
      icon: '📱',
      title: 'Mobile Application',
      description: 'Dedicated mobile app with push notifications, biometric login, and real-time tracking.'
    },
    {
      icon: '🔒',
      title: 'Enhanced Security',
      description: 'Multi-factor authentication, encrypted document storage, and advanced fraud detection.'
    },
    {
      icon: '✅',
      title: 'Identity Verification',
      description: 'Automated verification system integrated with government databases to prevent fraud.'
    },
    {
      icon: '🌐',
      title: 'Multi-language Support',
      description: 'Support for Sinhala, Tamil, and English to make the system accessible to all citizens.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      description: 'Advanced analytics tools to monitor system performance and user activity patterns.'
    },
    {
      icon: '🏛️',
      title: 'Service Expansion',
      description: 'Extend platform to support other government certificates like birth, marriage, and land deeds.'
    },
    {
      icon: '⭐',
      title: 'Feedback System',
      description: 'User rating and review system to build trust and gather insights for improvements.'
    }
  ];
}