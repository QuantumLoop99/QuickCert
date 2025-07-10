import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-ds-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './ds-dashboard.component.html',
  styleUrl: './ds-dashboard.component.css'
})
export class DsDashboardComponent implements OnInit {
  pendingRequests: any[] = [];
  selectedRequest: any = null;
  reviewForm: FormGroup;
  monthlyIncomeForm: FormGroup;
  isLoading = true;
  isReviewing = false;
  showReviewModal = false;
  
  // Month names for display
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Calculated totals
  monthlyTotals: number[] = new Array(12).fill(0);
  yearlyTotals = {
    basic: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    tax: 0,
    net: 0
  };

  constructor(
    private requestService: RequestService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      action: ['', Validators.required],
      comments: ['']
    });

    this.monthlyIncomeForm = this.fb.group({
      months: this.fb.array([])
    });

    this.initializeMonthlyForms();
  }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  get monthsArray(): FormArray {
    return this.monthlyIncomeForm.get('months') as FormArray;
  }

  initializeMonthlyForms(): void {
    const monthsArray = this.monthlyIncomeForm.get('months') as FormArray;
    
    // Clear existing forms
    while (monthsArray.length !== 0) {
      monthsArray.removeAt(0);
    }
    
    // Create form for each month
    for (let i = 0; i < 12; i++) {
      const monthForm = this.fb.group({
        basic: [0, [Validators.required, Validators.min(0)]],
        allowances: [0, [Validators.min(0)]],
        bonus: [0, [Validators.min(0)]],
        deductions: [0, [Validators.min(0)]],
        tax: [0, [Validators.min(0)]],
        net: [0]
      });
      
      // Subscribe to changes for real-time calculation
      monthForm.valueChanges.subscribe(() => {
        this.calculateMonthlyNet(i);
        this.calculateYearlyTotals();
      });
      
      monthsArray.push(monthForm);
    }
  }

  loadPendingRequests(): void {
    this.requestService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load pending requests:', error);
        this.isLoading = false;
      }
    });
  }

  openReviewModal(request: any): void {
    this.selectedRequest = request;
    this.showReviewModal = true;
    this.reviewForm.reset();
    this.resetMonthlyForms();
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedRequest = null;
    this.reviewForm.reset();
    this.resetMonthlyForms();
  }

  resetMonthlyForms(): void {
    this.initializeMonthlyForms();
    this.monthlyTotals = new Array(12).fill(0);
    this.yearlyTotals = {
      basic: 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      tax: 0,
      net: 0
    };
  }

  getMonthForm(index: number): FormGroup {
    return this.monthsArray.at(index) as FormGroup;
  }

  calculateMonthlyNet(monthIndex: number): void {
    const monthForm = this.getMonthForm(monthIndex);
    const basic = parseFloat(monthForm.get('basic')?.value || 0);
    const allowances = parseFloat(monthForm.get('allowances')?.value || 0);
    const bonus = parseFloat(monthForm.get('bonus')?.value || 0);
    const deductions = parseFloat(monthForm.get('deductions')?.value || 0);
    const tax = parseFloat(monthForm.get('tax')?.value || 0);
    
    const net = basic + allowances + bonus - deductions - tax;
    this.monthlyTotals[monthIndex] = net;
    
    // Update the net field without triggering valueChanges
    monthForm.get('net')?.setValue(net, { emitEvent: false });
  }

  calculateYearlyTotals(): void {
    this.yearlyTotals = {
      basic: 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      tax: 0,
      net: 0
    };

    for (let i = 0; i < 12; i++) {
      const monthForm = this.getMonthForm(i);
      this.yearlyTotals.basic += parseFloat(monthForm.get('basic')?.value || 0);
      this.yearlyTotals.allowances += parseFloat(monthForm.get('allowances')?.value || 0);
      this.yearlyTotals.bonus += parseFloat(monthForm.get('bonus')?.value || 0);
      this.yearlyTotals.deductions += parseFloat(monthForm.get('deductions')?.value || 0);
      this.yearlyTotals.tax += parseFloat(monthForm.get('tax')?.value || 0);
    }
    
    this.yearlyTotals.net = this.yearlyTotals.basic + this.yearlyTotals.allowances + 
                           this.yearlyTotals.bonus - this.yearlyTotals.deductions - 
                           this.yearlyTotals.tax;
  }

  copyToAllMonths(field: string, monthIndex: number): void {
    const sourceValue = this.getMonthForm(monthIndex).get(field)?.value || 0;
    
    for (let i = 0; i < 12; i++) {
      if (i !== monthIndex) {
        this.getMonthForm(i).get(field)?.setValue(sourceValue);
      }
    }
  }

  fillBasicPensionForAll(): void {
    const firstMonthBasic = this.getMonthForm(0).get('basic')?.value || 0;
    if (firstMonthBasic > 0) {
      for (let i = 1; i < 12; i++) {
        this.getMonthForm(i).get('basic')?.setValue(firstMonthBasic);
      }
    }
  }

  isFormValid(): boolean {
    const reviewValid = this.reviewForm.valid;
    
    if (this.isApprovalWithRetiredRequest()) {
      // Check if at least one month has basic pension > 0
      const hasValidData = this.monthsArray.controls.some(monthForm => {
        const basic = parseFloat(monthForm.get('basic')?.value || 0);
        return basic > 0;
      });
      
      return reviewValid && this.monthlyIncomeForm.valid && hasValidData;
    }
    
    return reviewValid;
  }

  submitReview(): void {
    if (this.isFormValid() && this.selectedRequest) {
      const { action, comments } = this.reviewForm.value;
      let monthlyIncomeData = null;

      // For retired requests that are being approved, include monthly income data
      if (action === 'approve' && this.selectedRequest.request_type === 'retired') {
        const monthlyData: any[] = [];
        
        for (let i = 0; i < 12; i++) {
          const monthForm = this.getMonthForm(i);
          monthlyData.push({
            month: i + 1,
            monthName: this.monthNames[i],
            basic: parseFloat(monthForm.get('basic')?.value || 0),
            allowances: parseFloat(monthForm.get('allowances')?.value || 0),
            bonus: parseFloat(monthForm.get('bonus')?.value || 0),
            deductions: parseFloat(monthForm.get('deductions')?.value || 0),
            tax: parseFloat(monthForm.get('tax')?.value || 0),
            net: this.monthlyTotals[i]
          });
        }

        monthlyIncomeData = {
          year: this.selectedRequest.income_year || new Date().getFullYear(),
          monthlyBreakdown: monthlyData,
          yearlyTotals: this.yearlyTotals,
          averageMonthly: this.yearlyTotals.net / 12
        };
      }

      this.isReviewing = true;

      this.requestService.reviewRequest(this.selectedRequest.id, action, comments, monthlyIncomeData).subscribe({
        next: (response) => {
          this.isReviewing = false;
          this.closeReviewModal();
          this.loadPendingRequests();
          alert(`Request ${action}d successfully!`);
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
      case 'gn_approved':
        return 'status-new';
      case 'under_ds_review':
        return 'status-reviewing';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'submitted':
        return 'New Request';
      case 'gn_approved':
        return 'GN Approved';
      case 'under_ds_review':
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

  isApprovalWithRetiredRequest(): boolean {
    return this.reviewForm.get('action')?.value === 'approve' && 
           this.selectedRequest?.request_type === 'retired';
  }

  getRequestedYear(): number {
    return this.selectedRequest?.income_year || new Date().getFullYear();
  }
}