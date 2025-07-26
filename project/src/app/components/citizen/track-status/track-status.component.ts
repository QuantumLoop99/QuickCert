import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-track-status',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './track-status.component.html',
  styleUrl: './track-status.component.css'
})
export class TrackStatusComponent implements OnInit {
  request: any = null;
  isLoading = true;
  error = '';

  statusSteps = [
    { key: 'submitted', label: 'Submitted', description: 'Request has been submitted successfully' },
    { key: 'under_gn_review', label: 'GN Review', description: 'Under review by Grama Niladhari Officer' },
    { key: 'gn_approved', label: 'GN Approved', description: 'Approved by Grama Niladhari Officer' },
    { key: 'under_ds_review', label: 'DS Review', description: 'Under review by Divisional Secretariat Officer' },
    { key: 'ds_approved', label: 'Completed', description: 'Income statement is ready for download' }
  ];

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    const requestId = this.route.snapshot.params['id'];
    this.loadRequestStatus(requestId);
  }

  loadRequestStatus(id: number): void {
    this.requestService.getRequestStatus(id).subscribe({
      next: (request) => {
        this.request = request;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load request status';
        this.isLoading = false;
      }
    });
  }

  getStatusIndex(status: string): number {
    return this.statusSteps.findIndex(step => step.key === status);
  }

  isStepCompleted(stepIndex: number): boolean {
    const currentIndex = this.getStatusIndex(this.request?.status);
    return stepIndex <= currentIndex;
  }

  isStepActive(stepIndex: number): boolean {
    const currentIndex = this.getStatusIndex(this.request?.status);
    return stepIndex === currentIndex;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'submitted':
      case 'under_gn_review':
      case 'under_ds_review':
        return 'status-pending';
      case 'gn_approved':
        return 'status-processing';
      case 'ds_approved':
        return 'status-approved';
      case 'gn_rejected':
      case 'ds_rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_gn_review':
        return 'Under GN Review';
      case 'gn_approved':
        return 'GN Approved';
      case 'under_ds_review':
        return 'Under DS Review';
      case 'ds_approved':
        return 'Approved & Ready';
      case 'gn_rejected':
        return 'Rejected by GN';
      case 'ds_rejected':
        return 'Rejected by DS';
      default:
        return status;
    }
  }

  formatIncomeSources(sources: string): string {
    try {
      const parsed = JSON.parse(sources);
      return parsed.map((source: any) => {
        switch (source.type) {
          case 'job':
            return `${source.title} at ${source.institute}: Rs. ${source.income}`;
          case 'land':
            return `Land at ${source.location} (${source.deedNo}): Rs. ${source.income}`;
          case 'vehicle':
            return `${source.vehicleType} (${source.regNo}): Rs. ${source.income}`;
          case 'business':
            return `${source.title} (${source.regNo}): Rs. ${source.income}`;
          case 'welfare':
            return `${source.title} (${source.beneficiaryNo}): Rs. ${source.income}`;
          default:
            return `${source.type}: Rs. ${source.income}`;
        }
      }).join(', ');
    } catch {
      return 'N/A';
    }
  }

  isRejected(): boolean {
    return this.request?.status === 'gn_rejected' || this.request?.status === 'ds_rejected';
  }

  isApproved(): boolean {
    return this.request?.status === 'ds_approved';
  }
}