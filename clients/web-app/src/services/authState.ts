interface AuthState {
  userId:        string | null;
  databaseRole:  string | null;
  firebaseToken: string | null;
}

let currentAuthState: AuthState = {
  userId:        null,
  databaseRole:  null,
  firebaseToken: null,
};

type Listener = (state: AuthState) => void;
const listeners: Listener[] = [];

export const setAuthState = (state: Partial<AuthState>): void => {
  currentAuthState = { ...currentAuthState, ...state };
  listeners.forEach((l) => l(currentAuthState));
};

export const getAuthState = (): AuthState => currentAuthState;

export const subscribe = (listener: Listener): (() => void) => {
  listeners.push(listener);
  return () => listeners.splice(listeners.indexOf(listener), 1);
};

export const updateDatabaseRole  = (role: string): void  => setAuthState({ databaseRole: role });
export const updateUserId        = (userId: string): void => setAuthState({ userId });
export const updateFirebaseToken = (token: string): void => setAuthState({ firebaseToken: token });

export const clearAuthState = (): void => {
  currentAuthState = { userId: null, databaseRole: null, firebaseToken: null };
};