export interface GasMeasurementPoint {
  n: number;
  gas: number;
  notes?: string;
  isAnomalous?: boolean;
}

export interface TheoreticalPoint {
  n: number;
  o1: number;
  on: number;
  on2: number;
}

export const CASE_STUDY_FIXED_GAS: GasMeasurementPoint[] = [
  { n: 10, gas: 1421, notes: 'Constant instruction overhead' },
  { n: 100, gas: 1421, notes: 'Measured cost remains identical' },
  { n: 200, gas: 1421, notes: 'Verified independent of n' },
];

export const CASE_STUDY_LINEAR_GAS: GasMeasurementPoint[] = [
  { n: 10, gas: 2550 },
  { n: 20, gas: 4480 },
  { n: 50, gas: 10270 },
  { n: 100, gas: 19920 },
  { n: 200, gas: 39220 },
  { n: 500, gas: 97120 },
];

export const CASE_STUDY_QUADRATIC_GAS: GasMeasurementPoint[] = [
  { n: 10, gas: 20904 },
  { n: 20, gas: 79744 },
  { n: 50, gas: 487864 },
  { n: 100, gas: 1940064 },
  {
    n: 200,
    gas: 2978796,
    notes: 'Anomalous: Output decoding error reported in Remix IDE',
    isAnomalous: true,
  },
];

export const CASE_STUDY_EXPENSIVE_POINT: GasMeasurementPoint = {
  n: 1000,
  gas: 193642,
  notes: 'Completed successfully (finite execution)',
};

export const THEORETICAL_GROWTH_CURVES: TheoreticalPoint[] = [
  { n: 0, o1: 10, on: 0, on2: 0 },
  { n: 10, o1: 10, on: 10, on2: 100 },
  { n: 20, o1: 10, on: 20, on2: 400 },
  { n: 50, o1: 10, on: 50, on2: 2500 },
  { n: 100, o1: 10, on: 100, on2: 10000 },
  { n: 150, o1: 10, on: 150, on2: 22500 },
  { n: 200, o1: 10, on: 200, on2: 40000 },
];

export type ComplexityClass = 'o1' | 'on' | 'on2';

export interface ComplexityCalculation {
  complexity: ComplexityClass;
  inputN: number;
  operations: number;
  estimatedGas: number;
  exceedsCeiling: boolean;
  statusLabel: string;
}

export function calculateComplexityMetrics(
  complexity: ComplexityClass,
  n: number,
  blockGasLimit: number = 10_000_000
): ComplexityCalculation {
  let operations = 1;
  let estimatedGas = 21000;

  if (complexity === 'o1') {
    operations = 1;
    estimatedGas = 1421 + 21000;
  } else if (complexity === 'on') {
    operations = n;
    // Calibrated closely to case study slope (~190 gas per iteration + base)
    estimatedGas = 21000 + n * 190;
  } else if (complexity === 'on2') {
    operations = n * n;
    // Calibrated closely to quadratic case study (~194 gas per n^2)
    estimatedGas = 21000 + n * n * 194;
  }

  const exceedsCeiling = estimatedGas > blockGasLimit;

  return {
    complexity,
    inputN: n,
    operations,
    estimatedGas,
    exceedsCeiling,
    statusLabel: exceedsCeiling ? 'EXCEEDS CEILING' : 'WITHIN BLOCK LIMIT',
  };
}
