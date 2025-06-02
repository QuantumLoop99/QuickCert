import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterComponent } from "../register/register.component";

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RegisterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loginMessage = '';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      nic: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    // Simulate login success
    this.loginMessage = 'Login successful! Redirecting to your dashboard...';
    this.loginForm.reset();
    this.submitted = false;
  }
}
