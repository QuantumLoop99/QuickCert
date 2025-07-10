import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-gn-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './gn-dashboard.component.html',
  styleUrl: './gn-dashboard.component.css'
})
export class GnDashboardComponent implements OnInit {
  pendingRequests: any[] = [];
  selectedRequest: any = null;
  reviewForm: FormGroup;
  isLoading = true;
  isReviewing = false;
  showReviewModal = false;
  parsedIncomeSources: any[] = [];

  constructor(
    private requestService: RequestService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      action: ['', Validators.required],
      comments: ['']
    });
  }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.requestService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.isLoading = false;
        console.log('Loaded pending requests:', requests);
      },
      error: (error) => {
        console.error('Failed to load pending requests:', error);
        this.isLoading = false;
      }
    });
  }

  openReviewModal(request: any): void {
    console.log('Opening review modal for request:', request);
    this.selectedRequest = request;
    this.showReviewModal = true;
    this.reviewForm.reset();
    
    // Parse income sources for display
    this.parsedIncomeSources = [];
    if (request.income_sources) {
      try {
        console.log('Raw income_sources:', request.income_sources);
        console.log('Type of income_sources:', typeof request.income_sources);
        
        let sources;
        if (typeof request.income_sources === 'string') {
          sources = JSON.parse(request.income_sources);
        } else {
          sources = request.income_sources;
        }
        
        console.log('Parsed income sources:', sources);
        
        if (Array.isArray(sources) && sources.length > 0) {
          this.parsedIncomeSources = sources;
          console.log('Successfully set parsedIncomeSources:', this.parsedIncomeSources);
        } else {
          console.log('Income sources is not a valid array or is empty');
        }
      } catch (error) {
        console.error('Error parsing income sources:', error);
        console.error('Raw data that failed to parse:', request.income_sources);
        this.parsedIncomeSources = [];
      }
    } else {
      console.log('No income_sources field found in request');
    }
    
    console.log('Final parsedIncomeSources:', this.parsedIncomeSources);
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedRequest = null;
    this.parsedIncomeSources = [];
    this.reviewForm.reset();
  }

  getIncomeSources(incomeSourcesJson: string): any[] {
    if (!incomeSourcesJson) return [];
    
    try {
      return JSON.parse(incomeSourcesJson);
    } catch (error) {
      console.error('Error parsing income sources:', error);
      return [];
    }
  }

  getIncomeTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'job': '💼',
      'land': '🏡',
      'vehicle': '🚗',
      'business': '🏪',
      'welfare': '🤝',
      'pension': '👴',
      'other': '💰'
    };
    return iconMap[type] || '💰';
  }

  getIncomeTypeLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      'job': 'Job/Employment',
      'land': 'Land/Property',
      'vehicle': 'Vehicle Income',
      'business': 'Business Income',
      'welfare': 'Welfare Benefits',
      'pension': 'Pension',
      'other': 'Other Income'
    };
    return labelMap[type] || 'Other Income';
  }

  getTotalMonthlyIncome(): number {
    if (!this.parsedIncomeSources || this.parsedIncomeSources.length === 0) {
      return 0;
    }
    
    return this.parsedIncomeSources.reduce((total: number, source: any) => {
      return total + (parseFloat(source.income) || 0);
    }, 0);
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.selectedRequest) {
      this.isReviewing = true;
      const { action, comments } = this.reviewForm.value;

      console.log('Submitting review:', { action, comments, requestId: this.selectedRequest.id });

      this.requestService.reviewRequest(this.selectedRequest.id, action, comments).subscribe({
        next: (response) => {
          this.isReviewing = false;
          this.closeReviewModal();
          this.loadPendingRequests();
          
          const actionText = action === 'approve' ? 'approved' : 'rejected';
          alert(`Request ${actionText} successfully!`);
        },
        error: (error) => {
          this.isReviewing = false;
          console.error('Review failed:', error);
          alert('Failed to submit review. Please try again.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'submitted':
        return 'status-new';
      case 'under_gn_review':
        return 'status-reviewing';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'submitted':
        return 'New Request';
      case 'under_gn_review':
        return 'Under Review';
      default:
        return status;
    }
  }

  formatIncomeSources(sources: string): string {
    try {
      const parsed = JSON.parse(sources);
      return parsed.map((source: any) => `${source.type}: Rs. ${source.income}`).join(', ');
    } catch {
      return 'N/A';
    }
  }
}