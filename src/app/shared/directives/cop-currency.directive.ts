import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: 'input[appCopCurrency]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CopCurrencyDirective),
      multi: true
    }
  ]
})
export class CopCurrencyDirective implements ControlValueAccessor {
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const numeric = this.parseToNumber(value);
    this.onChange(numeric);
    this.el.nativeElement.value = this.formatCOP(numeric);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    const numeric = this.parseToNumber(this.el.nativeElement.value);
    this.el.nativeElement.value = this.formatCOP(numeric);
  }

  @HostListener('focus')
  onFocus(): void {
    const numeric = this.parseToNumber(this.el.nativeElement.value);
    if (numeric === 0) {
      this.el.nativeElement.value = '';
    }
  }

  writeValue(value: number | null): void {
    this.el.nativeElement.value = this.formatCOP(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private parseToNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  private formatCOP(value: number): string {
    if (!value && value !== 0) return '';
    if (value === 0) return '0';
    return new Intl.NumberFormat('es-CO').format(value);
  }
}
