
 const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require("../controllers/taskController");


const router = express.Router();

//Tsk Management Routes
router.get("/dashboard-data", protect, getDashboardData); //get dashboard data
router.get("/user-dashboard-data", protect, getUserDashboardData); //get user dashboard data
router.get("/", protect, getTasks); //get all tasks (admin: all, user: assigned)
router.get("/:id", protect, getTaskById); //get task by id
router.post("/", protect, adminOnly, createTask); // create task (admin only)
router.put("/:id", protect, updateTask); //update task details
router.delete("/:id", protect, adminOnly, deleteTask); //delete task (admin only)
router.put("/:id/status", protect, updateTaskStatus); //update task status
router.put("/:id/todo",protect, updateTaskChecklist); //update task checklist

module.exports = router;
