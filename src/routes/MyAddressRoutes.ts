import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import MyAddressController from "../controllers/MyAddressController";
import { validateMyAddressRequest } from "../middleware/validation";

const router = express.Router();

router.get('/',jwtCheck, jwtParse, MyAddressController.getAddress);
router.post('/',validateMyAddressRequest, jwtCheck, jwtParse, MyAddressController.addAddress);
router.put('/', validateMyAddressRequest, jwtCheck, jwtParse, MyAddressController.updateAddress);
router.put('/', jwtCheck, jwtParse, MyAddressController.updateDefaultAddress);
router.delete('/', jwtCheck, jwtParse, MyAddressController.deleteAddress);


export default router;


