/**
 * Logger de Autenticação
 * Registra eventos de autenticação do usuário
 */

export interface AuthLogEntry {
  timestamp: Date;
  event: AuthEvent;
  message: string;
  userId?: string;
  details?: Record<string, any>;
}

export type AuthEvent =
  | 'LOGIN_START'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REFRESH_START'
  | 'TOKEN_REFRESH_SUCCESS'
  | 'TOKEN_REFRESH_FAILED'
  | 'SESSION_RESTORED'
  | 'AUTH_ERROR'
  | 'COOKIE_CLEARED';

const AUTH_LOG_KEY = 'spotify_auth_logs';
const MAX_LOGS = 100; // Manter últimos 100 logs

/**
 * Adicionar entrada ao log
 */
export function logAuthEvent(
  event: AuthEvent,
  message: string,
  details?: Record<string, any>,
  userId?: string
): AuthLogEntry {
  const entry: AuthLogEntry = {
    timestamp: new Date(),
    event,
    message,
    userId,
    details,
  };

  // Log no console
  const color = getLogColor(event);
  console.log(
    `%c[AUTH ${event}] ${message}`,
    `color: ${color}; font-weight: bold;`,
    details || ''
  );

  // Armazenar no localStorage
  if (typeof window !== 'undefined') {
    try {
      const logs = getAuthLogs();
      logs.push(entry);
      
      // Manter apenas os últimos MAX_LOGS
      if (logs.length > MAX_LOGS) {
        logs.splice(0, logs.length - MAX_LOGS);
      }

      localStorage.setItem(AUTH_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Erro ao salvar log de autenticação:', error);
    }
  }

  return entry;
}

/**
 * Obter cor para o tipo de evento
 */
function getLogColor(event: AuthEvent): string {
  const colors: Record<AuthEvent, string> = {
    LOGIN_START: '#3b82f6', // blue
    LOGIN_SUCCESS: '#10b981', // green
    LOGIN_FAILED: '#ef4444', // red
    LOGOUT: '#f59e0b', // amber
    TOKEN_EXPIRED: '#ef4444', // red
    TOKEN_REFRESH_START: '#8b5cf6', // purple
    TOKEN_REFRESH_SUCCESS: '#10b981', // green
    TOKEN_REFRESH_FAILED: '#ef4444', // red
    SESSION_RESTORED: '#10b981', // green
    AUTH_ERROR: '#ef4444', // red
    COOKIE_CLEARED: '#f59e0b', // amber
  };

  return colors[event] || '#6b7280'; // gray padrão
}

/**
 * Obter todos os logs
 */
export function getAuthLogs(): AuthLogEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const logs = localStorage.getItem(AUTH_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    return [];
  }
}

/**
 * Limpar logs
 */
export function clearAuthLogs(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_LOG_KEY);
    console.log('%c[AUTH LOGS] Logs limpados', 'color: #6b7280; font-weight: bold;');
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
  }
}

/**
 * Exportar logs como JSON
 */
export function exportAuthLogs(): string {
  const logs = getAuthLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Exportar logs como CSV
 */
export function exportAuthLogsAsCSV(): string {
  const logs = getAuthLogs();
  
  if (logs.length === 0) {
    return 'timestamp,event,message,userId,details\n';
  }

  const header = ['timestamp', 'event', 'message', 'userId', 'details'];
  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.event,
    log.message,
    log.userId || '',
    JSON.stringify(log.details || {}),
  ]);

  return [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}

/**
 * Obter logs por evento
 */
export function getLogsByEvent(event: AuthEvent): AuthLogEntry[] {
  const logs = getAuthLogs();
  return logs.filter(log => log.event === event);
}

/**
 * Obter logs dos últimos N minutos
 */
export function getRecentLogs(minutes: number = 30): AuthLogEntry[] {
  const logs = getAuthLogs();
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return logs.filter(log => new Date(log.timestamp) > cutoff);
}

/**
 * Obter resumo dos logs
 */
export function getAuthLogsSummary() {
  const logs = getAuthLogs();

  return {
    total: logs.length,
    events: logs.reduce(
      (acc, log) => {
        acc[log.event] = (acc[log.event] || 0) + 1;
        return acc;
      },
      {} as Record<AuthEvent, number>
    ),
    lastEvent: logs[logs.length - 1] || null,
    timestamp: new Date(),
  };
}
