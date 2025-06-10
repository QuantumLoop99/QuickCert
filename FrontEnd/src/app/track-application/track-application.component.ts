import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Application {
  referenceNumber: string;
  type: string;
  submittedDate: Date;
  expectedCompletion: Date;
  status: 'In Transit' | 'Completed' | 'Processing' | 'Rejected' | 'Under Review';
  processingOfficer: string;
  currentStatusText: string;
  priorityLevel: string;
  purpose: string;
  currentStep: number;
  progressPercentage: number;
  applicantName: string;
  contactNumber: string;
  email: string;
  lastUpdated: Date;
}

interface ProgressStep {
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-track-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track-application.component.html',
  styleUrls: ['./track-application.component.css']
})
export class TrackApplicationComponent implements OnInit {
  referenceNumber: string = '';
  showStatusCard: boolean = false;
  currentApplication: Application | null = null;
  searchError: string = '';

  progressSteps: ProgressStep[] = [
    { 
      icon: '📝', 
      label: 'Application Submitted',
      description: 'Your application has been received and assigned a reference number'
    },
    { 
      icon: '🔍', 
      label: 'Document Verification',
      description: 'Our team is reviewing and verifying the submitted documents'
    },
    { 
      icon: '⚙️', 
      label: 'Processing',
      description: 'Your application is being processed by our certification team'
    },
    { 
      icon: '✅', 
      label: 'Quality Check',
      description: 'Final quality assurance and approval process'
    },
    { 
      icon: '📄', 
      label: 'Certificate Ready',
      description: 'Your income statement certificate is ready for collection/download'
    }
  ];

  // Sample applications data
  applications: Application[] = [
    {
      referenceNumber: 'INC-1748783023499-1797',
      type: 'Income Statement Certificate',
      submittedDate: new Date('2025-05-28'),
      expectedCompletion: new Date('2025-06-05'),
      status: 'Processing',
      processingOfficer: 'Mrs. K.A. Silva',
      currentStatusText: 'Your application is currently being processed by our certification team',
      priorityLevel: 'Standard',
      purpose: 'Bank Loan Application',
      currentStep: 2,
      progressPercentage: 60,
      applicantName: 'Kamal Attanayake',
      contactNumber: '+94 77 123 4567',
      email: 'kamal123@email.com',
      lastUpdated: new Date('2025-05-30')
    },
    {
      referenceNumber: 'INC-1748783023499-1798',
      type: 'Income Statement Certificate',
      submittedDate: new Date('2025-05-25'),
      expectedCompletion: new Date('2025-06-02'),
      status: 'Completed',
      processingOfficer: 'Mr. R.P. Fernando',
      currentStatusText: 'Your certificate has been completed and is ready for download',
      priorityLevel: 'Express',
      purpose: 'Visa Application',
      currentStep: 4,
      progressPercentage: 100,
      applicantName: 'Dasun Bandara',
      contactNumber: '+94 71 987 6543',
      email: 'dasunbandara@email.com',
      lastUpdated: new Date('2025-06-01')
    },
    {
      referenceNumber: 'INC-1748783023499-1799',
      type: 'Income Statement Certificate',
      submittedDate: new Date('2025-05-30'),
      expectedCompletion: new Date('2025-06-07'),
      status: 'Under Review',
      processingOfficer: 'Ms. N.S. Perera',
      currentStatusText: 'Initial document review is in progress',
      priorityLevel: 'Standard',
      purpose: 'Government Application',
      currentStep: 1,
      progressPercentage: 25,
      applicantName: 'Sunil Perera',
      contactNumber: '+94 75 456 7890',
      email: 'sunil@email.com',
      lastUpdated: new Date('2025-05-31')
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Component initialization
  }

  trackApplication(): void {
    this.searchError = '';
    
    if (!this.referenceNumber.trim()) {
      this.searchError = 'Please enter a reference number to track your application.';
      this.showStatusCard = false;
      return;
    }

    // Find the application by reference number
    const application = this.applications.find(
      app => app.referenceNumber.toLowerCase() === this.referenceNumber.toLowerCase().trim()
    );

    if (application) {
      this.currentApplication = application;
      this.showStatusCard = true;
      this.searchError = '';
      
      // Scroll to status card
      setTimeout(() => {
        const statusCard = document.querySelector('.status-section');
        if (statusCard) {
          statusCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      this.searchError = 'No application found with this reference number. Please check and try again.';
      this.showStatusCard = false;
      this.currentApplication = null;
    }
  }

  clearSearch(): void {
    this.referenceNumber = '';
    this.showStatusCard = false;
    this.currentApplication = null;
    this.searchError = '';
  }

  downloadCertificate(): void {
    if (this.currentApplication && this.currentApplication.status === 'Completed') {
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // In real implementation, this would be the actual file URL
      link.download = `${this.currentApplication.referenceNumber}_Income_Statement.pdf`;
      
      // Show download message
      alert(`Downloading certificate for ${this.currentApplication.referenceNumber}`);
      console.log('Certificate download initiated');
    }
  }

  printCertificate(): void {
    if (this.currentApplication && this.currentApplication.status === 'Completed') {
      // In real implementation, this would open a print-friendly version
      alert('Opening print preview...');
      console.log('Print certificate initiated');
    }
  }

  contactSupport(): void {
    if (this.currentApplication) {
      const subject = `Support Request - ${this.currentApplication.referenceNumber}`;
      const body = encodeURIComponent(`Dear Support Team,

I need assistance regarding my application:
Reference Number: ${this.currentApplication.referenceNumber}
Current Status: ${this.currentApplication.status}
Processing Officer: ${this.currentApplication.processingOfficer}

Please provide additional information about my application status.

Thank you.`);
      
      // Open email client
      window.location.href = `mailto:support@divisec.gov.lk?subject=${subject}&body=${body}`;
    }
  }

  requestUpdate(): void {
    if (this.currentApplication) {
      alert('SMS/Email update request has been sent. You will receive notifications about any status changes.');
      console.log('Update request sent for:', this.currentApplication.referenceNumber);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'Processing': return '#007bff';
      case 'Under Review': return '#ffc107';
      case 'In Transit': return '#17a2b8';
      case 'Rejected': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed': return '✅';
      case 'Processing': return '⚙️';
      case 'Under Review': return '🔍';
      case 'In Transit': return '🚚';
      case 'Rejected': return '❌';
      default: return '📋';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}