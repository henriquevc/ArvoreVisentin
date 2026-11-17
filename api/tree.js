import { createClient } from '@libsql/client/web';
import crypto from 'node:crypto';

function getTursoClient() {
  const url = (process.env.TURSO_DATABASE_URL || '').trim();
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

  if (!url) {
    return null;
  }

  return createClient({
    url,
    authToken: authToken || undefined
  });
}

async function ensureSchema(client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      sort_idx INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

function verifyPasswordHeader(req) {
  const expected = (process.env.EDIT_PASSWORD || '').trim();
  if (!expected) {
    return {
      ok: false,
      status: 500,
      error: 'A variável EDIT_PASSWORD não está configurada nas variáveis de ambiente do servidor (Vercel / .env).'
    };
  }

  const rawHeader = req.headers['x-edit-password'];
  const provided = (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader || '').trim();

  if (!provided) {
    return {
      ok: false,
      status: 401,
      error: 'Senha de edição necessária.'
    };
  }

  const expectedBuf = Buffer.from(expected, 'utf8');
  const providedBuf = Buffer.from(provided, 'utf8');

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return {
      ok: false,
      status: 401,
      error: 'Senha incorreta. Tente novamente.'
    };
  }

  return { ok: true };
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return req.body ? JSON.parse(req.body) : {};
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Corpo JSON inválido na requisição.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  try {
    const client = getTursoClient();
    const hasPasswordEnv = Boolean((process.env.EDIT_PASSWORD || '').trim());

    if (req.method === 'GET') {
      if (!client) {
        return sendJson(res, 200, {
          configured: false,
          passwordProtected: false,
          missingPasswordEnv: false,
          empty: true,
          members: []
        });
      }

      await ensureSchema(client);
      const result = await client.execute(
        'SELECT id, sort_idx, data FROM family_members ORDER BY sort_idx ASC, rowid ASC'
      );

      const members = [];
      for (const row of result.rows) {
        try {
          const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          if (parsed && parsed.id) {
            members.push(parsed);
          }
        } catch (e) {
          console.error('Invalid member JSON in DB for id:', row.id, e);
        }
      }

      return sendJson(res, 200, {
        configured: true,
        passwordProtected: true,
        missingPasswordEnv: !hasPasswordEnv,
        empty: members.length === 0,
        members
      });
    }

    if (req.method === 'POST') {
      if (!client) {
        return sendJson(res, 503, {
          error: 'Banco de dados Turso ainda não configurado (defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN).'
        });
      }

      const auth = verifyPasswordHeader(req);
      if (!auth.ok) {
        return sendJson(res, auth.status, { error: auth.error });
      }

      const body = await parseJsonBody(req);
      const { action } = body;

      if (action === 'verify') {
        await ensureSchema(client);
        return sendJson(res, 200, { ok: true });
      }

      await ensureSchema(client);
      const now = new Date().toISOString();

      if (action === 'clear') {
        await client.execute('DELETE FROM family_members');
        return sendJson(res, 200, { ok: true });
      }

      if (action === 'upsert') {
        const items = Array.isArray(body.members) ? body.members : [];
        const clearFirst = Boolean(body.clearFirst);

        const statements = [];
        if (clearFirst) {
          statements.push({ sql: 'DELETE FROM family_members', args: [] });
        }

        for (const item of items) {
          const member = item && item.data ? item.data : item;
          if (!member || !member.id) continue;
          const sortIdx = typeof item.sortIdx === 'number' ? item.sortIdx : 0;

          statements.push({
            sql: `
              INSERT INTO family_members (id, sort_idx, data, updated_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                sort_idx = excluded.sort_idx,
                data = excluded.data,
                updated_at = excluded.updated_at
            `,
            args: [String(member.id), sortIdx, JSON.stringify(member), now]
          });
        }

        if (statements.length > 0) {
          await client.batch(statements, 'write');
        }

        return sendJson(res, 200, { ok: true, count: items.length });
      }

      if (action === 'delete') {
        const ids = Array.isArray(body.ids) ? body.ids : [];
        if (ids.length > 0) {
          const statements = ids.map((id) => ({
            sql: 'DELETE FROM family_members WHERE id = ?',
            args: [String(id)]
          }));
          await client.batch(statements, 'write');
        }
        return sendJson(res, 200, { ok: true, deleted: ids.length });
      }

      return sendJson(res, 400, { error: `Ação desconhecida: ${action}` });
    }

    return sendJson(res, 405, { error: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro em /api/tree:', err);
    return sendJson(res, 500, {
      error: err?.message || 'Erro interno ao acessar o banco de dados Turso.'
    });
  }
}
