import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  
  contactInfo = {
    email: 'info@quickcert.gov.lk',
    phone: '+94 11 234 5678',
    address: 'Colombo 07, Sri Lanka'
  };

  officeHours = [
    { day: 'Monday - Friday', time: '8:00 AM - 5:00 PM', isOpen: true },
    { day: 'Saturday', time: '9:00 AM - 1:00 PM', isOpen: true },
    { day: 'Sunday', time: 'Closed', isOpen: false }
  ];

  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  constructor() {
    // Update office hours status based on current time
    this.updateOfficeHoursStatus();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Here you would typically send the form data to a service
      console.log('Form submitted:', this.formData);
      
      // Show success message (you can implement a notification service)
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      this.resetForm();
    }
  }

  private isFormValid(): boolean {
    return !!(this.formData.name && 
              this.formData.email && 
              this.formData.subject && 
              this.formData.message);
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }

  private updateOfficeHoursStatus(): void {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    
    // Update Monday-Friday status
    if (currentDay >= 1 && currentDay <= 5) {
      this.officeHours[0].isOpen = currentHour >= 8 && currentHour < 17;
    } else {
      this.officeHours[0].isOpen = false;
    }
    
    // Update Saturday status
    if (currentDay === 6) {
      this.officeHours[1].isOpen = currentHour >= 9 && currentHour < 13;
    } else {
      this.officeHours[1].isOpen = false;
    }
    
    // Sunday is always closed
    this.officeHours[2].isOpen = false;
  }
}