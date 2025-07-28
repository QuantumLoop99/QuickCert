import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent implements OnInit {
  request: any = null;
  feedbackForm: FormGroup;
  isLoading = true;
  isDownloading = false;
  isSubmittingFeedback = false;
  showFeedbackForm = false;
  error = '';
  feedbackSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private fb: FormBuilder
  ) {
    this.feedbackForm = this.fb.group({
      rating: ['', Validators.required],
      comments: ['']
    });
  }

  ngOnInit(): void {
    const requestId = this.route.snapshot.params['id'];
    this.loadRequest(requestId);
  }

  loadRequest(id: number): void {
    this.requestService.getRequestStatus(id).subscribe({
      next: (request) => {
        this.request = request;
        this.isLoading = false;
        
        // Check if request is approved
        if (request.status !== 'ds_approved') {
          this.error = 'Document is not yet available for download';
        }
      },
      error: (error) => {
        this.error = 'Failed to load request details';
        this.isLoading = false;
      }
    });
  }

  downloadDocument(): void {
    if (!this.request) return;

    this.isDownloading = true;

    this.requestService.downloadDocument(this.request.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `income_statement_${this.request.reference_no}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isDownloading = false;
        this.showFeedbackForm = true;
      },
      error: () => {
        this.isDownloading = false;
        alert('Failed to download document. Please try again.');
      }
    });
  }


  submitFeedback(): void {
    if (this.feedbackForm.valid && this.request) {
      this.isSubmittingFeedback = true;
      
      const { rating, comments } = this.feedbackForm.value;
      
      this.requestService.submitFeedback(this.request.id, rating, comments).subscribe({
        next: (response) => {
          this.isSubmittingFeedback = false;
          this.feedbackSubmitted = true;
          this.showFeedbackForm = false;
          alert('Thank you for your feedback!');
        },
        error: (error) => {
          this.isSubmittingFeedback = false;
          alert('Failed to submit feedback. Please try again.');
        }
      });
    }
  }

  closeFeedbackForm(): void {
    this.showFeedbackForm = false;
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  setRating(rating: number): void {
    this.feedbackForm.patchValue({ rating });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.feedbackForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}