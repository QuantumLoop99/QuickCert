import { Component } from '@angular/core';
import { SafePipe } from '../shared/pipes/safe.pipe';

@Component({
  selector: 'app-document-viewr',
  imports: [SafePipe],
  templateUrl: './document-viewr.component.html',
  styleUrl: './document-viewr.component.css'
})
export class DocumentViewrComponent {
  documentUrl: string = 'sample.pdf'; // replace with dynamic URL later
  documentName: string = 'Income Statement';

    // Additional metadata
  applicantName: string = 'Thennakoon M.T.T.';
  issuedDate: string = '2025-06-05';
  referenceNumber: string = 'REQ-20250605-001';
  officerName: string = 'Officer K.P. Silva';

  logoPath: string = 'images/QuickCERT(T.1).png';
}
