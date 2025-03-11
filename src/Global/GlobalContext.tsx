import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { INITIAL_GLOBAL_STATE } from './initializeGlobalState';

// Export GlobalState type for use in other components
export type GlobalState = typeof INITIAL_GLOBAL_STATE;
// Action type for reducer
type Action = { type: string; payload?: any };

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);
const GlobalDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'SET_GLOBAL':
      return { ...state, ...action.payload };
    case 'SET_ITEM_STORE':
      return { 
        ...state, 
        itemStore: { ...state.itemStore, ...action.payload }
      };
    case 'SET_DRAW_ORDER':
      return {
        ...state,
        drawOrder: action.payload
      };
    case 'SET_SELECTED_ITEMS':
      return {
        ...state,
        selected_items: action.payload
      };
    // Add other action types as needed
    default:
      return state;
  }
}

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, INITIAL_GLOBAL_STATE);
  
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
}

export function useGlobalDispatch() {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a GlobalProvider');
  }
  return context;
}

// Helper function to set global state (similar to reactn's setGlobal)
export function setGlobal(updates: Partial<GlobalState>) {
  const dispatch = useGlobalDispatch();
  dispatch({ type: 'SET_GLOBAL', payload: updates });
}

// Helper function to get global state (similar to reactn's getGlobal)
export function getGlobal(): GlobalState {
  return useGlobalState();
}

// Helper function to update specific parts of the state
export function updateGlobal<K extends keyof GlobalState>(
  key: K, 
  value: GlobalState[K]
) {
  const dispatch = useGlobalDispatch();
  dispatch({ 
    type: 'SET_GLOBAL', 
    payload: { [key]: value } 
  });
}

// Helper function to update itemStore
export function updateItemStore(updates: Partial<GlobalState['itemStore']>) {
  const dispatch = useGlobalDispatch();
  dispatch({ type: 'SET_ITEM_STORE', payload: updates });
}

// Helper function to update drawOrder
export function updateDrawOrder(drawOrder: GlobalState['drawOrder']) {
  const dispatch = useGlobalDispatch();
  dispatch({ type: 'SET_DRAW_ORDER', payload: drawOrder });
}

// Helper function to update selected items
export function updateSelectedItems(selectedItems: GlobalState['selected_items']) {
  const dispatch = useGlobalDispatch();
  dispatch({ type: 'SET_SELECTED_ITEMS', payload: selectedItems });
}
