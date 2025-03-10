import express from "express"
import { getUsers, getUser, getCurrentUser, authenticateUser, createUser, updateUser, deleteUser, verifyUser, resendVerificationCode, loginUser, trackUserLogin } from "../controllers/userController.js"
import multer from "multer"
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/public/profile_pictures')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
})

const upload = multer({ storage: storage })

const router = express.Router();

router.get('/', getUsers)
router.get("/me", authenticateUser, getCurrentUser)
router.get('/:id', getUser)

router.post('/', createUser)
router.post('/resend-verification-code', resendVerificationCode)
router.post('/verify', verifyUser)
router.post('/login', loginUser)
router.post('/track-login/:userId', trackUserLogin)

router.patch('/:id', upload.single('profilePicture'), updateUser)

router.delete('/:id', deleteUser)

export default router