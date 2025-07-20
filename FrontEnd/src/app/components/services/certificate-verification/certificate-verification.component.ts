import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-certificate-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './certificate-verification.component.html',
  styleUrl: './certificate-verification.component.css'
})
export class CertificateVerificationComponent {
  currentDate: Date = new Date();
  verificationForm: FormGroup;
  isLoading = false;
  verificationResult: any = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.verificationForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Check if verification code is provided in URL
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.verificationForm.patchValue({ verificationCode: params['code'] });
        this.verifyCertificate();
      }
    });
  }

  verifyCertificate(): void {
    if (this.verificationForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.verificationResult = null;

      const code = this.verificationForm.get('verificationCode')?.value;

      this.http.post<any>('http://localhost:3000/api/verify-certificate', { verificationCode: code }).subscribe({
        next: (result) => {
          this.verificationResult = result.data; // ✅ Only assign the actual certificate data
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.error?.error || 'Certificate not found or invalid verification code';
          this.isLoading = false;
        }
      });

    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.verificationForm.controls).forEach(key => {
      const control = this.verificationForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.verificationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  resetForm(): void {
    this.verificationForm.reset();
    this.verificationResult = null;
    this.error = '';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ds_approved':
        return 'Approved & Valid';
      case 'gn_approved':
        return 'Partially Approved';
      case 'under_ds_review':
        return 'Under Review';
      case 'under_gn_review':
        return 'Under Initial Review';
      case 'submitted':
        return 'Submitted';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ds_approved':
        return 'status-approved';
      case 'gn_approved':
        return 'status-processing';
      case 'under_ds_review':
      case 'under_gn_review':
        return 'status-pending';
      case 'submitted':
        return 'status-submitted';
      default:
        return '';
    }
  }

  formatIncomeSources(sources: string): string {
    try {
      const parsed = JSON.parse(sources);
      return parsed.map((source: any) => 
        `${source.type}: ${source.description || 'N/A'} - Rs. ${source.income}`
      ).join(', ');
    } catch {
      return 'N/A';
    }
  }
}
