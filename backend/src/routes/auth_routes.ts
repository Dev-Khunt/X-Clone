import express from 'express'
// import { signIn, signUp } from '../controllers/auth.controller';
import { checkDuplicateUser } from '../middleware/verifySignUp';
import { upload } from '../middleware/upload.middleware';
import { uploadProfile, uploadCover } from '../controllers/user.controller';
import { signIn } from '../controllers/auth/SignIn';
import { signUp } from '../controllers/auth/SignUp';
import { deleteCaptcha, generateCaptcha, verifyCaptcha } from '../middleware/captcha';
import { registerSchema } from '../controllers/auth/validate';
import { validate } from '../middleware/validate.middleware';


const router = express.Router();

// Define your authentication routes here
router.post("/signup",verifyCaptcha,[validate(registerSchema)],checkDuplicateUser,signUp);
router.post("/signin",signIn);

// Captcha
router.get("/captcha",generateCaptcha);
router.post("/captcha/delete",deleteCaptcha);


router.put("/upload/:id",upload.single("image"),uploadProfile)
router.put("/upload/cover/:id",upload.single("image"),uploadCover)


export default router
