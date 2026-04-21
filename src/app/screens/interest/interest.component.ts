import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { DealFormService } from '../../services/deal-form.service';
import { BENCHMARK_RATES } from '../../models/deal-form.model';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.scss'],
})
export class InterestComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  showConfirmModal: 'hold' | 'release' | null = null;
  savedDealId = '';

  readonly benchmarkRates = BENCHMARK_RATES;
  readonly marketRate = '5.25';
  readonly marketRateDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  private destroy$ = new Subject<void>();

  constructor(
    public svc: DealFormService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.svc.interestForm;

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
    ).subscribe(() => this.svc.persist());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Rate type tab ─────────────────────────────────────────────────────────

  get isFixed(): boolean  { return this.svc.isFixedRate; }

  setRateType(type: 'Fixed' | 'Floating'): void {
    this.form.get('rateType')?.setValue(type);
  }

  // ── Floating rate calc ────────────────────────────────────────────────────

  get computedRate(): string | null {
    return this.svc.computedFloatingRate;
  }

  get benchmarkValue(): number | null {
    const b = this.form.get('benchmark')?.value;
    return b ? BENCHMARK_RATES[b] ?? null : null;
  }

  // ── Checkbox helper ───────────────────────────────────────────────────────

  toggleFirstDay(): void {
    const ctrl = this.form.get('firstDayInterest');
    ctrl?.setValue(!ctrl.value);
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ── Save actions ──────────────────────────────────────────────────────────

  onSaveOnHold(): void {
    if (this.svc.validateAll()) {
      this.showConfirmModal = 'hold';
    }
  }

  onSaveAndRelease(): void {
    if (this.svc.validateAll()) {
      this.showConfirmModal = 'release';
    }
  }

  confirmSave(): void {
    if (this.showConfirmModal === 'hold') {
      this.savedDealId = this.svc.saveOnHold();
    } else {
      this.savedDealId = this.svc.saveAndRelease();
    }
    this.showConfirmModal = null;
    this.router.navigate(['/deals']);
  }

  cancelModal(): void {
    this.showConfirmModal = null;
  }

  onClear(): void {
    const rt = this.form.get('rateType')?.value;
    this.form.reset({ rateType: rt, firstDayInterest: false });
  }

  get step1Complete(): boolean { return this.svc.isStep1Complete(); }
  get step2Complete(): boolean { return this.svc.isStep2Complete(); }
}
