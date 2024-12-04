import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import GeoCodingController from '../controllers/GeocodingController';

const router = express.Router();

router.get('/staticmap/:lat/:lon', GeoCodingController.getGeocodingStaticMap);
router.get('/forward/:value', GeoCodingController.getGeocodingForward);
router.get('/reverse/:lat/:lon', GeoCodingController.getGeocodingReverse);

export default router;
