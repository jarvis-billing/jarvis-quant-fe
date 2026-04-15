import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Supplier, SUPPLIER_DOCUMENT_TYPES } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-form',
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
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon class="text-primary-500">{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
      {{ isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-3 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Nombre / Razón Social</mat-label>
          <input matInput formControlName="name" placeholder="Ej: Cementos del Norte S.A.S.">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Tipo Documento</mat-label>
            <mat-select formControlName="documentType">
              @for (dt of documentTypes; track dt) {
                <mat-option [value]="dt">{{ dt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Número Documento</mat-label>
            <input matInput formControlName="documentNumber">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Persona de Contacto</mat-label>
          <input matInput formControlName="contactName">
        </mat-form-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="address">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ciudad</mat-label>
          <input matInput formControlName="city">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Notas</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-2">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">
        {{ isEdit ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `
})
export class SupplierFormComponent {
  form: FormGroup;
  isEdit: boolean;
  documentTypes = SUPPLIER_DOCUMENT_TYPES;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplierFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', Validators.required],
      documentType: [data?.documentType || 'NIT'],
      documentNumber: [data?.documentNumber || '', Validators.required],
      contactName: [data?.contactName || ''],
      phone: [data?.phone || ''],
      email: [data?.email || ''],
      address: [data?.address || ''],
      city: [data?.city || ''],
      notes: [data?.notes || ''],
      active: [data?.active ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
