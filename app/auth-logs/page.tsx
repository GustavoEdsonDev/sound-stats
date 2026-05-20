'use client';

import { useEffect, useState } from 'react';
import { 
  getAuthLogs, 
  clearAuthLogs, 
  exportAuthLogs,
  exportAuthLogsAsCSV,
  getAuthLogsSummary,
  type AuthLogEntry 
} from '@/utils/authLogger';

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<AuthLogEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const loadLogs = () => {
      const allLogs = getAuthLogs();
      setLogs(allLogs);
      setSummary(getAuthLogsSummary());
    };

    loadLogs();

    // Atualizar a cada 5 segundos
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(
    log => !filter || log.event.includes(filter) || log.message.includes(filter)
  );

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      clearAuthLogs();
      setLogs([]);
      setSummary(null);
    }
  };

  const handleExportJSON = () => {
    const json = exportAuthLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${new Date().toISOString()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csv = exportAuthLogsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getEventBadgeColor = (event: string) => {
    const colors: Record<string, string> = {
      LOGIN_SUCCESS: 'bg-green-100 text-green-800',
      LOGIN_START: 'bg-blue-100 text-blue-800',
      LOGIN_FAILED: 'bg-red-100 text-red-800',
      LOGOUT: 'bg-amber-100 text-amber-800',
      TOKEN_EXPIRED: 'bg-red-100 text-red-800',
      TOKEN_REFRESH_START: 'bg-purple-100 text-purple-800',
      TOKEN_REFRESH_SUCCESS: 'bg-green-100 text-green-800',
      TOKEN_REFRESH_FAILED: 'bg-red-100 text-red-800',
      SESSION_RESTORED: 'bg-green-100 text-green-800',
      AUTH_ERROR: 'bg-red-100 text-red-800',
      COOKIE_CLEARED: 'bg-amber-100 text-amber-800',
    };
    return colors[event] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📋 Logs de Autenticação</h1>

        {/* Resumo */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Total de Eventos</div>
              <div className="text-3xl font-bold">{summary.total}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Logins</div>
              <div className="text-3xl font-bold text-green-600">
                {summary.events.LOGIN_SUCCESS || 0}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Logouts</div>
              <div className="text-3xl font-bold text-amber-600">
                {summary.events.LOGOUT || 0}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm">Erros</div>
              <div className="text-3xl font-bold text-red-600">
                {(summary.events.LOGIN_FAILED || 0) + 
                 (summary.events.TOKEN_EXPIRED || 0) +
                 (summary.events.AUTH_ERROR || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filtrar Logs</label>
              <input
                type="text"
                placeholder="Procurar por evento, mensagem ou usuário..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                📥 JSON
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                📥 CSV
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum log de autenticação encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Horário</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Evento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Mensagem</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Usuário</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-3 text-sm whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEventBadgeColor(
                            log.event
                          )}`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">{log.message}</td>
                      <td className="px-6 py-3 text-sm">
                        {log.userId ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {log.userId.slice(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:underline">
                              Ver detalhes
                            </summary>
                            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Informações</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Os logs são armazenados no navegador (localStorage)</li>
            <li>• Os últimos 100 eventos são mantidos</li>
            <li>• Os logs são atualizados automaticamente a cada 5 segundos</li>
            <li>• Use as opções de exportação para análise em ferramentas externas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
