import type { ProgramDefinition, ExecutionStatus, TraceEntry } from './types';

export interface ExecutionState {
  programId: string;
  step: number;
  currentInstructionId: string;
  variables: Record<string, number>;
  status: ExecutionStatus;
  trace: TraceEntry[];
  activeEdgeId?: string;
}

export function createInitialState(program: ProgramDefinition): ExecutionState {
  const initialVars = { ...program.initialVariables };
  const initialTrace: TraceEntry = {
    step: 0,
    timeLabel: 'T+0',
    instructionType: 'ENTRY',
    instructionLabel: `INIT_CALL [${program.shortTag}]`,
    variableSnapshot: { ...initialVars },
    activeNodeId: program.entryNodeId,
    note: 'Execution head positioned at entry node',
  };

  return {
    programId: program.id,
    step: 0,
    currentInstructionId: program.entryNodeId,
    variables: initialVars,
    status: 'idle',
    trace: [initialTrace],
  };
}

export function executeStep(
  program: ProgramDefinition,
  state: ExecutionState
): ExecutionState {
  if (state.status === 'halted') {
    return state;
  }

  const instruction = program.instructions[state.currentInstructionId];
  if (!instruction) {
    return {
      ...state,
      status: 'halted',
    };
  }

  const newStep = state.step + 1;
  const newVariables = { ...state.variables };
  let nextNodeId = state.currentInstructionId;
  let activeEdgeId: string | undefined = undefined;
  let newStatus: ExecutionStatus = 'running';
  let note: string | undefined = undefined;

  switch (instruction.type) {
    case 'SET': {
      newVariables[instruction.variable] = instruction.value;
      nextNodeId = instruction.next;
      activeEdgeId = program.edges.find(
        (e) => e.source === instruction.id && e.target === nextNodeId
      )?.id;
      note = `${instruction.variable} = ${instruction.value}`;
      break;
    }
    case 'INCREMENT': {
      const prev = newVariables[instruction.variable] ?? 0;
      newVariables[instruction.variable] = prev + 1;
      nextNodeId = instruction.next;
      activeEdgeId = program.edges.find(
        (e) => e.source === instruction.id && e.target === nextNodeId
      )?.id;
      note = `${instruction.variable} incremented to ${newVariables[instruction.variable]}`;
      break;
    }
    case 'DECREMENT': {
      const prev = newVariables[instruction.variable] ?? 0;
      newVariables[instruction.variable] = prev - 1;
      nextNodeId = instruction.next;
      activeEdgeId = program.edges.find(
        (e) => e.source === instruction.id && e.target === nextNodeId
      )?.id;
      note = `${instruction.variable} decremented to ${newVariables[instruction.variable]}`;
      break;
    }
    case 'CHECK': {
      const val = newVariables[instruction.variable] ?? 0;
      let conditionMet = false;
      if (instruction.op === '<') conditionMet = val < instruction.threshold;
      else if (instruction.op === '<=') conditionMet = val <= instruction.threshold;
      else if (instruction.op === '==') conditionMet = val === instruction.threshold;
      else if (instruction.op === '!=') conditionMet = val !== instruction.threshold;
      else if (instruction.op === '>') conditionMet = val > instruction.threshold;

      if (conditionMet) {
        nextNodeId = instruction.onTrue;
        activeEdgeId = program.edges.find(
          (e) => e.source === instruction.id && e.target === nextNodeId
        )?.id;
        note = `Condition TRUE: ${instruction.variable} (${val}) ${instruction.op} ${instruction.threshold}`;
      } else {
        nextNodeId = instruction.onFalse;
        activeEdgeId = program.edges.find(
          (e) => e.source === instruction.id && e.target === nextNodeId
        )?.id;
        note = `Condition FALSE: ${instruction.variable} (${val}) ${instruction.op} ${instruction.threshold}`;
      }
      break;
    }
    case 'JUMP': {
      nextNodeId = instruction.target;
      activeEdgeId = program.edges.find(
        (e) => e.source === instruction.id && e.target === nextNodeId
      )?.id;
      note = `Branch jump to node ${nextNodeId}`;
      break;
    }
    case 'HALT': {
      newStatus = 'halted';
      note = `Terminal state reached. Program halts cleanly.`;
      break;
    }
  }

  // If next node is HALT instruction, check if it halts immediately
  if (newStatus !== 'halted') {
    const nextInstruction = program.instructions[nextNodeId];
    if (nextInstruction?.type === 'HALT') {
      newStatus = 'halted';
    }
  }

  const newTraceEntry: TraceEntry = {
    step: newStep,
    timeLabel: `T+${newStep}`,
    instructionType: instruction.type,
    instructionLabel: instruction.label,
    variableSnapshot: { ...newVariables },
    activeNodeId: nextNodeId,
    note,
  };

  // Keep up to 60 most recent trace entries to prevent memory overflow during infinite runs
  const updatedTrace = [...state.trace, newTraceEntry];
  const cappedTrace = updatedTrace.length > 60 ? updatedTrace.slice(updatedTrace.length - 60) : updatedTrace;

  return {
    programId: program.id,
    step: newStep,
    currentInstructionId: nextNodeId,
    variables: newVariables,
    status: newStatus,
    trace: cappedTrace,
    activeEdgeId,
  };
}
