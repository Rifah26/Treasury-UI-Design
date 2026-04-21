import { Injectable } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Deal, BENCHMARK_RATES } from '../models/deal-form.model';

const STORAGE_KEY = 'tms_deal_draft';
const DEALS_KEY   = 'tms_deals';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}
function genDealId(): string {
  return `MM-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
}

/** Validates that currency is exactly 3 uppercase letters */
function currencyValidator(ctrl: AbstractControl): ValidationErrors | null {
  return /^[A-Z]{3}$/.test(ctrl.value ?? '') ? null : { invalidCurrency: true };
}

@Injectable({ providedIn: 'root' })
export class DealFormService {

  readonly basicInfoForm: FormGroup;
  readonly depositDatesForm: FormGroup;
  readonly interestForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.basicInfoForm    = this.buildBasicInfoForm();
    this.depositDatesForm = this.buildDepositDatesForm();
    this.interestForm     = this.buildInterestForm();
    this.hydrate();
    this.wireConditionalLogic();
  }

  // ── Form builders ─────────────────────────────────────────────────────────

  private buildBasicInfoForm(): FormGroup {
    return this.fb.group({
      dealDate:     [todayISO(), Validators.required],
      dealTime:     [{ value: nowTime(), disabled: true }],
      portfolio:    ['', Validators.required],
      dealId:       [{ value: genDealId(), disabled: true }],
      dealer:       ['', Validators.required],
      instrument:   ['', Validators.required],
      counterparty: ['', Validators.required],
      dealType:     ['', Validators.required],
      pricingType:  ['', Validators.required],
    });
  }

  private buildDepositDatesForm(): FormGroup {
    return this.fb.group({
      depositType:     ['Call', Validators.required],
      currency:        ['USD', [Validators.required, currencyValidator]],
      amount:          ['', Validators.required],
      valueDate:       [todayISO(), Validators.required],
      depositPeriod:   [''],
      maturityDate:    [{ value: '', disabled: true }],
      compoundingRule: [{ value: '', disabled: true }],
    });
  }

  private buildInterestForm(): FormGroup {
    return this.fb.group({
      rateType:        ['Fixed', Validators.required],
      // Fixed
      interestRate:    ['', Validators.required],
      interestRule:    ['', Validators.required],
      // Floating
      benchmark:       [''],
      benchmarkPeriod: [''],
      spread:          [''],
      fixingFrequency: [''],
      // Shared
      settlementFreq:  ['', Validators.required],
      rateSettingDate: [todayISO(), Validators.required],
      backStub:        [''],
      firstDayInterest:[false],
      remarks:         [''],
    });
  }

  // ── Conditional logic wiring ──────────────────────────────────────────────

  private wireConditionalLogic(): void {
    // Deposit & Dates: Call ↔ Term
    this.depositDatesForm.get('depositType')!.valueChanges.subscribe((type: string) => {
      const maturity  = this.depositDatesForm.get('maturityDate')!;
      const compound  = this.depositDatesForm.get('compoundingRule')!;
      if (type === 'Term') {
        maturity.enable();
        compound.enable();
        maturity.setValidators(Validators.required);
        compound.setValidators(Validators.required);
      } else {
        maturity.disable(); maturity.setValue('');
        compound.disable(); compound.setValue('');
        maturity.clearValidators();
        compound.clearValidators();
      }
      maturity.updateValueAndValidity();
      compound.updateValueAndValidity();
    });

    // Interest: Fixed ↔ Floating
    this.interestForm.get('rateType')!.valueChanges.subscribe((type: string) => {
      const fixedFields    = ['interestRate', 'interestRule'];
      const floatingFields = ['benchmark', 'benchmarkPeriod', 'spread', 'fixingFrequency'];

      if (type === 'Fixed') {
        fixedFields.forEach(f => {
          this.interestForm.get(f)!.setValidators(Validators.required);
          this.interestForm.get(f)!.updateValueAndValidity();
        });
        floatingFields.forEach(f => {
          this.interestForm.get(f)!.clearValidators();
          this.interestForm.get(f)!.updateValueAndValidity();
        });
      } else {
        fixedFields.forEach(f => {
          this.interestForm.get(f)!.clearValidators();
          this.interestForm.get(f)!.updateValueAndValidity();
        });
        floatingFields.forEach(f => {
          this.interestForm.get(f)!.setValidators(Validators.required);
          this.interestForm.get(f)!.updateValueAndValidity();
        });
      }
    });
  }

  // ── Computed helpers ──────────────────────────────────────────────────────

  get computedFloatingRate(): string | null {
    const f = this.interestForm.value;
    if (!f.benchmark || f.spread === '' || f.spread === null) return null;
    const base   = BENCHMARK_RATES[f.benchmark] ?? 0;
    const spread = parseFloat(f.spread) || 0;
    return (base + spread).toFixed(4);
  }

  get isCallDeposit(): boolean {
    return this.depositDatesForm.get('depositType')?.value === 'Call';
  }

  get isFixedRate(): boolean {
    return this.interestForm.get('rateType')?.value === 'Fixed';
  }

  // ── Step completion status ────────────────────────────────────────────────

  isStep1Complete(): boolean { return this.basicInfoForm.valid; }
  isStep2Complete(): boolean { return this.depositDatesForm.valid; }
  isStep3Complete(): boolean { return this.interestForm.valid; }

  validateStep(step: 1 | 2 | 3): boolean {
    const form = step === 1 ? this.basicInfoForm
               : step === 2 ? this.depositDatesForm
               : this.interestForm;
    form.markAllAsTouched();
    return form.valid;
  }

  validateAll(): boolean {
    this.basicInfoForm.markAllAsTouched();
    this.depositDatesForm.markAllAsTouched();
    this.interestForm.markAllAsTouched();
    return this.basicInfoForm.valid &&
           this.depositDatesForm.valid &&
           this.interestForm.valid;
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  persist(): void {
    const draft = {
      basicInfo:    this.basicInfoForm.getRawValue(),
      depositDates: this.depositDatesForm.getRawValue(),
      interest:     this.interestForm.getRawValue(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.basicInfo)    this.basicInfoForm.patchValue(draft.basicInfo);
      if (draft.depositDates) this.depositDatesForm.patchValue(draft.depositDates);
      if (draft.interest)     this.interestForm.patchValue(draft.interest);
    } catch { /* ignore corrupt data */ }
  }

  clearDraft(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.basicInfoForm.reset();
    this.depositDatesForm.reset({ depositType: 'Call', currency: 'USD' });
    this.interestForm.reset({ rateType: 'Fixed', firstDayInterest: false });
  }

  // ── Save to deal list ─────────────────────────────────────────────────────

  saveOnHold(): string {
    return this.saveDeal('On Hold');
  }

  saveAndRelease(): string {
    return this.saveDeal('Released');
  }

  private saveDeal(status: 'On Hold' | 'Released'): string {
    const deal: Deal = {
      id:          this.basicInfoForm.getRawValue().dealId,
      status,
      createdAt:   new Date().toISOString(),
      basicInfo:   this.basicInfoForm.getRawValue(),
      depositDates:this.depositDatesForm.getRawValue(),
      interest:    this.interestForm.getRawValue(),
    };
    const existing: Deal[] = JSON.parse(localStorage.getItem(DEALS_KEY) ?? '[]');
    existing.unshift(deal);
    localStorage.setItem(DEALS_KEY, JSON.stringify(existing));
    this.clearDraft();
    return deal.id;
  }

  getDeals(): Deal[] {
    return JSON.parse(localStorage.getItem(DEALS_KEY) ?? '[]');
  }
}
