import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DealFormService } from '../../services/deal-form.service';
import { Deal } from '../../models/deal-form.model';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal-list.component.html',
})
export class DealListComponent implements OnInit {
  deals: Deal[] = [];

  constructor(
    private svc: DealFormService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.deals = this.svc.getDeals();
  }

  newDeal(): void {
    this.svc.clearDraft();
    this.router.navigate(['/deal/basic-info']);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatAmount(deal: Deal): string {
    const amt = parseFloat(deal.depositDates.amount);
    if (isNaN(amt)) return '—';
    return `${deal.depositDates.currency} ${amt.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;
  }
}
