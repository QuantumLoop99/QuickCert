import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './new-request.component.html',
  styleUrl: './new-request.component.css'
})
export class NewRequestComponent implements OnInit {
  requestForm: FormGroup;
  currentUser: any;
  isLoading = false;
  error = '';
  availableYears: number[] = [];
  officerAvailability: any = null;
  allowedRequestTypes: string[] = [];

  welfareTypes = [
    'Samurdhi',
    'Elderly Allowance',
    'Disability Allowance',
    'Kidney Patient Allowance',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      requestType: ['', Validators.required],
      incomeYear: [''], // For retired citizens
      reason: ['', Validators.required],
      paymentRef: ['', Validators.required],
      // Working citizen fields
      incomeSources: this.fb.array([]),
      // Retired citizen fields
      pensionType: [''],
      retirementDate: [''],
      pensionNumber: [''],
      workedInstitute: [''],
      declaration: [false, Validators.requiredTrue]
    });

    // Get current user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
    }

    // Generate available years (current year and previous 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.checkOfficerAvailability();
    
    if (this.currentUser?.employeeType) {
      this.requestForm.patchValue({ requestType: this.currentUser.employeeType });
      this.onRequestTypeChange();
    }
  }

  checkOfficerAvailability(): void {
    this.requestService.checkOfficerAvailability().subscribe({
      next: (response) => {
        this.officerAvailability = response;
        this.updateAllowedRequestTypes();
      },
      error: (error) => {
        console.error('Failed to check officer availability:', error);
        this.error = 'Failed to check request availability. Please try again.';
      }
    });
  }

  updateAllowedRequestTypes(): void {
    if (!this.officerAvailability) return;

    const { permissions } = this.officerAvailability;
    this.allowedRequestTypes = [];

    if (permissions.canSubmitWorking) {
      this.allowedRequestTypes.push('working');
    }
    if (permissions.canSubmitRetired) {
      this.allowedRequestTypes.push('retired');
    }

    // If no request types are allowed, show error
    if (this.allowedRequestTypes.length === 0) {
      this.error = 'Request submission is currently unavailable. Please check with your local DS office.';
    }
  }

  canSubmitRequestType(requestType: string): boolean {
    return this.allowedRequestTypes.includes(requestType);
  }

  get incomeSources(): FormArray {
    return this.requestForm.get('incomeSources') as FormArray;
  }

  onRequestTypeChange(): void {
    const requestType = this.requestForm.get('requestType')?.value;
    
    console.log('Request type changed to:', requestType);
    
    // Check if this request type is allowed
    if (!this.canSubmitRequestType(requestType)) {
      this.error = `${requestType === 'working' ? 'Working' : 'Retired'} requests are not currently available. Please check officer availability.`;
      this.requestForm.patchValue({ requestType: '' });
      return;
    }
    
    if (requestType === 'working') {
      this.setupWorkingValidators();
      if (this.incomeSources.length === 0) {
        this.addIncomeSource(); // Add first income source
      }
    } else if (requestType === 'retired') {
      this.setupRetiredValidators();
      this.clearIncomeSources();
    }
  }

  setupWorkingValidators(): void {
    // Clear retired validators
    this.requestForm.get('incomeYear')?.clearValidators();
    this.requestForm.get('pensionType')?.clearValidators();
    this.requestForm.get('retirementDate')?.clearValidators();
    this.requestForm.get('pensionNumber')?.clearValidators();
    this.requestForm.get('workedInstitute')?.clearValidators();
    
    // Reset values
    this.requestForm.patchValue({
      incomeYear: '',
      pensionType: '',
      retirementDate: '',
      pensionNumber: '',
      workedInstitute: ''
    });
    
    this.requestForm.updateValueAndValidity();
  }

  setupRetiredValidators(): void {
    // Set retired validators
    this.requestForm.get('incomeYear')?.setValidators(Validators.required);
    this.requestForm.get('pensionType')?.setValidators(Validators.required);
    this.requestForm.get('retirementDate')?.setValidators(Validators.required);
    this.requestForm.get('pensionNumber')?.setValidators(Validators.required);
    this.requestForm.get('workedInstitute')?.setValidators(Validators.required);
    this.requestForm.updateValueAndValidity();
  }

  createIncomeSourceGroup(type: string = ''): FormGroup {
    const group = this.fb.group({
      type: [type, Validators.required],
      title: [''],
      institute: [''],
      location: [''],
      deedNo: [''],
      regNo: [''],
      vehicleType: [''],
      beneficiaryNo: [''],
      description: [''], // Add description field
      income: ['', [Validators.required, Validators.min(0.01)]]
    });

    // Set up conditional validators based on type
    group.get('type')?.valueChanges.subscribe(selectedType => {
      this.updateIncomeSourceValidators(group, selectedType || '');
    });

    return group;
  }

  updateIncomeSourceValidators(group: FormGroup, type: string): void {
    // Clear all validators first
    Object.keys(group.controls).forEach(key => {
      if (key !== 'type' && key !== 'income' && key !== 'description') {
        group.get(key)?.clearValidators();
      }
    });

    // Set validators based on type - either specific fields OR description is required
    switch (type) {
      case 'job':
        // Either (title AND institute) OR description is required
        break;
      case 'land':
        // Either (location AND deedNo) OR description is required
        break;
      case 'vehicle':
        // Either (vehicleType AND regNo) OR description is required
        break;
      case 'business':
        // Either (title AND regNo) OR description is required
        break;
      case 'welfare':
        // Either (title AND beneficiaryNo) OR description is required
        break;
    }

    group.updateValueAndValidity();
  }

  addIncomeSource(type: string = ''): void {
    const incomeSource = this.createIncomeSourceGroup(type);
    this.incomeSources.push(incomeSource);
    console.log('Added income source, total count:', this.incomeSources.length);
  }

  removeIncomeSource(index: number): void {
    this.incomeSources.removeAt(index);
    console.log('Removed income source, total count:', this.incomeSources.length);
  }

  clearIncomeSources(): void {
    while (this.incomeSources.length !== 0) {
      this.incomeSources.removeAt(0);
    }
    console.log('Cleared all income sources');
  }

  onSubmit(): void {
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form valid:', this.requestForm.valid);
    console.log('Form value:', this.requestForm.value);
    console.log('Form errors:', this.getFormErrors());

    if (this.requestForm.valid) {
      this.isLoading = true;
      this.error = '';

      const formData = { ...this.requestForm.value };
      
      console.log('Processing form data for request type:', formData.requestType);

      // Check if request type is allowed
      if (!this.canSubmitRequestType(formData.requestType)) {
        this.error = `${formData.requestType === 'working' ? 'Working' : 'Retired'} requests are not currently available.`;
        this.isLoading = false;
        return;
      }

      // Validate specific requirements
      if (formData.requestType === 'working') {
        if (!formData.incomeSources || formData.incomeSources.length === 0) {
          this.error = 'Please add at least one income source for working person requests.';
          this.isLoading = false;
          return;
        }
        
        // Validate each income source
        for (let i = 0; i < formData.incomeSources.length; i++) {
          const source = formData.incomeSources[i];
          console.log(`Validating income source ${i + 1}:`, source);
          
          if (!source.type || !source.income || parseFloat(source.income) <= 0) {
            this.error = `Please complete all required fields for income source ${i + 1}.`;
            this.isLoading = false;
            return;
          }

          // Check if either specific fields or description is provided
          const hasDescription = source.description && source.description.trim().length > 0;
          let hasSpecificFields = false;

          switch (source.type) {
            case 'job':
              hasSpecificFields = source.title && source.institute;
              break;
            case 'land':
              hasSpecificFields = source.location && source.deedNo;
              break;
            case 'vehicle':
              hasSpecificFields = source.vehicleType && source.regNo;
              break;
            case 'business':
              hasSpecificFields = source.title && source.regNo;
              break;
            case 'welfare':
              hasSpecificFields = source.title && source.beneficiaryNo;
              break;
          }

          if (!hasDescription && !hasSpecificFields) {
            this.error = `Please provide either specific details or a description for income source ${i + 1}.`;
            this.isLoading = false;
            return;
          }
        }
        
        // Clean up income sources data
        formData.incomeSources = formData.incomeSources.map((source: any) => {
          const cleanSource: any = {
            type: source.type,
            income: parseFloat(source.income)
          };

          // Use description if provided, otherwise build from specific fields
          if (source.description && source.description.trim().length > 0) {
            cleanSource.description = source.description.trim();
          } else {
            switch (source.type) {
              case 'job':
                cleanSource.title = source.title;
                cleanSource.institute = source.institute;
                cleanSource.description = `${source.title} at ${source.institute}`;
                break;
              case 'land':
                cleanSource.location = source.location;
                cleanSource.deedNo = source.deedNo;
                cleanSource.description = `Land at ${source.location} (Deed: ${source.deedNo})`;
                break;
              case 'vehicle':
                cleanSource.vehicleType = source.vehicleType;
                cleanSource.regNo = source.regNo;
                cleanSource.description = `${source.vehicleType} (${source.regNo})`;
                break;
              case 'business':
                cleanSource.title = source.title;
                cleanSource.regNo = source.regNo;
                cleanSource.description = `${source.title} (Reg: ${source.regNo})`;
                break;
              case 'welfare':
                cleanSource.title = source.title;
                cleanSource.beneficiaryNo = source.beneficiaryNo;
                cleanSource.description = `${source.title} (${source.beneficiaryNo})`;
                break;
            }
          }

          return cleanSource;
        });
      } else if (formData.requestType === 'retired') {
        // Validate retired person fields
        if (!formData.incomeYear || !formData.pensionType || !formData.pensionNumber || 
            !formData.retirementDate || !formData.workedInstitute) {
          this.error = 'Please complete all required fields for retired person requests.';
          this.isLoading = false;
          return;
        }
        
        // Clear income sources for retired requests
        delete formData.incomeSources;
      }

      console.log('Final form data being submitted:', formData);

      this.requestService.submitRequest(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Request submitted successfully:', response);
          alert(`Request submitted successfully! Reference: ${response.referenceNo}`);
          this.router.navigate(['/citizen/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Request submission error:', error);
          
          if (error.error?.error) {
            this.error = error.error.error;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Failed to submit request. Please check all required fields and try again.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.error = 'Please complete all required fields before submitting.';
      console.log('Form is invalid, errors:', this.getFormErrors());
    }
  }

  getFormErrors(): any {
    let formErrors: any = {};

    Object.keys(this.requestForm.controls).forEach(key => {
      const controlErrors = this.requestForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });

    // Check income sources errors
    if (this.incomeSources.length > 0) {
      formErrors.incomeSources = [];
      for (let i = 0; i < this.incomeSources.length; i++) {
        const sourceErrors: any = {};
        const sourceGroup = this.incomeSources.at(i) as FormGroup;
        Object.keys(sourceGroup.controls).forEach(key => {
          const controlErrors = sourceGroup.get(key)?.errors;
          if (controlErrors) {
            sourceErrors[key] = controlErrors;
          }
        });
        if (Object.keys(sourceErrors).length > 0) {
          formErrors.incomeSources[i] = sourceErrors;
        }
      }
    }

    return formErrors;
  }

  markFormGroupTouched(): void {
    Object.keys(this.requestForm.controls).forEach(key => {
      const control = this.requestForm.get(key);
      control?.markAsTouched();
    });

    for (const control of this.incomeSources.controls as FormGroup[]) {
      Object.keys(control.controls).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    }
  }

  isFieldInvalid(fieldName: string, index?: number): boolean {
    if (index !== undefined) {
      const group = this.incomeSources.at(index);
      const field = group.get(fieldName);
      return !!(field && field.invalid && field.touched);
    }
    
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string, index?: number): string {
    let field;
    if (index !== undefined) {
      field = this.incomeSources.at(index).get(fieldName);
    } else {
      field = this.requestForm.get(fieldName);
    }

    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  getTotalIncome(): number {
    return this.incomeSources.controls.reduce((total, control) => {
      const income = parseFloat(control.get('income')?.value || 0);
      return total + income;
    }, 0);
  }
}