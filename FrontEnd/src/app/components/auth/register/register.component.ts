import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LocationService } from '../../../services/location.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  step = 1;
  userType = '';
  districts: any[] = [];
  dsOffices: any[] = [];
  gnDivisions: any[] = [];
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userType: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      title: [''],
      nic: [''],
      dob: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: [''],
      employeeType: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      district: [''],
      dsOffice: [''],
      gnDivision: [''],
      authCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadDistricts();
  }

  selectUserType(type: string): void {
    this.userType = type;
    this.registerForm.patchValue({ userType: type });
    
    if (type === 'citizen') {
      this.step = 2; // Go directly to form for citizens
      this.setupCitizenValidators();
    } else if (type === 'officer') {
      this.step = 2; // Go to officer type selection
      // Don't setup validators yet, wait for officer type selection
    }
  }

  selectOfficerType(type: string): void {
    this.userType = type;
    this.registerForm.patchValue({ userType: type });
    this.step = 3; // Now go to the form
    this.setupOfficerValidators();
  }

  setupCitizenValidators(): void {
    this.registerForm.get('nic')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)]);
    this.registerForm.get('dob')?.setValidators(Validators.required);
    this.registerForm.get('address')?.setValidators(Validators.required);
    this.registerForm.get('employeeType')?.setValidators(Validators.required);
    this.registerForm.get('district')?.setValidators(Validators.required);
    this.registerForm.get('dsOffice')?.setValidators(Validators.required);
    this.registerForm.get('gnDivision')?.setValidators(Validators.required);
    this.registerForm.updateValueAndValidity();
  }

  setupOfficerValidators(): void {
    this.registerForm.get('authCode')?.setValidators(Validators.required);
    this.registerForm.get('district')?.setValidators(Validators.required);
    this.registerForm.get('dsOffice')?.setValidators(Validators.required);
    
    if (this.userType === 'gn_officer') {
      this.registerForm.get('gnDivision')?.setValidators(Validators.required);
    }
    
    this.registerForm.updateValueAndValidity();
  }

  loadDistricts(): void {
    this.locationService.getDistricts().subscribe({
      next: (districts) => {
        this.districts = districts;
      },
      error: (error) => {
        console.error('Failed to load districts:', error);
      }
    });
  }

  onDistrictChange(): void {
    const districtId = this.registerForm.get('district')?.value;
    if (districtId) {
      this.locationService.getDSOffices(districtId).subscribe({
        next: (dsOffices) => {
          this.dsOffices = dsOffices;
          this.gnDivisions = [];
          this.registerForm.patchValue({ dsOffice: '', gnDivision: '' });
        },
        error: (error) => {
          console.error('Failed to load DS offices:', error);
        }
      });
    }
  }

  onDSOfficeChange(): void {
    const dsOfficeId = this.registerForm.get('dsOffice')?.value;
    if (dsOfficeId) {
      this.locationService.getGNDivisions(dsOfficeId).subscribe({
        next: (gnDivisions) => {
          this.gnDivisions = gnDivisions;
          this.registerForm.patchValue({ gnDivision: '' });
        },
        error: (error) => {
          console.error('Failed to load GN divisions:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      this.error = '';

      // Log the data being sent for debugging
      console.log('Registration data:', this.registerForm.value);

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert('Registration successful! You can now login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          
          // More detailed error handling
          if (error.error?.error) {
            this.error = error.error.error;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Registration failed. Please check your information and try again.';
          }
          
          // Log full error for debugging
          console.log('Full error object:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    if (this.step > 1) {
      this.step--;
      if (this.step === 1) {
        // Reset user type when going back to step 1
        this.userType = '';
        this.registerForm.patchValue({ userType: '' });
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Please enter a valid 10-digit phone number';
        if (fieldName === 'nic') return 'Please enter a valid NIC number';
      }
    }
    return '';
  }
}