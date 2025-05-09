import { useState, useEffect, use, useMemo } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Users, CheckSquare, Search, X } from 'lucide-react';
import mainInstance from '../../services/networkAdapters/mainAxiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeProject, updateProject } from '../../redux/actions/projectActions';
import TaskDetailsDrawer from '../TaskDetailsDrawer/TaskDetailsDrawer';

import moment from 'moment';
import { updateTask, updateTaskList } from '../../redux/actions/taskActions';
import useSocketConnection from '../../utils/useSocketConnection';
import { Avatar, AvatarGroup, debounce, Tooltip } from '@mui/material';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'todo':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'member':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProjectDetails = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [openCandidateDialog, setOpenCandidateDialog] = useState(false);
    const [isTaskUpdate, setIsTaskUpdate] = useState(false);
    const [isCandidateUpdating, setIsCandidateUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        assignedTo: '',
        status: 'todo',
        priority: 'Medium',
        dueDate: Date.now()
    });
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [candidateFormData, setCandidateFormData] = useState({
        userId: '',
        role: 'member'
    });

    const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [tasks, setTasks] = useState([]);

    const { project, members, users: usersList } = useSelector((state) => state.project);
    const { user } = useSelector((state) => state.user);
    const { tasks: taskList } = useSelector((state) => state.task);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        socket,
        getAllTasks,
        getProjectDetails,
        getAllMembers
    } = useSocketConnection({ projectId: id });

    useEffect(() => {
        setTasks((prev) => Object.keys(taskList).length > 0 ? Object.values(taskList) : []);
    }, [taskList]);

    useEffect(() => {
        const loadProjectData = async () => {
            try {
                await fetchProjectDetails();
            } catch (error) {
                console.error("Failed to fetch project details:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadProjectData();
    }, []);

    const handleCloseProject = () => {
        dispatch(closeProject());
        navigate("/");
    }

    const handleTabChange = (newValue) => {
        setTabValue(newValue);
    };

    const handleTaskDialogOpen = () => {
        setOpenTaskDialog(true);
    };

    const fetchTaskComments = async (taskId) => {
        const response = await mainInstance.get(`/tasks/${id}/comments/${taskId}`)
        const commentList = response.data.data;

        dispatch(updateTask({
            ...taskList[taskId],
            comments: commentList.map((comment) => {
                return {
                    id: comment.id,
                    author: comment.name,
                    text: comment.comment,
                    userId: comment.userId,
                    created_at: comment.created_at,
                    role: comment.role
                }
            })
        }))
    }

    const handleToggleTaskDrawerOpen = (taskId) => {
        setSelectedTaskId(taskId);
        setTaskDrawerOpen(true);
        if(taskList[taskId] && (taskList[taskId].comments === undefined || taskList[taskId].comments.length === 0)) {
            fetchTaskComments(taskId);
        }
    }

    const handleCloseTaskDrawer = () => {
        setSelectedTaskId(null);    
        setTaskDrawerOpen(false);
    }

    const handleTaskDialogClose = () => {
        setOpenTaskDialog(false);
        setIsTaskUpdate(false);
        setTaskFormData({
            title: '',
            assignedTo: '',
            status: 'todo',
            priority: 'Medium',
            dueDate: Date.now()
        });
    };

    const handleCandidateDialogOpen = () => {
        setOpenCandidateDialog(true);
    };

    const handleCandidateDialogClose = () => {
        setOpenCandidateDialog(false);
        setIsCandidateUpdating(false);
        setCandidateFormData({
            name: '',
            email: '',
            role: 'member'
        });
    };

    const handleTaskFormChange = (e) => {
        const { name, value } = e.target;
        setTaskFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCandidateFormChange = (e) => {
        const { name, value } = e.target;
        setCandidateFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTask = async () => {
        try {
            const response = await mainInstance.post(`/tasks/${id}`, taskFormData);

            if (response.status === 201) {
                
                const updatedTasks = await getAllTasks();

                dispatch(updateTaskList(updatedTasks));
            
                socket.emit("newTaskAdded", { taskId: response.data.data.id }, () => {
                    console.log("Socket Event Emitted!!!");
                });
            }
        } catch (err) {
            console.error("Error adding task:", err);
        } finally {
            setTaskFormData({
                title: '',
                assignedTo: '',
                status: 'todo',
                priority: 'Medium',
                dueDate: Date.now()
            })

            handleTaskDialogClose();
        }
    };

    const handleAddCandidate = async () => {
        try {
            const { userId, role } = candidateFormData;
    
            await mainInstance.post(`/users/${id}/candidates`, {
                userId,
                role
            });
    
            const updatedMembers = await getAllMembers();
    
            dispatch(updateProject({ members: updatedMembers }));

            socket.emit("newCandidateAdded", { candidateId: userId }, () => {
                console.log("Socket Event Emitted!!!")
            });
        } catch(err) {
            console.error("Error adding candidate:", err);
        } finally {
            handleCandidateDialogClose();
        }
    };

    const handleEditCandidateRole = async () => {
        try {
            const { userId, role } = candidateFormData;
    
            await mainInstance.patch(`/users/${id}/candidates`, {
                candidateId: userId,
                role
            });

            const membersList = members.map((member) => {
                if (member.id === userId) {
                    return { ...member, role };
                }
                return member;
            });

            dispatch(updateProject({ members: membersList }));
            socket.emit("candidateRoleUpdated", { candiateId: userId }, () => {
                console.log("Socket Event Emitted!!!");
            });
            handleCandidateDialogClose();
        } catch(err) {
            console.error("Error updating candidate role:", err);
        }
    }

    const handleDeleteMember = async (candidateId: string) => {
        try {
            await mainInstance.delete(`/users/${id}/candidates/${candidateId}`);
            const updatedMembers = members.filter((member) => member.id !== candidateId);
            dispatch(updateProject({ members: updatedMembers }));

            socket.emit("candidateRemoved", { candidateId }, () => {
                console.log("Socket Event Emitted!!!");
            });
        } catch(err) {
            console.error("Error deleting candidate:", err);
        }
    }

    const handleToggleEditMemberRoles = (candidate) => {
        setIsCandidateUpdating(true);
        setCandidateFormData({
            userId: candidate.id,
            name: candidate.name,
            email: candidate.email,
            role: candidate.role
        });
        handleCandidateDialogOpen();
    }

    const handleDeleteTask = (event, taskId) => {
        event.stopPropagation();

        if (window.confirm("Are you sure you want to delete this task?")) {
            mainInstance.delete(`/tasks/${id}/${taskId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const updatedTasks = tasks.filter((task) => task.id !== taskId);
                        dispatch(updateTaskList(updatedTasks));
                        socket.emit("taskDeleted", { taskId }, () => {
                            console.log("Socket Event Emitted!!!");
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error deleting task:", error);
                });
        }
    }

    const handleAddComment = async (taskId, comment) => {
        try {
            const response = await mainInstance.post(`/tasks/${id}/comments`, {
                taskId,
                comment
            });

            if (response.status === 201) {
                dispatch(updateTask({
                    ...taskList[taskId],
                    comments: [
                        ...taskList[taskId].comments,
                        {
                            id: response.data.data.id,
                            author: user.name,
                            text: comment,
                            userId: user.id,
                            created_at: new Date().toISOString(),
                            role: user.role
                        }
                    ]
                }));

                socket.emit("commented", { comment: {
                    id: response.data.data.id,
                    author: user.name,
                    text: comment,
                    created_at: new Date().toISOString(),
                    role: user.role
                }, taskId }, () => {
                    console.log("Socket Event Emitted!!!");
                })
            }
        } catch(err) {
            console.error("Error adding comment:", err);
        }
    }

    const handleUpdateTask = (taskId) => {
        mainInstance.put(`/tasks/${id}/${taskId}`, taskFormData)
            .then((response) => {
                if (response.status === 200) {
                    const updatedTasks = tasks.map((task) => {
                        if (task.id === taskId) {
                            return { ...task, ...taskFormData };
                        }
                        return task;
                    });
                    dispatch(updateTaskList(updatedTasks));

                    socket.emit("taskUpdated", { taskId }, () => {
                        console.log("Socket Event Emitted!!!");
                    });
                }
            })
            .catch((error) => {
                console.error("Error updating task:", error);
            })
            .finally(() => {
                setIsTaskUpdate(false);
                handleTaskDialogClose();
            });
    }

    const handleEditTask = (event, taskId) => {
        event.stopPropagation();

        const taskToEdit = tasks.find((task) => task.id === taskId);
        console.log(taskToEdit);

        if (taskToEdit) {
            setIsTaskUpdate(true);
            setTaskFormData({
                id: taskToEdit.id,
                title: taskToEdit.title,
                assignedTo: taskToEdit.assigned_to,
                status: taskToEdit.status,
                priority: taskToEdit.priority
            });
            handleTaskDialogOpen();
        }
    }

    const canEditTask = (userRole) => {
        return ['admin', 'manager'].includes(userRole);
    };

    const canDeleteTask = (userRole) => {
        return ['admin', 'manager'].includes(userRole);
    };

    const fetchProjectDetails = async () => { 
        try {
            const projectDetails = await getProjectDetails();  
            if(!projectDetails) {
                throw new Error("Project not found");
            }
    
            const taskData = await getAllTasks();
            const membersData = await getAllMembers();

            dispatch(updateProject({ project: projectDetails, members: membersData }));
            dispatch(updateTaskList(taskData));
        } catch(err) {
            if(err.message === "Project not found") {
                alert("Project not found");
                navigate("/")
            }
        }
    };

    const getUserList = async () => {
        try {
            setLoadingUsers(true);
            const response = await mainInstance.get(`/users/${id}`);
            setLoadingUsers(false);
            setUsers(response.data.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }   
    }

    const debouncedSearch = useMemo(() => {
        return debounce((term) => {
            getAllTasks(term)
                .then((updatedTasks) => {
                    dispatch(updateTaskList(updatedTasks));
                });
        }, 500);
    }, []);

    useEffect(() => {
        getUserList();
    }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Loading project details...</p>
        </div>
        );
    }

    if (!project) {
        return (
            <div className="p-4">
                <p className="text-red-600">Failed to load project details.</p>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button 
                        className="flex items-center mb-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={handleCloseProject}
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Projects
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{project.project_name}</h1>
                            <p className="text-gray-600 mt-1">
                                {project.project_description}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </div>
                </div>

                <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <Users size={20} className="mr-2 text-gray-600" />
                        <span className="text-gray-800 font-medium">
                            {members.length} Team Members
                        </span>
                    </div>
                    <AvatarGroup max={4}>
                        <Avatar alt={user.name} src="/static/images/avatar/1.jpg" className='border-2 !outline-[#297BCA] outline-offset-1 outline-2' />
                        { usersList && Array.isArray(usersList) && usersList.length > 0 && usersList.map((userDetails) => (
                            <Avatar alt={userDetails.username} src="/static/images/avatar/1.jpg" />
                        ))}
                    </AvatarGroup>
                    <div className="flex items-center">
                        <CheckSquare size={20} className="mr-2 text-gray-600" />
                        <span className="text-gray-800 font-medium">
                        {tasks.length} Tasks
                        </span>
                    </div>
                    </div>
                </div>

                <div className="mb-4 border-b border-gray-200">
                    <div className="flex">
                    <button
                        className={`py-2 px-4 font-medium ${tabValue === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleTabChange(0)}
                    >
                        Tasks
                    </button>
                    {project.userRole === 'admin' && (
                        <button
                        className={`py-2 px-4 font-medium ${tabValue === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleTabChange(1)}
                        >
                        Team Members
                        </button>
                    )}
                    </div>
                </div>

                <div className="mt-4">
                    {tabValue === 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Project Tasks</h2>
                                {canEditTask(project.userRole) && (
                                    <button 
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={handleTaskDialogOpen}
                                    >
                                    <Plus size={16} className="mr-1" />
                                    Add Task
                                    </button>
                                )}
                            </div>
                            <div className="mb-4 relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search tasks by title, assignee, status or priority..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const term = e.target.value;
                                            setSearchTerm(term);
                                            debouncedSearch(term);
                                        }}
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    {searchTerm && (
                                        <button 
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <X />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {tasks.map((task) => (
                                        <li key={task.id} className="py-3 px-4 flex justify-between items-center cursor-pointer" onClick={() => handleToggleTaskDrawerOpen(task.id)}>
                                            <div>
                                            <p className="font-medium text-gray-900">{task.title}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Assigned to: {task.assigned_to_name} | { task.assigned_to_email } | { moment(task.due_date).format("MMM Do YYYY | HH:MM") }
                                            </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            {canEditTask(project.userRole) && (
                                                <button className="p-1 text-gray-500 hover:text-blue-600" onClick={(e) => handleEditTask(e, task.id)}>
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {canDeleteTask(project.userRole) && (
                                                <button className="p-1 text-gray-500 hover:text-red-600" onClick={(e) => handleDeleteTask(e, task.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            </div>
                                        </li>
                                    ))}
                                    {tasks.length === 0 && (
                                        <li className="py-4 px-4">
                                            <p className="text-gray-500 text-center">No tasks found for this project.</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {tabValue === 1 && project.userRole === 'admin' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <button 
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={handleCandidateDialogOpen}
                            >
                                <Plus size={16} className="mr-1" />
                                Add Member
                            </button>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {members.map((member) => (
                                <li key={member.id} className="py-3 px-4 flex justify-between items-center">
                                    <div>
                                    <p className="font-medium text-gray-900">{member.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{member.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                        {member.role}
                                    </span>
                                    { member.id !== user.id && (
                                        <>
                                            <button className="p-1 text-gray-500 hover:text-blue-600" onClick={() => handleToggleEditMemberRoles(member)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-1 text-gray-500 hover:text-red-600" onClick={() => handleDeleteMember(member.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                    </div>
                                </li>
                                ))}
                            </ul>
                            </div>
                        </div>
                    )}
                    {tabValue === 1 && project.userRole !== 'admin' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600">You don't have permission to view this section.</p>
                        </div>
                    )}
                </div>

                {openTaskDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={taskFormData.title}
                                        onChange={handleTaskFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assigned To
                                    </label>
                                    <select
                                        name="assignedTo"
                                        value={taskFormData.assignedTo}
                                        onChange={handleTaskFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select team member</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={taskFormData.status}
                                        onChange={handleTaskFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="todo">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={taskFormData.priority}
                                        onChange={handleTaskFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={taskFormData.dueDate}
                                        onChange={handleTaskFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleTaskDialogClose}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => isTaskUpdate ? handleUpdateTask(taskFormData.id) : handleAddTask()}
                                    className={`px-4 py-2 text-white rounded-md ${
                                        !taskFormData.title || !taskFormData.assignedTo || !taskFormData.dueDate
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                    disabled={!taskFormData.title || !taskFormData.assignedTo || !taskFormData.dueDate}
                                >
                                    {isTaskUpdate ? "Update Task" : "Add Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {openCandidateDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select User
                                </label>
                                <select
                                    value={candidateFormData.userId}
                                    name="userId"
                                    onChange={handleCandidateFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={loadingUsers || isCandidateUpdating}
                                >
                                    <option value="">Select a user</option>
                                    {isCandidateUpdating ? (
                                        <option key={candidateFormData.userId} value={candidateFormData.userId}>
                                            {candidateFormData.name} ({candidateFormData.email})
                                        </option>
                                    ) : users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={candidateFormData.role}
                                    onChange={handleCandidateFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="member">Member</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={handleCandidateDialogClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={isCandidateUpdating ? handleEditCandidateRole : handleAddCandidate}
                            className={`px-4 py-2 text-white rounded-md ${!candidateFormData.userId ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={!candidateFormData.userId}
                        >
                            {isCandidateUpdating ? "Update Member" : "Add Member"} 
                        </button>
                        </div>
                    </div>
                    </div>
                )}
            </div>
            <TaskDetailsDrawer 
                isOpen={taskDrawerOpen}
                onClose={handleCloseTaskDrawer}
                taskId={selectedTaskId}
                onAddComment={handleAddComment}
            />
        </>
    );
};

export default ProjectDetails;