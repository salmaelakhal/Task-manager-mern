const Task = require("../models/Task");




// @desc Get all tasks (admin:all, user: only assigned tasks)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { status} = req.query;
    let filter = {};

    if (status) {
        filter.status = status;
    }

    let tasks;

    if (req.user.role === "admin") {
        tasks = await Task.find(filter).populate(
            "assignedTo", 
            "name email role"
        );
    } else {
        tasks = await Task.find({ ...filter, assignedTo: req.user._id}).populate(
            "assignedTo", 
            "name email profileImageUrl"
        );
    }


    // Add completed todochecklist count to each task
    tasks = await Promise.all(
        tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed).length;
            return { ...task._doc, completedChecklistCount: completedCount };
    }));

    // Status summary counts
    const allTasks = await Task.countDocuments(
        req.user.role === "admin" ? {} : { assignedTo: req.user._id }
    );
    const pendingTasks = await Task.countDocuments({
        ...filter,
        status: "Pending",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });
    const inProgressTasks = await Task.countDocuments({
        ...filter,
        status: "In-progress",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });
    const completedTasks = await Task.countDocuments({
        ...filter,
        status: "Completed",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    res.status(200).json({
        tasks,
        summary: {
            all: allTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
        },
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}




// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
        "assignedTo", 
        "name email profileImageUrl"
    );

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    };

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}




// @desc Create a new task (admin only)
// @route POST /api/tasks
// @access Private (Admin only)
const createTask = async (req, res) => {
  try {
    const {
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        attachements,
        todoChecklist,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
        return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
    }

    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        createdBy: req.user._id,
        todoChecklist,
        attachements,
    });
    res.status(201).json({ message: "Task created successfully", task });


  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}




// @desc Update task details
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachements = req.body.attachements || task.attachements;

    if (req.body.assignedTo) {
        if (!Array.isArray(req.body.assignedTo)) {
            return res.status(400).json({
                 message: "assignedTo must be an array of user IDs" });
        }
        task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully", updatedTask });


  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}









// @desc Delete a task (admin only)
// @route DELETE /api/tasks/:id
// @access Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}



// @desc Update task status
// @route PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
    
  try {

    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const isAssigned = task.assignedTo.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this task status" });
    }

    task.status = req.body.status || task.status;

    if (task.status === "Completed") {
        task.todoChecklist.forEach((item) => (item.completed = true));
        task.progress = 100;
    }

    await task.save();
    res.json({ message: "Task status updated successfully", task });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}



// @desc Update task checklist
// @route GET /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
  try {
    const {todoChecklist} = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this task checklist" });
    }

    task.todoChecklist = todoChecklist;

    //Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
        (item) => item.completed).length;

        const totalItems = task.todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        // Auto-update status if all checklist items are checked
        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0 ) {
            task.status = "In-progress";
        } else {
            task.status = "Pending";
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo", 
            "name email profileImageUrl"
        );

        res.json({ message: "Task checklist updated successfully", task: updatedTask });



    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}


// @desc Get dashboard data (admin only)
// @route GET /api/tasks/dashboard-data
// @access Private
const getDashboardData = async (req, res) => {
  try {
    // Fetch statistics
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
    });

    // Ensure all possible statuses are included
    const taskStatues = ["Pending", "In-progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    const taskDistribution = taskStatues.reduce((acc, status) => {
        const formattedKey = status.replace9(/\s+/g, ""); // Reemove spaces for responses keys
        acc[formattedKey] = 
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
        return acc;
    }, {});

    taskDistribution["All"] = totalTasks; // Add total count to task distribution

    // Ensure all priority levels are included
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 },
            },
        },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
       acc[priority] = 
            taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
        return acc; 
    }, {});

    // Fetch recent 10 tasks
    const recentTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
           
        });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}



// @desc Get Dqashboard data (User-specific)
// @route GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // only fetch data for the logged-in user

    // Fetch statistics for the user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
    const overdueTasks = await Task.countDocuments({
        assignedTo: userId,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
    });


    // Task distribution by status
    const taskStatues = ["Pending", "In-progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
        { $match: { assignedTo: userId } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    const taskDistribution = taskStatues.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
        acc[formattedKey] = 
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
        return acc;
    }, {});

    taskDistribution["All"] = totalTasks; // Add total count to task distribution
    
    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
        { $match: { assignedTo: userId } },
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 },
            },
        },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
       acc[priority] = 
            taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
        return acc; 
    }, {});

    // Fetch recent 10 tasks assigned to the user
    const recentTasks = await Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });


  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData
};

