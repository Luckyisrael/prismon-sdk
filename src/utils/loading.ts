export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

type Subscriber = (state: LoadingState) => void;

export interface LoadingStateManager {
  getState: (key: string) => LoadingState;
  updateState: (key: string, state: Partial<LoadingState>) => void;
  subscribe: (key: string, callback: Subscriber) => () => void;
}

export const createLoadingStateManager = (): LoadingStateManager => {
  const states: Record<string, LoadingState> = {};
  const subscribers: Record<string, Subscriber[]> = {};

  const getState = (key: string): LoadingState => {
    return states[key] || { status: 'idle' };
  };

  const updateState = (key: string, state: Partial<LoadingState>) => {
    states[key] = { ...getState(key), ...state };
    (subscribers[key] || []).forEach((callback) => callback(states[key]));
  };

  const subscribe = (key: string, callback: Subscriber): (() => void) => {
    if (!subscribers[key]) {
      subscribers[key] = [];
    }
    subscribers[key].push(callback);
    return () => {
      subscribers[key] = subscribers[key].filter((cb) => cb !== callback);
    };
  };

  return {
    getState,
    updateState,
    subscribe,
  };
};