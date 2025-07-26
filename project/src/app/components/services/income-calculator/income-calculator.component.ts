import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-income-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './income-calculator.component.html',
  styleUrl: './income-calculator.component.css'
})
export class IncomeCalculatorComponent {
  calculatorForm: FormGroup;
  
  incomeTypes = [
    { value: 'job', label: 'Job/Employment', icon: '💼' },
    { value: 'land', label: 'Land/Property', icon: '🏡' },
    { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { value: 'business', label: 'Business', icon: '🏪' },
    { value: 'welfare', label: 'Welfare Benefits', icon: '🤝' },
    { value: 'pension', label: 'Pension', icon: '👴' },
    { value: 'other', label: 'Other', icon: '💰' }
  ];

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      incomes: this.fb.array([this.createIncomeGroup()])
    });
  }

  get incomes(): FormArray {
    return this.calculatorForm.get('incomes') as FormArray;
  }

  createIncomeGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  addIncome(): void {
    this.incomes.push(this.createIncomeGroup());
  }

  removeIncome(index: number): void {
    if (this.incomes.length > 1) {
      this.incomes.removeAt(index);
    }
  }

  getTotalIncome(): number {
    return this.incomes.controls.reduce((total, control) => {
      const amount = parseFloat(control.get('amount')?.value || 0);
      return total + amount;
    }, 0);
  }

  getAnnualIncome(): number {
    return this.getTotalIncome() * 12;
  }

  getIncomeTypeIcon(type: string): string {
    const incomeType = this.incomeTypes.find(t => t.value === type);
    return incomeType ? incomeType.icon : '💰';
  }

  getIncomeTypeLabel(type: string): string {
    const incomeType = this.incomeTypes.find(t => t.value === type);
    return incomeType ? incomeType.label : 'Other';
  }

  resetCalculator(): void {
    this.calculatorForm.reset();
    while (this.incomes.length > 1) {
      this.incomes.removeAt(1);
    }
  }

  isFieldInvalid(index: number, fieldName: string): boolean {
    const control = this.incomes.at(index).get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}