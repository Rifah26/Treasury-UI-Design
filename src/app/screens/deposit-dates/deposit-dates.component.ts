import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { DealFormService } from '../../services/deal-form.service';

@Component({
  selector: 'app-deposit-dates',
  templateUrl: './deposit-dates.component.html',
  styleUrls: ['./deposit-dates.component.scss'],
})
export class DepositDatesComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public svc: DealFormService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.svc.depositDatesForm;

    // Auto-persist on changes
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
    ).subscribe(() => this.svc.persist());

    // Auto-calculate maturity date from value date + deposit period
    this.form.get('depositPeriod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalcMaturity());

    this.form.get('valueDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalcMaturity());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Deposit type toggle ───────────────────────────────────────────────────

  get isCall(): boolean { return this.svc.isCallDeposit; }

  setDepositType(type: 'Call' | 'Term'): void {
    this.form.get('depositType')?.setValue(type);
  }

  // ── Amount formatting ─────────────────────────────────────────────────────

  get formattedAmount(): string {
    const raw = this.form.get('amount')?.value ?? '';
    const num = parseFloat(raw.toString().replace(/,/g, ''));
    if (isNaN(num)) return raw;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onAmountInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/,/g, '');
    if (/^\d*\.?\d*$/.test(raw)) {
      this.form.get('amount')?.setValue(raw, { emitEvent: true });
    }
  }

  get currencyCode(): string {
    return this.form.get('currency')?.value || '—';
  }

  // ── Maturity auto-calc ────────────────────────────────────────────────────

  private recalcMaturity(): void {
    if (this.isCall) return;
    const period    = this.form.get('depositPeriod')?.value ?? '';
    const valueDate = this.form.get('valueDate')?.value;
    const days      = this.parsePeriodToDays(period);
    if (days && valueDate) {
      const d = new Date(valueDate);
      d.setDate(d.getDate() + days);
      this.form.get('maturityDate')?.setValue(d.toISOString().slice(0, 10));
    }
  }

  private parsePeriodToDays(period: string): number | null {
    const m = period.match(/^(\d+)\s*(day|days|d|month|months|m|year|years|y)/i);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    if (u.startsWith('d')) return n;
    if (u.startsWith('m')) return n * 30;
    if (u.startsWith('y')) return n * 365;
    return null;
  }

  get periodDays(): number | null {
    return this.parsePeriodToDays(this.form.get('depositPeriod')?.value ?? '');
  }

  get maturityDaysFromValue(): number | null {
    const v = this.form.get('valueDate')?.value;
    const m = this.form.get('maturityDate')?.value;
    if (!v || !m) return null;
    return Math.round((new Date(m).getTime() - new Date(v).getTime()) / 86400000);
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  onNext(): void {
    if (this.svc.validateStep(2)) {
      this.svc.persist();
      this.router.navigate(['/deal/interest']);
    }
  }

  get step1Complete(): boolean { return this.svc.isStep1Complete(); }
  get step2Complete(): boolean { return this.svc.isStep2Complete(); }
}
