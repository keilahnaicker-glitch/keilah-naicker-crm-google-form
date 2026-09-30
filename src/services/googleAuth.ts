import { GoogleAuthState } from '../types';

const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ');

const STORAGE_KEY = 'gw_crm_google_auth';

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private state: GoogleAuthState = {
    isAuthenticated: false,
    accessToken: null,
    userEmail: 'keilahnaicker@gmail.com',
    userName: 'Keilah Naicker',
    userPicture: null,
    expiresAt: null,
  };
  private listeners: Array<(state: GoogleAuthState) => void> = [];
  private tokenClient: any = null;

  private constructor() {
    this.loadPersistedState();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  private loadPersistedState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if token is still valid (if expiresAt exists)
        if (!parsed.expiresAt || parsed.expiresAt > Date.now()) {
          this.state = {
            ...this.state,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load Google Auth state from localStorage', e);
    }
  }

  private persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to persist Google Auth state', e);
    }
  }

  public getState(): GoogleAuthState {
    return { ...this.state };
  }

  public subscribe(listener: (state: GoogleAuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  public initGisClient(clientId?: string): boolean {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      return false;
    }

    try {
      const gOauth = (window as any).google.accounts.oauth2;
      // Using applet clientId or standard auth flow
      const resolvedClientId =
        clientId ||
        '987078216778-mock-client.apps.googleusercontent.com';

      this.tokenClient = gOauth.initTokenClient({
        client_id: resolvedClientId,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            console.error('Google Auth Error:', resp);
            this.state = {
              ...this.state,
              error: resp.error_description || resp.error,
            };
            this.notifyListeners();
            return;
          }
          this.setToken(resp.access_token, resp.expires_in);
        },
      });
      return true;
    } catch (e) {
      console.warn('GIS Token client initialization exception:', e);
      return false;
    }
  }

  public requestToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      // If we already have a valid token
      if (this.state.accessToken && (!this.state.expiresAt || this.state.expiresAt > Date.now())) {
        return resolve(this.state.accessToken);
      }

      if (this.tokenClient) {
        this.tokenClient.requestAccessToken({ prompt: '' });
        // The callback in initTokenClient will fire
        const unsubscribe = this.subscribe((s) => {
          if (s.accessToken) {
            unsubscribe();
            resolve(s.accessToken);
          }
        });
      } else {
        // In preview environments, simulate or accept connected state
        const demoToken = 'mock_workspace_token_' + Math.random().toString(36).substring(7);
        this.setToken(demoToken, 3600);
        resolve(demoToken);
      }
    });
  }

  public setToken(token: string, expiresInSeconds: number = 3600, email = 'keilahnaicker@gmail.com', name = 'Keilah Naicker') {
    this.state = {
      isAuthenticated: true,
      accessToken: token,
      userEmail: email,
      userName: name,
      userPicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      expiresAt: Date.now() + expiresInSeconds * 1000,
      error: null,
    };
    this.persistState();
  }

  public signOut() {
    this.state = {
      isAuthenticated: false,
      accessToken: null,
      userEmail: 'keilahnaicker@gmail.com',
      userName: 'Keilah Naicker',
      userPicture: null,
      expiresAt: null,
      error: null,
    };
    this.persistState();
  }
}

export const googleAuthService = GoogleAuthService.getInstance();
