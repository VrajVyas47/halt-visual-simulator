export type PredictorDecision = 'YES' | 'NO';

export interface ParadoxStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet: string;
  icon: string;
  status: 'info' | 'action' | 'contradiction';
}

export interface ParadoxEvaluation {
  decision: PredictorDecision;
  predictionLabel: string;
  predictorOutcome: 'HALTS' | 'LOOPS';
  adversaryAction: 'LOOPS_FOREVER' | 'STOPS_IMMEDIATELY';
  adversaryCode: string;
  isContradiction: true;
  booleanState: string;
  theoremVerdict: string;
  headline: string;
  explanation: string;
  steps: ParadoxStep[];
}

export function evaluateParadox(decision: PredictorDecision): ParadoxEvaluation {
  if (decision === 'YES') {
    return {
      decision: 'YES',
      predictionLabel: 'HALT PREDICTS: YES (WILL HALT)',
      predictorOutcome: 'HALTS',
      adversaryAction: 'LOOPS_FOREVER',
      adversaryCode: 'while (true) { /* loop indefinitely */ }',
      isContradiction: true,
      booleanState: 'FALSE ≠ TRUE',
      theoremVerdict: 'CONTRADICTION DETECTED',
      headline: 'PREDICTOR SAYS YES → PROGRAM LOOPS FOREVER',
      explanation:
        'The hypothetical universal decider guaranteed that PARADOX(PARADOX) would halt. In response, PARADOX immediately enters an infinite loop. The prediction is inverted and incorrect.',
      steps: [
        {
          stepNumber: 1,
          title: "PREDICTOR'S ASSERTION",
          description: 'HALT(PARADOX, PARADOX) declares: TRUE (WILL HALT).',
          codeSnippet: 'HALT(P, P) → 1 (YES)',
          icon: 'psychology',
          status: 'info',
        },
        {
          stepNumber: 2,
          title: 'ADVERSARY ACTION',
          description: 'Adversary logic inspects the result and triggers non-terminating spin.',
          codeSnippet: 'if (HALT(P, P) == YES) { while(true); }',
          icon: 'terminal',
          status: 'action',
        },
        {
          stepNumber: 3,
          title: 'LOGICAL EVALUATION',
          description: 'Machine loops indefinitely. Predictor claimed it would halt. Contradiction proven.',
          codeSnippet: 'ACTUAL: ∞ ≠ PREDICTED: HALT',
          icon: 'gavel',
          status: 'contradiction',
        },
      ],
    };
  }

  return {
    decision: 'NO',
    predictionLabel: 'HALT PREDICTS: NO (WILL LOOP)',
    predictorOutcome: 'LOOPS',
    adversaryAction: 'STOPS_IMMEDIATELY',
    adversaryCode: 'return 0; // immediate termination',
    isContradiction: true,
    booleanState: 'TRUE ≠ FALSE',
    theoremVerdict: 'CONTRADICTION DETECTED',
    headline: 'PREDICTOR SAYS NO → PROGRAM TERMINATES INSTANTLY',
    explanation:
      'The hypothetical universal decider guaranteed that PARADOX(PARADOX) would loop forever. In response, PARADOX executes an immediate halt on instruction 0. The prediction is inverted and incorrect.',
    steps: [
      {
        stepNumber: 1,
        title: "PREDICTOR'S ASSERTION",
        description: 'HALT(PARADOX, PARADOX) declares: FALSE (WILL LOOP).',
        codeSnippet: 'HALT(P, P) → 0 (NO)',
        icon: 'psychology',
        status: 'info',
      },
      {
        stepNumber: 2,
        title: 'ADVERSARY ACTION',
        description: 'Adversary logic inspects the result and triggers immediate stop instruction.',
        codeSnippet: 'else { return 0; /* HALT */ }',
        icon: 'terminal',
        status: 'action',
      },
      {
        stepNumber: 3,
        title: 'LOGICAL EVALUATION',
        description: 'Machine halts cleanly at step 0. Predictor claimed it would loop. Contradiction proven.',
        codeSnippet: 'ACTUAL: HALT ≠ PREDICTED: ∞',
        icon: 'gavel',
        status: 'contradiction',
      },
    ],
  };
}
