import express, { Request, Response } from 'express';
import { ApiResponse, ManifestTarget, ScanRecord, SecurityAlert } from './types';

const app = express();
app.use(express.json());

// Supply chain API endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ChainSight Security Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/analyze-manifest', (req: Request, res: Response) => {
  const { repository, filePath, content } = req.body;
  const response: ApiResponse<{ blastRadius: number; vulnerabilities: number }> = {
    success: true,
    data: {
      blastRadius: 14,
      vulnerabilities: 18,
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

export { app };
export default app;
