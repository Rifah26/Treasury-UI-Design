import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { DealFormService } from '../../services/deal-form.service';
import {
  PORTFOLIOS, DEALERS, INSTRUMENTS, COUNTERPARTIES
} from '../../models/deal-form.model';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  readonly portfolios   = PORTFOLIOS;
  readonly dealers      = DEALERS;
  readonly instruments  = INSTRUMENTS;
  readonly counterparties = COUNTERPARTIES;

  // Counterparty search state
  cpyQuery     = '';
  cpyOpen      = false;
  cpyFiltered  = this.counterparties;
  cpySelected: typeof COUNTERPARTIES[0] | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private svc: DealFormService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.svc.basicInfoForm;

    // Restore counterparty display if value already set
    const cpyId = this.form.get('counterparty')?.value;
    if (cpyId) {
      this.cpySelected = this.counterparties.find(c => c.id === cpyId) ?? null;
      if (this.cpySelected) this.cpyQuery = this.cpySelected.name;
    }

    // Auto-persist on changes
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
    ).subscribe(() => this.svc.persist());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Counterparty search ───────────────────────────────────────────────────

  onCpyInput(query: string): void {
    this.cpyQuery    = query;
    this.cpySelected = null;
    this.form.get('counterparty')?.setValue('');
    this.cpyFiltered = query.length >= 1
      ? this.counterparties.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase()))
      : [];
    this.cpyOpen = this.cpyFiltered.length > 0;
  }

  selectCounterparty(cpy: typeof COUNTERPARTIES[0]): void {
    this.cpySelected = cpy;
    this.cpyQuery    = cpy.name;
    this.cpyOpen     = false;
    this.form.get('counterparty')?.setValue(cpy.id);
    this.form.get('counterparty')?.markAsTouched();
  }

  clearCounterparty(): void {
    this.cpySelected = null;
    this.cpyQuery    = '';
    this.cpyOpen     = false;
    this.form.get('counterparty')?.setValue('');
  }

  closeCpyDropdown(): void {
    setTimeout(() => { this.cpyOpen = false; }, 150);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  onNext(): void {
    if (this.svc.validateStep(1)) {
      this.svc.persist();
      this.router.navigate(['/deal/deposit-dates']);
    }
  }

  get step1Complete(): boolean { return this.svc.isStep1Complete(); }
  get step2Complete(): boolean { return this.svc.isStep2Complete(); }
}
