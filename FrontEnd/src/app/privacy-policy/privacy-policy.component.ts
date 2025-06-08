import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    // Set page title
    this.titleService.setTitle('Privacy Policy - QuickCert | Official Income Statement Certification');
    
    // Set meta tags for SEO
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Privacy Policy for QuickCert - Official digital platform of Divisional Secretariat Sri Lanka. Learn how we protect your personal information and data security.' 
    });
    
    this.metaService.updateTag({ 
      name: 'keywords', 
      content: 'QuickCert privacy policy, data protection, Sri Lanka government, income statement, personal information security' 
    });
    
    this.metaService.updateTag({ 
      property: 'og:title', 
      content: 'Privacy Policy - QuickCert' 
    });
    
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: 'Learn about QuickCert\'s commitment to protecting your privacy and personal information in our income statement certification process.' 
    });
    
    this.metaService.updateTag({ 
      property: 'og:type', 
      content: 'website' 
    });

    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  /**
   * Navigate to home page
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to login page
   */
  login(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to terms of service page
   */
  navigateToTerms(): void {
    this.router.navigate(['/terms-of-service']);
  }

  /**
   * Navigate to FAQ page
   */
  navigateToFAQ(): void {
    this.router.navigate(['/faq']);
  }

  /**
   * Navigate to contact page
   */
  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  /**
   * Handle privacy-related inquiries
   */
  contactPrivacyOfficer(): void {
    // This could open an email client or navigate to a contact form
    const emailSubject = 'Privacy Policy Inquiry - QuickCert';
    const emailBody = 'Dear QuickCert Privacy Officer,%0D%0A%0D%0AI have a question regarding your Privacy Policy:%0D%0A%0D%0A[Please describe your inquiry here]%0D%0A%0D%0AThank you for your assistance.%0D%0A%0D%0ABest regards';
    const mailtoLink = `mailto:privacy@quickcert.gov.lk?subject=${emailSubject}&body=${emailBody}`;
    
    window.location.href = mailtoLink;
  }

  /**
   * Download privacy policy as PDF (future enhancement)
   */
  downloadPrivacyPolicy(): void {
    // This would implement PDF generation/download functionality
    console.log('Privacy Policy PDF download requested');
    // Future implementation: Generate and download PDF version
  }

  /**
   * Handle user consent preferences (future enhancement)
   */
  manageCookiePreferences(): void {
    // This would open a cookie/privacy preferences modal
    console.log('Cookie preferences management requested');
    // Future implementation: Cookie consent management
  }

  /**
   * Scroll to specific section of privacy policy
   * @param sectionId - The ID of the section to scroll to
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  /**
   * Handle data subject requests (GDPR-style rights)
   */
  requestDataAccess(): void {
    // Navigate to a data request form or open email
    const emailSubject = 'Data Access Request - QuickCert';
    const emailBody = 'Dear QuickCert Data Protection Officer,%0D%0A%0D%0AI would like to request access to my personal data stored in the QuickCert system.%0D%0A%0D%0ANIC Number: [Your NIC Number]%0D%0AEmail: [Your Email Address]%0D%0A%0D%0APlease provide me with a copy of my personal information as outlined in your Privacy Policy.%0D%0A%0D%0AThank you.';
    const mailtoLink = `mailto:privacy@quickcert.gov.lk?subject=${emailSubject}&body=${emailBody}`;
    
    window.location.href = mailtoLink;
  }

  /**
   * Handle data correction requests
   */
  requestDataCorrection(): void {
    const emailSubject = 'Data Correction Request - QuickCert';
    const emailBody = 'Dear QuickCert Data Protection Officer,%0D%0A%0D%0AI would like to request correction of my personal data in the QuickCert system.%0D%0A%0D%0ANIC Number: [Your NIC Number]%0D%0AEmail: [Your Email Address]%0D%0A%0D%0AIncorrect Information: [Describe what needs to be corrected]%0D%0ACorrect Information: [Provide the correct information]%0D%0A%0D%0AThank you.';
    const mailtoLink = `mailto:privacy@quickcert.gov.lk?subject=${emailSubject}&body=${emailBody}`;
    
    window.location.href = mailtoLink;
  }

  /**
   * Handle account deletion requests
   */
  requestAccountDeletion(): void {
    // Show confirmation dialog first
    const confirmDelete = confirm(
      'Are you sure you want to request account deletion? This action may affect your ability to access historical income certificates and ongoing applications.\n\nNote: Some data may be retained as required by Sri Lankan government record-keeping laws.'
    );
    
    if (confirmDelete) {
      const emailSubject = 'Account Deletion Request - QuickCert';
      const emailBody = 'Dear QuickCert Data Protection Officer,%0D%0A%0D%0AI would like to request deletion of my QuickCert account and associated personal data.%0D%0A%0D%0ANIC Number: [Your NIC Number]%0D%0AEmail: [Your Email Address]%0D%0A%0D%0AI understand that some data may be retained as required by law and that this may affect my access to historical certificates.%0D%0A%0D%0APlease confirm receipt of this request and advise on the deletion process.%0D%0A%0D%0AThank you.';
      const mailtoLink = `mailto:privacy@quickcert.gov.lk?subject=${emailSubject}&body=${emailBody}`;
      
      window.location.href = mailtoLink;
    }
  }
}