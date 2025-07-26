import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface VerificationResult {
  reference_no: string;
  request_type: string;
  status: string;
  created_at: string;
  name: string;
  nic: string;
  address: string;
  phone: string;
  reason?: string;
  income_year?: string;
  pension_type?: string;
  pension_number?: string;
  retirement_date?: string;
  verification_code: string;
  income_sources?: string;
}

interface ApiResponse {
  message: string;
  data: VerificationResult;
  error?: string;
}

interface IncomeSource {
  type: string;
  description?: string;
  income: number;
}

@Component({
  selector: 'app-certificate-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './certificate-verification.component.html',
  styleUrl: './certificate-verification.component.css'
})
export class CertificateVerificationComponent implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  verificationForm: FormGroup;
  isLoading = false;
  verificationResult: VerificationResult | null = null;
  error = '';
  
  private subscriptions = new Subscription();
  private readonly API_BASE_URL = 'http://localhost:3000/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.verificationForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormValidation();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      verificationCode: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9]+$/) // Only alphanumeric characters
        ]
      ]
    });
  }

  private setupFormValidation(): void {
    const codeControl = this.verificationForm.get('verificationCode');
    if (codeControl) {
      const subscription = codeControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.clearError();
        });
      
      this.subscriptions.add(subscription);
    }
  }

  private checkRouteParams(): void {
    const subscription = this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.verificationForm.patchValue({ 
          verificationCode: params['code'] 
        });
        // Auto-verify if code is provided in URL
        setTimeout(() => this.verifyCertificate(), 100);
      }
    });
    
    this.subscriptions.add(subscription);
  }

  verifyCertificate(): void {
    if (!this.verificationForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.startVerification();

    const code = this.verificationForm.get('verificationCode')?.value?.trim();
    
    if (!code) {
      this.setError('Please enter a verification code');
      return;
    }

    const subscription = this.http.post<ApiResponse>(
      `${this.API_BASE_URL}/verify-certificate`, 
      { verificationCode: code }
    ).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debug log
        this.handleVerificationSuccess(response);
      },
      error: (error) => {
        console.log('API Error:', error); // Debug log
        this.handleVerificationError(error);
      },
      complete: () => this.stopLoading()
    });

    this.subscriptions.add(subscription);
  }

  private startVerification(): void {
    this.isLoading = true;
    this.clearError();
    this.verificationResult = null;
    this.currentDate = new Date(); // Update verification timestamp
  }

  private stopLoading(): void {
    this.isLoading = false;
  }

  private handleVerificationSuccess(response: ApiResponse): void {
    // The API returns { message: '...', data: { ... } }
    if (response && response.data) {
      this.verificationResult = response.data;
      this.clearError();
      console.log('Certificate verified successfully:', response.data);
    } else {
      console.error('Unexpected response structure:', response);
      this.setError('Invalid response format from server');
    }
  }

  private handleVerificationError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.status === 404) {
      errorMessage = 'Certificate not found. Please check your verification code.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid verification code format.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to verification service. Please check your internet connection.';
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.setError(errorMessage);
  }

  private setError(message: string): void {
    this.error = message;
    this.verificationResult = null;
  }

  private clearError(): void {
    this.error = '';
  }

  resetForm(): void {
    this.verificationForm.reset();
    this.verificationResult = null;
    this.clearError();
    
    // Focus on the input field after reset
    setTimeout(() => {
      const input = document.getElementById('verificationCode');
      if (input) {
        input.focus();
      }
    }, 100);
  }

  markFormGroupTouched(): void {
    Object.keys(this.verificationForm.controls).forEach(key => {
      const control = this.verificationForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.verificationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ds_approved': 'Approved & Valid',
      'gn_approved': 'Partially Approved',
      'under_ds_review': 'Under Review',
      'under_gn_review': 'Under Initial Review',
      'submitted': 'Submitted',
      'pending': 'Pending',
      'processing': 'Processing',
      'rejected': 'Rejected'
    };

    return statusMap[status] || status.replace(/_/g, ' ').toUpperCase();
  }

  getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      'ds_approved': 'status-approved',
      'gn_approved': 'status-processing',
      'under_ds_review': 'status-pending',
      'under_gn_review': 'status-pending',
      'submitted': 'status-submitted',
      'pending': 'status-pending',
      'processing': 'status-processing',
      'rejected': 'status-submitted'
    };

    return statusClassMap[status] || 'status-submitted';
  }

  formatIncomeSources(sources: string): string {
    if (!sources) {
      return 'Not specified';
    }

    try {
      const parsed: IncomeSource[] = JSON.parse(sources);
      
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return 'No income sources specified';
      }

      return parsed
        .map((source: IncomeSource) => {
          const type = source.type || 'Unknown';
          const description = source.description ? ` (${source.description})` : '';
          const income = source.income ? ` - Rs. ${source.income.toLocaleString()}` : '';
          return `${type}${description}${income}`;
        })
        .join('; ');
    } catch (error) {
      console.warn('Error parsing income sources:', error);
      return 'Unable to parse income sources';
    }
  }

  // Utility method to check if verification result has additional details
  hasAdditionalDetails(): boolean {
    if (!this.verificationResult) return false;
    
    return !!(
      this.verificationResult.reason ||
      this.verificationResult.income_year ||
      this.verificationResult.pension_type ||
      this.verificationResult.pension_number ||
      this.verificationResult.income_sources
    );
  }

  // Method to get formatted certificate type
  getFormattedCertificateType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'income_statement': 'Income Statement',
      'pension_report': 'Pension Report',
      'employment_certificate': 'Employment Certificate',
      'tax_certificate': 'Tax Certificate'
    };

    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}