import { Request, Response, NextFunction } from 'express';
import {
  createService,
  deleteService,
  getMyProviderProfile,
  updateMyProviderProfile,
  updateService,
} from '../services/providerSelf.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await getMyProviderProfile(req.user!.sub);
    res.json(profile);
  } catch (e) { next(e); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await updateMyProviderProfile(req.user!.sub, req.body);
    res.json(profile);
  } catch (e) { next(e); }
}

export async function addService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await createService(req.user!.sub, req.body);
    res.status(201).json(service);
  } catch (e) { next(e); }
}

export async function editService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await updateService(req.user!.sub, req.params.id, req.body);
    res.json(service);
  } catch (e) { next(e); }
}

export async function removeService(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteService(req.user!.sub, req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}
