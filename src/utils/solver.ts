import { ContainerData } from '../types/game';

// State representation for BFS solver: array of arrays of color strings
export interface SolverState {
  containers: string[][];
  capacity: number;
}

export interface SolverMove {
  fromIndex: number;
  toIndex: number;
}

export function isStateSolved(state: string[][], capacity: number): boolean {
  for (const container of state) {
    if (container.length === 0) continue;
    if (container.length !== capacity) return false;
    const first = container[0];
    for (let i = 1; i < container.length; i++) {
      if (container[i] !== first) return false;
    }
  }
  return true;
}

export function isValidMove(
  state: string[][],
  fromIdx: number,
  toIdx: number,
  capacity: number,
  lockedIndices: Set<number> = new Set()
): boolean {
  if (fromIdx === toIdx) return false;
  if (lockedIndices.has(fromIdx) || lockedIndices.has(toIdx)) return false;

  const src = state[fromIdx];
  const dest = state[toIdx];

  if (!src || src.length === 0) return false;
  if (!dest || dest.length >= capacity) return false;

  const topSrc = src[src.length - 1];

  // If destination is empty, it's valid (unless source is already a uniform full tube to prevent meaningless moves)
  if (dest.length === 0) {
    // Avoid moving from a full pure tube into an empty one
    if (src.length === capacity && src.every((c) => c === topSrc)) {
      return false;
    }
    return true;
  }

  const topDest = dest[dest.length - 1];
  return topSrc === topDest;
}

// Generate state key for memoization
function stateToKey(state: string[][]): string {
  return state.map((c) => c.join(',')).sort().join('|');
}

// Breadth-First Search to find shortest path to solution and get next optimal move
export function findBestMove(
  containers: ContainerData[],
  capacity: number,
  maxSearchDepth: number = 2500
): SolverMove | null {
  const locked = new Set<number>();
  containers.forEach((c, idx) => {
    if (c.isLocked && (c.lockMovesRemaining ?? 0) > 0) {
      locked.add(idx);
    }
  });

  const initialState: string[][] = containers.map((c) => [...c.items]);

  if (isStateSolved(initialState, capacity)) {
    return null;
  }

  interface QueueNode {
    state: string[][];
    firstMove: SolverMove | null;
  }

  const queue: QueueNode[] = [{ state: initialState, firstMove: null }];
  const visited = new Set<string>();
  visited.add(stateToKey(initialState));

  let iterations = 0;

  while (queue.length > 0 && iterations < maxSearchDepth) {
    iterations++;
    const current = queue.shift()!;

    if (isStateSolved(current.state, capacity)) {
      return current.firstMove;
    }

    const n = current.state.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (isValidMove(current.state, i, j, capacity, locked)) {
          // Perform move
          const nextState = current.state.map((arr) => [...arr]);
          const item = nextState[i].pop()!;
          nextState[j].push(item);

          const key = stateToKey(nextState);
          if (!visited.has(key)) {
            visited.add(key);
            const move: SolverMove = { fromIndex: i, toIndex: j };
            queue.push({
              state: nextState,
              firstMove: current.firstMove === null ? move : current.firstMove,
            });
          }
        }
      }
    }
  }

  // Fallback: Return any immediately valid constructive move
  for (let i = 0; i < containers.length; i++) {
    for (let j = 0; j < containers.length; j++) {
      if (isValidMove(initialState, i, j, capacity, locked)) {
        return { fromIndex: i, toIndex: j };
      }
    }
  }

  return null;
}
