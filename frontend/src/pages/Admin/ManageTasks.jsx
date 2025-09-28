import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';

const ManageTasks = () => {

  const [allTasks, setAllTasks] = useState([]);

  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus
        },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data with fixed labels and order
// Correct
const statusSummary = response.data?.summary || {};

const statusArray = [
  { label: 'All', count: statusSummary.all || 0 },
  { label: 'Pending', count: statusSummary.pending || 0 },
  { label: 'In-progress', count: statusSummary.inProgress || 0 },
  { label: 'Completed', count: statusSummary.completed || 0 },
];

   console.log("All tasks response:", response.data);
   
      setTabs(statusArray);

    } catch (error) {
      console.error("Error fetching users: ",error)
    }

  };


  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, {state: { taskId: taskData._id }})
  };

  // download task report 
  const handleDownloadReport = async () => {

  };

  useEffect(() => {
    getAllTasks(filterStatus);
    return() => {};
  }, [filterStatus]);

  return (
    <DashboardLayout Layout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>

            <button className="flex lg:hidden download-btn" onClick={handleDownloadReport}>
              <LuFileSpreadsheet className='text-lg' />
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTabs tabs={tabs} activeTab={filterStatus} setActiveTab={setFilterStatus} />

              <button className="hidden lg:flex download-btn" onClick={handleDownloadReport} >
                <LuFileSpreadsheet className='text-lg' />
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageTasks

 