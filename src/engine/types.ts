export type StageId = 'stage-00-intro' | 'stage-01-simulator' | 'stage-02-predictor' | 'stage-03-reality';

export type ExecutionStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'halted'
  | 'non_terminating'
  | 'out_of_gas';

export interface TraceEntry {
  step: number;
  timeLabel: string;
  instructionType: string;
  instructionLabel: string;
  variableSnapshot: Record<string, number>;
  activeNodeId: string;
  note?: string;
}

export type Instruction =
  | { id: string; type: 'SET'; variable: string; value: number; next: string; label: string }
  | { id: string; type: 'INCREMENT'; variable: string; next: string; label: string }
  | { id: string; type: 'DECREMENT'; variable: string; next: string; label: string }
  | { 
      id: string; 
      type: 'CHECK'; 
      variable: string; 
      op: '<' | '<=' | '==' | '!=' | '>'; 
      threshold: number; 
      onTrue: string; 
      onFalse: string; 
      label: string;
    }
  | { id: string; type: 'JUMP'; target: string; label: string }
  | { id: string; type: 'HALT'; label: string };

export interface ProgramGraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'start' | 'init' | 'check' | 'mutate' | 'halt' | 'loop';
  x: number;
  y: number;
}

export interface ProgramGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'condition-true' | 'condition-false' | 'loopback';
}

export interface ProgramDefinition {
  id: 'finite-counter' | 'infinite-loop' | 'input-dependent';
  name: string;
  shortTag: string;
  description: string;
  theoreticalBehavior: 'terminating' | 'non-terminating' | 'input-dependent';
  expectedSteps?: number;
  entryNodeId: string;
  instructions: Record<string, Instruction>;
  nodes: ProgramGraphNode[];
  edges: ProgramGraphEdge[];
  initialVariables: Record<string, number>;
}
