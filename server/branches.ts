import { Router } from 'express';

const router = Router();

// Static list of branches
const branches = [
  { id: '1', name: 'Computer Science Engineering' },
  { id: '2', name: 'Information Technology' },
  { id: '3', name: 'Electronics and Communication' },
  { id: '4', name: 'Mechanical Engineering' },
  { id: '5', name: 'Civil Engineering' },
  { id: '6', name: 'Electrical Engineering' },
  { id: '7', name: 'Chemical Engineering' },
  { id: '8', name: 'Biotechnology' },
  { id: '9', name: 'Automobile Engineering' },
  { id: '10', name: 'Other' }
];

// Get all branches
router.get('/', (req, res) => {
  res.json(branches);
});

export { router as branchRoutes };
