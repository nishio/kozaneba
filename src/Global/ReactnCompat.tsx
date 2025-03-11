/**
 * Reactn Compatibility Layer
 * 
 * This file provides compatibility utilities to ease migration from reactn to React Context API.
 * It allows for gradual migration by providing API-compatible functions that use the new Context API.
 */

import React, { useEffect, useState } from 'react';
import { 
  useGlobalState, 
  useGlobalDispatch, 
  GlobalProvider 
} from './GlobalContext';
import { INITIAL_GLOBAL_STATE } from './initializeGlobalState';

// Type definitions
type GlobalState = typeof INITIAL_GLOBAL_STATE;
type Reducer<S, A> = (prevState: S, action: A) => S;

// Global state reference for non-hook contexts
let globalStateRef: GlobalState = { ...INITIAL_GLOBAL_STATE };
let globalDispatchRef: React.Dispatch<any> | null = null;

// GlobalStateManager component to keep the ref updated
// Export GlobalProvider and hooks from the module
export { GlobalProvider, useGlobalState, useGlobalDispatch } from './GlobalContext';

export const GlobalStateManager: React.FC = () => {
  const state = useGlobalState();
  const dispatch = useGlobalDispatch();
  
  useEffect(() => {
    globalStateRef = state;
    globalDispatchRef = dispatch;
  }, [state, dispatch]);
  
  return null;
};

// Wrap the app with both providers
export const withGlobal = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <GlobalProvider>
      <GlobalStateManager />
      <Component {...props} />
    </GlobalProvider>
  );
};

// Compatibility with reactn's useGlobal hook
export function useGlobal<K extends keyof GlobalState>(
  key?: K
): [K extends undefined ? GlobalState : GlobalState[K], (value: any) => void] {
  const state = useGlobalState();
  const dispatch = useGlobalDispatch();
  
  const setValue = (value: any) => {
    if (key !== undefined) {
      dispatch({ 
        type: 'SET_GLOBAL', 
        payload: { [key as string]: value } 
      });
    } else {
      dispatch({ type: 'SET_GLOBAL', payload: value });
    }
  };
  
  if (key !== undefined) {
    return [state[key] as any, setValue];
  }
  
  return [state as any, setValue];
}

// Compatibility with reactn's getGlobal function
export function getGlobal(): GlobalState {
  return globalStateRef;
}

// Compatibility with reactn's setGlobal function
export function setGlobal(updates: Partial<GlobalState>): Promise<GlobalState> {
  if (globalDispatchRef) {
    globalDispatchRef({ type: 'SET_GLOBAL', payload: updates });
    return Promise.resolve({ ...globalStateRef, ...updates });
  }
  return Promise.reject(new Error('Global dispatch not available'));
}

// Compatibility with reactn's addReducer function
export function addReducer<A>(
  name: string,
  reducer: Reducer<GlobalState, A>
): void {
  // This is a simplified implementation
  // In a real app, you would need to register the reducer with your reducer system
  console.warn(`addReducer('${name}') is deprecated. Use custom hooks instead.`);
}

// Compatibility with reactn's useDispatch hook
export function useDispatch<A>(
  reducerName: string
): (action: A) => Promise<GlobalState> {
  const dispatch = useGlobalDispatch();
  
  return (action: A) => {
    console.warn(`useDispatch('${reducerName}') is deprecated. Use custom hooks instead.`);
    dispatch({ type: reducerName, payload: action });
    return Promise.resolve(globalStateRef);
  };
}

// HOC to provide global state to class components
export function withGlobalState<P extends object>(
  Component: React.ComponentType<P & { global: GlobalState }>
): React.FC<P> {
  return (props: P) => {
    const globalState = useGlobalState();
    return <Component {...props} global={globalState} />;
  };
}

// HOC to provide setGlobal to class components
export function withSetGlobal<P extends object>(
  Component: React.ComponentType<P & { setGlobal: typeof setGlobal }>
): React.FC<P> {
  return (props: P) => {
    const dispatch = useGlobalDispatch();
    
    const setGlobalFn = (updates: Partial<GlobalState>): Promise<GlobalState> => {
      dispatch({ type: 'SET_GLOBAL', payload: updates });
      return Promise.resolve({ ...globalStateRef, ...updates });
    };
    
    return <Component {...props} setGlobal={setGlobalFn} />;
  };
}

// Compatibility with reactn's resetGlobal function
export function resetGlobal(): Promise<GlobalState> {
  return setGlobal(INITIAL_GLOBAL_STATE);
}
