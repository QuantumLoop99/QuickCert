import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialization logic can go here
  }

  // Navigation methods for quick links
  apply() {
    console.log('Apply button clicked');
    // Navigate to application page
    // this.router.navigate(['/apply']);
  }

  trackApplication() {
    console.log('Track Application button clicked');
    // Navigate to track application page
    // this.router.navigate(['/track']);
  }

  
  downloadPdf() {
    console.log('Download PDF button clicked');
    // Add download logic here
  }


  login() {
    console.log('Login button clicked');
    // Navigate to login page
    // this.router.navigate(['/login']);
  }

}