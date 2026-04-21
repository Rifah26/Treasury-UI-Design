export interface BasicInfoFormData {
  dealDate: string;
  dealTime: string;
  portfolio: string;
  dealId: string;
  dealer: string;
  instrument: string;
  counterparty: string;
  dealType: string;
  pricingType: string;
}

export interface DepositDatesFormData {
  depositType: 'Call' | 'Term';
  currency: string;
  amount: string;
  valueDate: string;
  depositPeriod: string;
  maturityDate: string;
  compoundingRule: string;
}

export interface InterestFormData {
  rateType: 'Fixed' | 'Floating';
  // Fixed fields
  interestRate: string;
  interestRule: string;
  settlementFreq: string;
  rateSettingDate: string;
  backStub: string;
  firstDayInterest: boolean;
  remarks: string;
  // Floating fields
  benchmark: string;
  benchmarkPeriod: string;
  spread: string;
  fixingFrequency: string;
}

export interface Deal {
  id: string;
  status: 'On Hold' | 'Released';
  createdAt: string;
  basicInfo: BasicInfoFormData;
  depositDates: DepositDatesFormData;
  interest: InterestFormData;
}

export const PORTFOLIOS = [
  { value: 'TRS-001', label: 'TRS-001 — Treasury Core' },
  { value: 'TRS-002', label: 'TRS-002 — Short-Term Liquidity' },
  { value: 'MMF-A',   label: 'MMF-A — Money Market Fund A' },
  { value: 'MMF-B',   label: 'MMF-B — Money Market Fund B' },
  { value: 'OPS-LIQ', label: 'OPS-LIQ — Operating Liquidity' },
];

export const DEALERS = [
  'Goldman Sachs Treasury',
  'JP Morgan Securities',
  'Barclays Capital',
  'Deutsche Bank AG',
  'Citigroup Global Markets',
  'Morgan Stanley & Co.',
  'Bank of America Securities',
  'HSBC Bank plc',
];

export const INSTRUMENTS = [
  'Commercial Paper (CP)',
  'Certificate of Deposit (CD)',
  'Treasury Bill (T-Bill)',
  'Repurchase Agreement (Repo)',
  'Overnight Index Swap (OIS)',
  'Federal Funds',
  'Eurodollar Deposit',
  "Banker's Acceptance (BA)",
];

export const COUNTERPARTIES = [
  { id: 'CPY-0034', name: 'JPMorgan Chase Bank N.A.',  lei: '8I5DZWZKVSZI1NUHU748' },
  { id: 'CPY-0091', name: 'Goldman Sachs Bank USA',     lei: 'KD3XUN7C6T14HNAYLU02' },
  { id: 'CPY-0112', name: 'Barclays Bank PLC',          lei: 'G5GSEF7VJP5I7OUK5573' },
  { id: 'CPY-0155', name: 'Deutsche Bank AG',           lei: '7LTWFZYICNSX8D621K86' },
  { id: 'CPY-0203', name: 'Citibank N.A.',              lei: 'E57ODZWZ7FF32TWEFA76' },
  { id: 'CPY-0244', name: 'Bank of America N.A.',       lei: '9DJT3UXIJIZJI4WCF812' },
  { id: 'CPY-0301', name: 'HSBC Bank plc',              lei: 'MP6I5ZYZBEU3UXPYFY54' },
  { id: 'CPY-0378', name: 'Wells Fargo Bank N.A.',      lei: 'PBLD0EJDB5FWOLXP3B76' },
  { id: 'CPY-0412', name: 'BNP Paribas SA',             lei: 'R0MUWSFPU8MPRO8K5P83' },
  { id: 'CPY-0503', name: 'Société Générale SA',        lei: 'O2RNE8IBXP4R0TD8PU41' },
];

export const BENCHMARK_RATES: Record<string, number> = {
  SOFR:  5.31,
  LIBOR: 5.40,
  KIBOR: 22.75,
};
