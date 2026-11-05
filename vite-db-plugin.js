import fs from 'node:fs';
import path from 'node:path';

/**
 * Embedded Mock Database Server Plugin for Vite.
 * Reads and writes directly to src/data/db.json for all CRUD endpoints
 * so that tickets, comments, activities, and notifications are persistently
 * stored in the actual database file without requiring a separate json-server process.
 */
export function dbServerPlugin() {
  const dbPath = path.resolve(process.cwd(), 'src/data/db.json');

  function readDb() {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[DB Plugin] Failed to read db.json:', e);
      return { tickets: [], agents: [], comments: [], activities: [], notifications: [] };
    }
  }

  function writeDb(data) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('[DB Plugin] Failed to write db.json:', e);
      return false;
    }
  }

  return {
    name: 'vite-db-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        // Intercept REST endpoints
        const isApiRoute =
          pathname === '/tickets' ||
          pathname.startsWith('/tickets/') ||
          pathname === '/agents' ||
          pathname.startsWith('/agents/') ||
          pathname === '/comments' ||
          pathname.startsWith('/comments/') ||
          pathname === '/activities' ||
          pathname.startsWith('/activities/') ||
          pathname === '/notifications' ||
          pathname.startsWith('/notifications/');

        if (!isApiRoute) {
          return next();
        }

        const getBody = () =>
          new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });

        const sendJson = (status, data) => {
          res.writeHead(status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept'
          });
          res.end(JSON.stringify(data));
        };

        if (req.method === 'OPTIONS') {
          return sendJson(204, null);
        }

        const db = readDb();

        // 1. TICKETS
        if (pathname === '/tickets') {
          if (req.method === 'GET') {
            return sendJson(200, db.tickets || []);
          }
          if (req.method === 'POST') {
            const newTicket = await getBody();
            db.tickets = [newTicket, ...(db.tickets || [])];
            writeDb(db);
            return sendJson(201, newTicket);
          }
        }

        if (pathname.startsWith('/tickets/')) {
          const id = pathname.replace('/tickets/', '').split('?')[0];
          const ticketIndex = (db.tickets || []).findIndex(t => t.id === id);

          if (req.method === 'GET') {
            if (ticketIndex === -1) return sendJson(404, { error: `Ticket #${id} was not found.` });
            return sendJson(200, db.tickets[ticketIndex]);
          }

          if (req.method === 'PUT' || req.method === 'PATCH') {
            if (ticketIndex === -1) return sendJson(404, { error: `Ticket #${id} was not found.` });
            const patch = await getBody();
            db.tickets[ticketIndex] = {
              ...db.tickets[ticketIndex],
              ...patch,
              updatedAt: new Date().toISOString()
            };
            writeDb(db);
            return sendJson(200, db.tickets[ticketIndex]);
          }

          if (req.method === 'DELETE') {
            if (ticketIndex !== -1) {
              db.tickets.splice(ticketIndex, 1);
              // Clean up orphaned comments & activities
              db.comments = (db.comments || []).filter(c => c.ticketId !== id);
              db.activities = (db.activities || []).filter(a => a.ticketId !== id);
              writeDb(db);
            }
            return sendJson(200, { success: true, id });
          }
        }

        // 2. AGENTS
        if (pathname === '/agents') {
          return sendJson(200, db.agents || []);
        }

        // 3. COMMENTS
        if (pathname === '/comments' || pathname.startsWith('/comments')) {
          if (req.method === 'GET') {
            const ticketId = urlObj.searchParams.get('ticketId');
            const filtered = ticketId
              ? (db.comments || []).filter(c => c.ticketId === ticketId)
              : (db.comments || []);
            return sendJson(200, filtered);
          }
          if (req.method === 'POST') {
            const newComment = await getBody();
            if (!newComment.id) {
              newComment.id = `cmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            }
            if (!newComment.createdAt) {
              newComment.createdAt = new Date().toISOString();
            }
            db.comments = [...(db.comments || []), newComment];
            writeDb(db);
            return sendJson(201, newComment);
          }
        }

        // 4. ACTIVITIES
        if (pathname === '/activities' || pathname.startsWith('/activities')) {
          if (req.method === 'GET') {
            const ticketId = urlObj.searchParams.get('ticketId');
            const filtered = ticketId
              ? (db.activities || []).filter(a => a.ticketId === ticketId)
              : (db.activities || []);
            return sendJson(200, filtered);
          }
          if (req.method === 'POST') {
            const newActivity = await getBody();
            if (!newActivity.id) {
              newActivity.id = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            }
            if (!newActivity.timestamp) {
              newActivity.timestamp = new Date().toISOString();
            }
            db.activities = [newActivity, ...(db.activities || [])];
            writeDb(db);
            return sendJson(201, newActivity);
          }
        }

        // 5. NOTIFICATIONS
        if (pathname === '/notifications' || pathname.startsWith('/notifications')) {
          if (req.method === 'GET') {
            return sendJson(200, db.notifications || []);
          }
          if (req.method === 'POST') {
            const newNotif = await getBody();
            if (!newNotif.id) {
              newNotif.id = `notif-${Date.now()}`;
            }
            if (!newNotif.timestamp) {
              newNotif.timestamp = new Date().toISOString();
            }
            db.notifications = [newNotif, ...(db.notifications || [])];
            writeDb(db);
            return sendJson(201, newNotif);
          }
          if (req.method === 'PATCH') {
            const patch = await getBody();
            const id = pathname.replace('/notifications/', '').split('?')[0];
            if (id && id !== '/notifications' && id !== '') {
              const idx = (db.notifications || []).findIndex(n => n.id === id);
              if (idx !== -1) {
                db.notifications[idx] = { ...db.notifications[idx], ...patch };
                writeDb(db);
                return sendJson(200, db.notifications[idx]);
              }
            } else {
              // Mark all read
              db.notifications = (db.notifications || []).map(n => ({ ...n, read: true }));
              writeDb(db);
              return sendJson(200, db.notifications);
            }
          }
        }

        next();
      });
    }
  };
}
