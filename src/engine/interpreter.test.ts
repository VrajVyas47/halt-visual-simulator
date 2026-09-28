import { describe, it, expect } from 'vitest';
import { FINITE_COUNTER_PROGRAM, INFINITE_LOOP_PROGRAM } from './programs';
import { createInitialState, executeStep } from './interpreter';

describe('Program Interpreter Simulation Engine', () => {
  it('initializes finite counter correctly at step 0', () => {
    const state = createInitialState(FINITE_COUNTER_PROGRAM);
    expect(state.step).toBe(0);
    expect(state.status).toBe('idle');
    expect(state.currentInstructionId).toBe('q0_start');
    expect(state.variables.i).toBe(0);
  });

  it('correctly executes finite counter until HALT state is reached', () => {
    let state = createInitialState(FINITE_COUNTER_PROGRAM);
    let guard = 0;
    
    while (state.status !== 'halted' && guard < 50) {
      state = executeStep(FINITE_COUNTER_PROGRAM, state);
      guard++;
    }

    expect(state.status).toBe('halted');
    expect(state.currentInstructionId).toBe('q_halt');
    expect(state.variables.i).toBe(5);
    expect(guard).toBeLessThanOrEqual(20);
  });

  it('keeps running for unbounded loop without halting', () => {
    let state = createInitialState(INFINITE_LOOP_PROGRAM);
    
    for (let step = 0; step < 25; step++) {
      state = executeStep(INFINITE_LOOP_PROGRAM, state);
      expect(state.status).toBe('running');
    }

    expect(state.status).toBe('running');
    expect(state.step).toBe(25);
    expect(state.variables.i).toBeGreaterThan(5);
  });

  it('caps trace history to prevent memory explosion during unbounded runs', () => {
    let state = createInitialState(INFINITE_LOOP_PROGRAM);
    
    for (let step = 0; step < 120; step++) {
      state = executeStep(INFINITE_LOOP_PROGRAM, state);
    }

    expect(state.trace.length).toBeLessThanOrEqual(60);
  });
});
