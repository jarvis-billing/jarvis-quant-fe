import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Supply, MEASUREMENT_UNITS, SUPPLY_CATEGORIES } from '../../../models/insumo.model';
import { CopCurrencyDirective } from '../../../shared/directives/cop-currency.directive';

@Component({
  selector: 'app-insumo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CopCurrencyDirective,
  ],
  templateUrl: './insumo-form.component.html',
  styleUrl: './insumo-form.component.scss'
})
export class InsumoFormComponent {
  form: FormGroup;
  isEdit: boolean;
  measurementUnits = MEASUREMENT_UNITS;
  categories = SUPPLY_CATEGORIES;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InsumoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supply | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      category: [data?.category || '', Validators.required],
      purchaseUnit: [data?.purchaseUnit || '', Validators.required],
      recipeUnit: [data?.recipeUnit || '', Validators.required],
      conversionFactor: [data?.conversionFactor || 1, [Validators.required, Validators.min(0.01)]],
      unitCost: [data?.unitCost || 0, [Validators.required, Validators.min(0)]],
      recipeCost: [{ value: data?.recipeCost || 0, disabled: true }],
      stock: [data?.stock || 0],
      active: [data?.active ?? true],
    });

    this.form.get('unitCost')?.valueChanges.subscribe(() => this.calculateRecipeCost());
    this.form.get('conversionFactor')?.valueChanges.subscribe(() => this.calculateRecipeCost());
  }

  get sameUnit(): boolean {
    return this.form.get('purchaseUnit')?.value === this.form.get('recipeUnit')?.value;
  }

  calculateRecipeCost(): void {
    const cost = this.form.get('unitCost')?.value || 0;
    const factor = this.form.get('conversionFactor')?.value || 1;
    const recipeCost = factor > 0 ? cost / factor : 0;
    this.form.get('recipeCost')?.setValue(Math.round(recipeCost * 100) / 100);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const value = { ...this.form.getRawValue() };
      this.dialogRef.close(value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
