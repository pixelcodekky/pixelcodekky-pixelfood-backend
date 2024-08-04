import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import MyAddressController from "../controllers/MyAddressController";
import { validateMyAddressRequest } from "../middleware/validation";

const router = express.Router();

router.get('/:Id?',jwtCheck, jwtParse, MyAddressController.getAddress);
router.post('/',validateMyAddressRequest, jwtCheck, jwtParse, MyAddressController.addAddress);
router.put('/', validateMyAddressRequest, jwtCheck, jwtParse, MyAddressController.updateAddress);
router.patch('/', jwtCheck, jwtParse, MyAddressController.updateDefaultAddress);
router.delete('/:Id', jwtCheck, jwtParse, MyAddressController.deleteAddress);

export default router;


