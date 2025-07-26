import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  activeSection = 'general';
  
  faqSections = [
    { id: 'general', title: 'General Information', icon: '❓' },
    { id: 'registration', title: 'Registration', icon: '📝' },
    { id: 'requests', title: 'Submitting Requests', icon: '📋' },
    { id: 'process', title: 'Review Process', icon: '⚙️' },
    { id: 'documents', title: 'Documents', icon: '📄' },
    { id: 'technical', title: 'Technical Support', icon: '🔧' }
  ];

  faqs = {
    general: [
      {
        question: 'What is QuickCERT?',
        answer: 'QuickCERT is an online platform that allows Sri Lankan citizens to request official income statements from government authorities. It streamlines the traditional paper-based process into a fast, secure digital system.'
      },
      {
        question: 'Who can use QuickCERT?',
        answer: 'Any Sri Lankan citizen who needs an official income statement can use QuickCERT. This includes both working individuals and retired persons who receive pensions.'
      },
      {
        question: 'Is QuickCERT free to use?',
        answer: 'While registration and using the platform is free, there may be government fees for processing income statement requests. Payment details will be provided during the request process.'
      },
      {
        question: 'How long does it take to get my income statement?',
        answer: 'Processing time varies depending on your request type. Working person requests typically take 5-7 business days, while retired person requests may take 3-5 business days as they go directly to DS officers.'
      }
    ],
    registration: [
      {
        question: 'How do I register as a citizen?',
        answer: 'Click "Register" on the homepage, select "Citizen", then fill out the registration form with your personal details, location information, and create your account credentials.'
      },
      {
        question: 'What information do I need to register?',
        answer: 'You\'ll need your full name, NIC number, date of birth, phone number, address, employment type (working/retired), email address, and location details (district, DS office, GN division).'
      },
      {
        question: 'Can officers register on the platform?',
        answer: 'Yes, GN officers and DS officers can register using their official authentication codes. They need to select "Officer" during registration and provide their authentication code.'
      },
      {
        question: 'I forgot my password. How can I reset it?',
        answer: 'Currently, password reset functionality is being developed. Please contact your local DS office for assistance with account access issues.'
      }
    ],
    requests: [
      {
        question: 'What types of income statements can I request?',
        answer: 'You can request income statements for working persons (with multiple income sources) or retired persons (pension-based income). The system handles both types with appropriate verification processes.'
      },
      {
        question: 'What income sources can I include?',
        answer: 'For working persons, you can include: jobs/employment, land/property income, vehicle income, business income, and welfare benefits. Each source requires specific details and documentation.'
      },
      {
        question: 'Do I need to pay when submitting a request?',
        answer: 'Yes, you need to make the required payment and provide the payment reference number when submitting your request. Payment details and amounts will be specified during the request process.'
      },
      {
        question: 'Can I edit my request after submission?',
        answer: 'Once submitted, requests cannot be edited. If your request is rejected, you can submit a new request with corrected information.'
      }
    ],
    process: [
      {
        question: 'How does the review process work?',
        answer: 'Working person requests go through GN officer review first, then DS officer review. Retired person requests go directly to DS officers. Each step involves verification of your information and income details.'
      },
      {
        question: 'What happens if my request is rejected?',
        answer: 'If rejected, you\'ll receive notification with the reason for rejection. You can then submit a new request addressing the issues mentioned in the rejection comments.'
      },
      {
        question: 'How will I know when my request is approved?',
        answer: 'You\'ll receive email notifications at each stage of the process. You can also track your request status in real-time through your dashboard.'
      },
      {
        question: 'Can I contact the reviewing officers?',
        answer: 'Direct contact with officers is not available through the platform. All communication happens through the system notifications and comments.'
      }
    ],
    documents: [
      {
        question: 'What format will my income statement be in?',
        answer: 'Your approved income statement will be generated as a PDF document with official formatting, verification codes, and digital signatures from the approving authorities.'
      },
      {
        question: 'How do I download my income statement?',
        answer: 'Once approved, you\'ll see a download button in your dashboard and receive an email notification. Click the download link to get your PDF document.'
      },
      {
        question: 'Is the digital income statement legally valid?',
        answer: 'Yes, income statements generated through QuickCERT are officially recognized and contain verification codes that can be validated by relevant authorities.'
      },
      {
        question: 'Can I download my document multiple times?',
        answer: 'Yes, once your request is approved, you can download the document multiple times from your dashboard.'
      }
    ],
    technical: [
      {
        question: 'What browsers are supported?',
        answer: 'QuickCERT works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is updated to the latest version.'
      },
      {
        question: 'I\'m having trouble uploading documents. What should I do?',
        answer: 'Currently, document upload is not required for basic income statement requests. If you encounter any technical issues, try refreshing the page or using a different browser.'
      },
      {
        question: 'The website is loading slowly. What can I do?',
        answer: 'Slow loading can be due to internet connectivity. Try refreshing the page, clearing your browser cache, or accessing the site during off-peak hours.'
      },
      {
        question: 'Who can I contact for technical support?',
        answer: 'For technical issues, you can contact the QuickCERT support team at info@quickcert.gov.lk or visit your local DS office for assistance.'
      }
    ]
  };

  expandedItems: Set<string> = new Set();

  setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;
  }

  toggleFaqItem(sectionId: string, index: number): void {
    const itemId = `${sectionId}-${index}`;
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isFaqItemExpanded(sectionId: string, index: number): boolean {
    return this.expandedItems.has(`${sectionId}-${index}`);
  }

  getCurrentFaqs(): any[] {
    return this.faqs[this.activeSection as keyof typeof this.faqs] || [];
  }

  getCurrentSectionTitle(): string {
    const section = this.faqSections.find(s => s.id === this.activeSection);
    return section ? section.title : 'FAQ';
  }
}