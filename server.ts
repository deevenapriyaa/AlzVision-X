import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import http from 'http';

async function startServer() {
  const app = express();

  const PORT = 3000;
  const BACKEND_HOST = '127.0.0.1';
  const BACKEND_PORT = 8000;

  /*
   * AlzVision-X Frontend Server
   *
   * The React/Vite frontend runs on port 3000.
   * The real FastAPI backend runs on port 8000.
   *
   * All /api/* requests from the frontend are forwarded
   * to the real FastAPI backend.
   *
   * This removes the old mock/in-memory database and
   * allows the frontend to use the actual trained model,
   * actual patients, MRI analyses, history and comparison data.
   */

  app.get('/api/health', (req, res) => {
    proxyRequest(req, res);
  });

  /*
   * Proxy every API request to FastAPI.
   *
   * Examples:
   *   /api/dashboard
   *   /api/patients
   *   /api/history/6
   *   /api/compare
   *   /api/analyze
   *   /api/uploads/...
   *   /api/reports/...
   *
   * The request body is streamed directly, so multipart/form-data
   * MRI uploads are also forwarded correctly.
   */
  app.use('/api', (req, res) => {
    proxyRequest(req, res);
  });

  function proxyRequest(
    req: express.Request,
    res: express.Response
  ) {
    const options: http.RequestOptions = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`,
      },
    };

    /*
     * The browser sends the request to port 3000.
     * Remove the original host information before forwarding.
     */
    delete (options.headers as http.OutgoingHttpHeaders).connection;

    const backendReq = http.request(options, (backendRes) => {
      res.statusCode = backendRes.statusCode || 500;

      Object.entries(backendRes.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });

      backendRes.pipe(res);
    });

    backendReq.on('error', (error) => {
      console.error(
        '[AlzVision-X] Backend connection error:',
        error.message
      );

      if (!res.headersSent) {
        res.status(502).json({
          detail:
            'Unable to connect to AlzVision-X FastAPI backend. Make sure the backend is running on http://127.0.0.1:8000.',
          error: error.message,
        });
      } else {
        res.end();
      }
    });

    /*
     * Forward the incoming request body exactly as received.
     *
     * This is important for MRI file uploads because
     * multipart/form-data must not be converted into JSON.
     */
    req.pipe(backendReq);
  }

  /*
   * Vite integration
   */
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[AlzVision-X] Full-Stack server running on http://0.0.0.0:${PORT}`
    );

    console.log(
      `[AlzVision-X] API requests forwarded to http://${BACKEND_HOST}:${BACKEND_PORT}`
    );
  });
}

startServer();
