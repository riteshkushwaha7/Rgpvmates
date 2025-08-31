import { Router } from 'express';

const router = Router();

// Static list of colleges for now
const colleges = [
  { id: '1', name: 'RGPV Main Campus' },
  { id: '2', name: 'UIT RGPV' },
  { id: '3', name: 'SIRT Bhopal' },
  { id: '4', name: 'SGSITS Indore' },
  { id: '5', name: 'MANIT Bhopal' },
  { id: '6', name: 'Other RGPV Affiliated College' }
];

// Get all colleges
router.get('/', (req, res) => {
  res.json(colleges);
});

export { router as collegeRoutes };
