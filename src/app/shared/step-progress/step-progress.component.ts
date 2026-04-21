import { Component, Input } from '@angular/core';

export interface StepConfig {
  label: string;
  sublabel: string;
  route: string;
}

export type StepState = 'done' | 'active' | 'pending';

@Component({
  selector: 'app-step-progress',
  templateUrl: './step-progress.component.html',
})
export class StepProgressComponent {
  @Input() currentStep: 1 | 2 | 3 = 1;
  @Input() step1Complete = false;
  @Input() step2Complete = false;

  readonly steps: StepConfig[] = [
    { label: 'Basic Information',  sublabel: 'Deal details & counterparty',    route: '/deal/basic-info' },
    { label: 'Deposit & Dates',    sublabel: 'Amount, maturity & settlement',  route: '/deal/deposit-dates' },
    { label: 'Interest',           sublabel: 'Rate, accrual & payment',        route: '/deal/interest' },
  ];

  stateOf(index: number): StepState {
    const stepNum = index + 1;
    if (stepNum < this.currentStep) return 'done';
    if (stepNum === this.currentStep) return 'active';
    return 'pending';
  }

  isConnectorDone(index: number): boolean {
    // connector after step `index+1` is done if currentStep is past it
    return this.currentStep > index + 1;
  }

  canNavigate(index: number): boolean {
    const stepNum = index + 1;
    if (stepNum === 1) return true;
    if (stepNum === 2) return this.step1Complete;
    if (stepNum === 3) return this.step1Complete && this.step2Complete;
    return false;
  }
}
