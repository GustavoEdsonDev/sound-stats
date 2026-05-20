# Guia de Logs de Autenticação

## Visão Geral

O sistema de logs de autenticação rastreia todos os eventos de autenticação do usuário, incluindo:
- ✅ Login bem-sucedido
- ✅ Logout
- ✅ Token expirado/renovado
- ✅ Erros de autenticação
- ✅ Sessão restaurada

---

## Acessando os Logs

### No Dashboard
Navegue até: `/auth-logs`

Você verá uma página com:
- 📊 Resumo estatístico (total de eventos, logins, logouts, erros)
- 🔍 Busca e filtro de logs
- 📥 Exportação em JSON/CSV
- 🗑️ Opção de limpar logs

---

## Tipos de Eventos

| Evento | Descrição | Cor |
|--------|-----------|-----|
| `LOGIN_START` | Usuário iniciou o login | 🔵 Azul |
| `LOGIN_SUCCESS` | Login bem-sucedido | 🟢 Verde |
| `LOGIN_FAILED` | Falha no login | 🔴 Vermelho |
| `LOGOUT` | Usuário desconectou | 🟠 Âmbar |
| `TOKEN_EXPIRED` | Token de acesso expirou | 🔴 Vermelho |
| `TOKEN_REFRESH_START` | Renovação de token iniciou | 🟣 Roxo |
| `TOKEN_REFRESH_SUCCESS` | Token renovado com sucesso | 🟢 Verde |
| `TOKEN_REFRESH_FAILED` | Falha na renovação | 🔴 Vermelho |
| `SESSION_RESTORED` | Sessão restaurada do armazenamento | 🟢 Verde |
| `AUTH_ERROR` | Erro de autenticação genérico | 🔴 Vermelho |
| `COOKIE_CLEARED` | Cookies removidos | 🟠 Âmbar |

---

## Usando o Logger Programaticamente

### Registrar um evento customizado

```typescript
import { logAuthEvent } from '@/utils/authLogger';

// Log simples
logAuthEvent('LOGIN_START', 'Iniciando autenticação');

// Com detalhes
logAuthEvent(
  'LOGIN_SUCCESS',
  'Usuário autenticado',
  {
    userId: 'user123',
    displayName: 'João Silva',
    expiresIn: 3600,
  },
  'user123'
);
```

### Obter logs

```typescript
import { 
  getAuthLogs,
  getLogsByEvent,
  getRecentLogs,
  getAuthLogsSummary 
} from '@/utils/authLogger';

// Todos os logs
const allLogs = getAuthLogs();

// Logs de um tipo específico
const loginLogs = getLogsByEvent('LOGIN_SUCCESS');

// Últimos 30 minutos
const recentLogs = getRecentLogs(30);

// Resumo
const summary = getAuthLogsSummary();
console.log(summary);
// {
//   total: 42,
//   events: { LOGIN_SUCCESS: 5, LOGOUT: 3, ... },
//   lastEvent: { ... },
//   timestamp: Date
// }
```

### Exportar logs

```typescript
import { exportAuthLogs, exportAuthLogsAsCSV } from '@/utils/authLogger';

// JSON
const jsonLogs = exportAuthLogs();
console.log(jsonLogs);

// CSV
const csvLogs = exportAuthLogsAsCSV();
console.log(csvLogs);
```

### Limpar logs

```typescript
import { clearAuthLogs } from '@/utils/authLogger';

clearAuthLogs(); // Limpar todos os logs
```

---

## Visualizando no Console

Abra o **DevTools** (F12) e vá para a aba **Console**. Você verá logs coloridos como:

```
[AUTH LOGIN_SUCCESS] Usuário autenticado com sucesso { userId: 'user123', ... }
[AUTH LOGOUT] Usuário desconectado { ... }
[AUTH TOKEN_EXPIRED] Token de acesso expirou { ... }
```

---

## Estrutura de um Log

```typescript
{
  timestamp: Date;           // Quando o evento ocorreu
  event: AuthEvent;          // Tipo de evento
  message: string;           // Descrição legível
  userId?: string;           // ID do usuário (se aplicável)
  details?: {                // Detalhes adicionais
    [key: string]: any;
  };
}
```

---

## Armazenamento

- **Localização**: `localStorage` (no navegador)
- **Chave**: `spotify_auth_logs`
- **Limite**: Últimos 100 eventos
- **Persistência**: Entre abas/sessões

---

## Exemplos Práticos

### Monitorar logins

```typescript
const logs = getAuthLogs();
const loginSuccesses = logs.filter(log => log.event === 'LOGIN_SUCCESS');
const failedLogins = logs.filter(log => log.event === 'LOGIN_FAILED');

console.log(`Logins bem-sucedidos: ${loginSuccesses.length}`);
console.log(`Logins falhados: ${failedLogins.length}`);
```

### Encontrar erros

```typescript
const logs = getAuthLogs();
const errors = logs.filter(log => 
  log.event.includes('FAILED') || log.event.includes('ERROR')
);

errors.forEach(log => {
  console.log(`Erro: ${log.message}`);
  console.log(`Detalhes:`, log.details);
});
```

### Análise de sessão

```typescript
const logs = getRecentLogs(60); // Última hora
const sessionStart = logs.find(log => log.event === 'SESSION_RESTORED' || log.event === 'LOGIN_SUCCESS');
const sessionEnd = logs.find(log => log.event === 'LOGOUT');

console.log('Sessão iniciou em:', sessionStart?.timestamp);
console.log('Sessão terminou em:', sessionEnd?.timestamp);
```

### Exportar para análise externa

```typescript
// Exportar como JSON
const json = exportAuthLogs();
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `auth-logs-${Date.now()}.json`;
a.click();
```

---

## Debugging

### Verificar se o logger está funcionando

```typescript
import { logAuthEvent, getAuthLogs } from '@/utils/authLogger';

// Registrar um teste
logAuthEvent('AUTH_ERROR', 'Este é um teste');

// Verificar se foi registrado
const logs = getAuthLogs();
console.log(logs[logs.length - 1]); // Deve mostrar o log de teste
```

### Ver histórico completo

```typescript
import { getAuthLogs, getAuthLogsSummary } from '@/utils/authLogger';

const logs = getAuthLogs();
const summary = getAuthLogsSummary();

console.table(logs);           // Tabela de todos os logs
console.table(summary.events); // Resumo por tipo de evento
```

---

## Segurança

⚠️ **Notas Importantes:**

- Os logs são armazenados no **localStorage** (acessível pelo console do navegador)
- **Não armazene senhas ou tokens completos** nos logs
- O Access Token é truncado (comprimento, não valor)
- Use `.slice(0, 8)` para mascarar IDs de usuários se necessário
- Limpe os logs periodicamente com a opção "Limpar" na página

---

## Troubleshooting

### Logs não aparecem na página

1. Abra DevTools (F12)
2. Vá para **Application** → **Local Storage**
3. Procure pela chave `spotify_auth_logs`
4. Se existir, o JSON deve ser válido

### Logs não salvam

```typescript
// Verificar espaço disponível
const testKey = 'test_' + Date.now();
try {
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
  console.log('Storage disponível');
} catch (e) {
  console.error('Storage cheio ou desabilitado:', e);
}
```

### Performance

Se houver muitos logs:
```typescript
import { clearAuthLogs } from '@/utils/authLogger';

// Limpar logs antigos
clearAuthLogs();
```

---

## Integração com Monitoramento Externo

Você pode enviar logs para um serviço externo:

```typescript
import { logAuthEvent, getAuthLogs } from '@/utils/authLogger';

// Custom hook para enviar logs ao servidor
async function syncLogsToServer() {
  const logs = getAuthLogs();
  
  await fetch('/api/analytics/auth-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logs),
  });
}

// Chamar periodicamente
setInterval(syncLogsToServer, 60000); // A cada minuto
```

---

## Referências

- [Logger Utils](../utils/authLogger.ts)
- [Auth Logs Page](../app/auth-logs/page.tsx)
- [Auth Utils](../utils/auth.ts)
- [Auth Hook](../hooks/useAuth.ts)
