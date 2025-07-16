import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FilterPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  requests: any[] = [];
  isLoading = true;
  officerAvailability: any = null;
  availabilityMessage = '';
  showAvailabilityAlert = false;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
    this.checkOfficerAvailability();
  }

  loadRequests(): void {
    this.requestService.getUserRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load requests:', error);
        this.isLoading = false;
      }
    });
  }

  checkOfficerAvailability(): void {
    this.requestService.checkOfficerAvailability().subscribe({
      next: (response) => {
        this.officerAvailability = response;
        this.updateAvailabilityMessage();
      },
      error: (error) => {
        console.error('Failed to check officer availability:', error);
      }
    });
  }

  updateAvailabilityMessage(): void {
    if (!this.officerAvailability) return;

    const { availability, permissions, messages } = this.officerAvailability;
    
    if (!availability.hasDS) {
      this.availabilityMessage = messages.noDS;
      this.showAvailabilityAlert = true;
    } else if (!availability.hasGN && permissions.employeeType === 'working') {
      this.availabilityMessage = messages.noGN;
      this.showAvailabilityAlert = true;
    } else if (!permissions.canSubmitWorking && !permissions.canSubmitRetired) {
      this.availabilityMessage = 'Request submission is currently unavailable due to missing officers.';
      this.showAvailabilityAlert = true;
    } else {
      this.showAvailabilityAlert = false;
    }
  }

  canSubmitRequest(requestType: string): boolean {
    if (!this.officerAvailability) return false;
    
    const { permissions } = this.officerAvailability;
    
    if (requestType === 'working') {
      return permissions.canSubmitWorking;
    } else if (requestType === 'retired') {
      return permissions.canSubmitRetired;
    }
    
    return false;
  }

  getRequestButtonText(): string {
    if (!this.officerAvailability) return 'New Request';
    
    const { permissions } = this.officerAvailability;
    
    if (permissions.canSubmitWorking && permissions.canSubmitRetired) {
      return 'New Request';
    } else if (permissions.canSubmitRetired && !permissions.canSubmitWorking) {
      return 'New Retired Request';
    } else if (permissions.canSubmitWorking && !permissions.canSubmitRetired) {
      return 'New Working Request';
    } else {
      return 'Request Unavailable';
    }
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
        return 'Approved';
      case 'gn_rejected':
        return 'GN Rejected';
      case 'ds_rejected':
        return 'DS Rejected';
      default:
        return status;
    }
  }
}