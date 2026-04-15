import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product, PRODUCT_TYPES } from '../../../models/producto.model';

@Component({
  selector: 'app-producto-form',
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
  ],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent {
  form: FormGroup;
  isEdit: boolean;
  productTypes = PRODUCT_TYPES;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      type: [data?.type || '', Validators.required],
      heightCm: [data?.heightCm || 0, [Validators.required, Validators.min(0.1)]],
      lengthCm: [data?.lengthCm || 0, [Validators.required, Validators.min(0.1)]],
      widthCm: [data?.widthCm || 0, [Validators.required, Validators.min(0.1)]],
      unitsPerBatch: [data?.unitsPerBatch || 1, [Validators.required, Validators.min(1)]],
      recipe: [data?.recipe || []],
      productionCost: [data?.productionCost || 0],
      unitCost: [data?.unitCost || 0],
      stock: [data?.stock || 0],
      active: [data?.active ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
