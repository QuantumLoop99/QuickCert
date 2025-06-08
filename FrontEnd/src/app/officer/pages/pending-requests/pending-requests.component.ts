import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-requests',
  imports: [CommonModule],
  templateUrl: './pending-requests.component.html',
  styleUrl: './pending-requests.component.css'
})
export class PendingRequestsComponent {
  officerDivision = 'Kandy Divisional Secretariat'; // This would come from auth in real app

  allRequests = [
    { ref: 'REF123', name: 'Thennakoon', date: '2025-06-01', institute: 'Kandy Divisional Secretariat' },
    { ref: 'REF124', name: 'Welivita', date: '2025-06-02', institute: 'Galle Divisional Secretariat' }
  ];

  get filteredRequests() {
    return this.allRequests.filter(req => req.institute === this.officerDivision);
  }

  review(req: any) {
    alert(`Reviewing application ${req.ref} from ${req.institute}`);
  }
}
