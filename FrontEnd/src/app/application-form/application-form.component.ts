import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.css']
})
export class ApplicationFormComponent implements OnInit {
  applicationForm: FormGroup;
  selectedFiles: File[] = [];
  pensionBookFiles: File[] = [];
  isSubmitted = false;
  referenceNumber = '';
  showNotification = false;
  
  // Dropdown options
  pensionTypes = [
    { value: 'contributory', label: 'Contributory Pension' },
    { value: 'non-contributory', label: 'Non-Contributory Pension' },
    { value: 'widow-widower', label: 'Widow/Widower Pension' },
    { value: 'disability', label: 'Disability Pension' },
    { value: 'old-age', label: 'Old Age Pension' },
    { value: 'survivors', label: 'Survivors Pension' },
    { value: 'other', label: 'Other' }
  ];

  provinces = [
    { value: 'western', label: 'Western Province' },
    { value: 'central', label: 'Central Province' },
    { value: 'southern', label: 'Southern Province' },
    { value: 'northern', label: 'Northern Province' },
    { value: 'eastern', label: 'Eastern Province' },
    { value: 'north-western', label: 'North Western Province' },
    { value: 'north-central', label: 'North Central Province' },
    { value: 'uva', label: 'Uva Province' },
    { value: 'sabaragamuwa', label: 'Sabaragamuwa Province' }
  ];
  
  constructor(private fb: FormBuilder) {
    this.applicationForm = this.fb.group({
      // Personal Information
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      nicNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)]],
      dateOfBirth: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      
      // Address Information
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      gsDivision: [''],
      
      // Pension Information
      pensionType: ['', Validators.required],
      pensionReferenceNumber: [''],
      retirementDate: [''],
      pensionStartDate: [''],
      lastEmployer: [''],
      lastDesignation: [''],
      
      // Income Details
      monthlyPension: ['', [Validators.required, Validators.min(0)]],
      annualPension: ['', [Validators.required, Validators.min(0)]],
      otherIncomeSources: ['0', Validators.min(0)],
      taxFileNumber: [''],
      
      // Request Details
      requestReason: ['', Validators.required],
      additionalInfo: [''],
      
      // Declaration
      declaration: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.generateReferenceNumber();
    
    // Auto-calculate annual pension when monthly pension changes
    this.applicationForm.get('monthlyPension')?.valueChanges.subscribe(value => {
      if (value) {
        const annual = parseFloat(value) * 12;
        this.applicationForm.patchValue({ annualPension: annual.toFixed(2) }, { emitEvent: false });
      }
    });
  }

  get f() { 
    return this.applicationForm.controls; 
  }

  generateReferenceNumber(): void {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.referenceNumber = `INC-${timestamp}-${random}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.size <= 5 * 1024 * 1024) {
          if (['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            this.selectedFiles.push(file);
          } else {
            this.showAlert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
          }
        } else {
          this.showAlert('File too large. Maximum file size is 5MB.');
        }
      }
      input.value = '';
    }
  }

  onPensionBookSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.size <= 5 * 1024 * 1024) {
          if (['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            this.pensionBookFiles.push(file);
          } else {
            this.showAlert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
          }
        } else {
          this.showAlert('File too large. Maximum file size is 5MB.');
        }
      }
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removePensionBookFile(index: number): void {
    this.pensionBookFiles.splice(index, 1);
  }

  showAlert(message: string): void {
    alert(message);
  }

  showSuccessNotification(): void {
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      console.log('Form submitted:', this.applicationForm.value);
      console.log('Payment Slip Files:', this.selectedFiles);
      console.log('Pension Book Files:', this.pensionBookFiles);
      
      const formData = new FormData();
      
      // Append form values
      Object.keys(this.applicationForm.value).forEach(key => {
        if (key !== 'declaration') {
          formData.append(key, this.applicationForm.value[key]);
        }
      });
      
      formData.append('referenceNumber', this.referenceNumber);
      
      // Append payment slip files
      this.selectedFiles.forEach((file, index) => {
        formData.append(`paymentSlip${index}`, file, file.name);
      });

      // Append pension book files
      this.pensionBookFiles.forEach((file, index) => {
        formData.append(`pensionBook${index}`, file, file.name);
      });
      
      this.isSubmitted = true;
      this.showSuccessNotification();
      this.generateReferenceNumber();
      
    } else {
      this.markAllFieldsAsTouched();
      this.showAlert('Please fill in all required fields correctly before submitting.');
    }
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.applicationForm.controls).forEach(controlName => {
      this.applicationForm.get(controlName)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.applicationForm.reset();
    this.selectedFiles = [];
    this.pensionBookFiles = [];
    this.isSubmitted = false;
    this.generateReferenceNumber();
    this.showNotification = false;
    
    // Reset specific default values
    this.applicationForm.patchValue({
      otherIncomeSources: '0'
    });
  }
}
