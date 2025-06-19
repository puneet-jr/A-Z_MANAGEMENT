import express from 'express';
import { 
    addUser, 
    checkUser, 
    deleteUser, 
    getUserWithTasks,
    getAllUsers,      // Add this import
    getUserById,      // Add this import
    updateUser,       // Add this import
    getUserStats      // Add this import
} from "../controllers/userController.js";

const router = express.Router();

router.post("/addUser", addUser);
router.post("/checkUser", checkUser);
router.get("/getAllUsers", getAllUsers);                    // Add this route
router.get("/getUserById/:userId", getUserById);           // Add this route
router.get("/getUserWithTasks/:userId", getUserWithTasks);
router.get("/getUserStats/:userId", getUserStats);         // Add this route
router.put("/updateUser/:userId", updateUser);             // Add this route
router.delete("/deleteUser/:userId", deleteUser);

export default router;