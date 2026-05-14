/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestItem {
  id: string;
  name: string;
  reagentCost: number;
  consumablesCost: number;
  laborCost: number;
  machineDepreciation: number;
  qcCost: number;
  otherCosts: number;
  testsPerMonth: number;
  sellingPrice: number;
}

export interface FixedCosts {
  rent: number;
  staff: number;
  utilities: number;
  marketing: number;
  other: number;
}

export interface CRMParams {
  returningRate: number; // 0 to 100
  visitsPerYear: number;
  targetMargin: number; // 0 to 100
}

export interface ReinvestmentItem {
  id: string;
  name: string;
  amount: number;
}

export interface AppData {
  tests: TestItem[];
  fixedCosts: FixedCosts;
  crmParams: CRMParams;
  reinvestments: ReinvestmentItem[];
  targetProfit?: number;
  customGoals?: Record<string, number>;
}
