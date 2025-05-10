import { useEffect, useRef } from "react"
import WebSocketManager from "../services/WebSocketManager";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProject } from "../redux/actions/projectActions";
import mainInstance from "../services/networkAdapters/mainAxiosInstance";
import { updateTask, updateTaskList } from "../redux/actions/taskActions";
import { type Users, type Comments, type Tasks } from "../interface/types";

const useSocketConnection = ({ projectId }: { projectId: string | undefined }) => {
    const socket = useRef<any>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.user);
    const { users: userList } = useSelector((state) => state.project);
    const { tasks } = useSelector((state) => state.task);

    const userListRef = useRef<Users[]>(userList);
    const tasksRef = useRef(tasks);

    useEffect(() => {
        userListRef.current = userList;
    }, [userList]);

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    const initializeSocketConnection = async () => {
        socket.current = await WebSocketManager.connect();

        socket.current.on("disconnect", () => {
            console.log("Disconnect!!");
            navigate('/');
        })

        socket.current.on("userLeft", (data: { userId: string }) => {
            const newUserList = Array.isArray(userListRef.current) ? userListRef.current.filter((currentUser) => {
                return currentUser.userId !== data.userId
            }) : null;
            dispatch(updateProject({ users: newUserList }));
        })

        socket.current.on("userJoined", (data: Users) => {
            let newUserList;
            if(userListRef.current) {
                newUserList = [...userListRef.current, data];
            } else {
                newUserList = [data];
            }
            dispatch(updateProject({ users: newUserList }));
        })

        socket.current.on("newTaskAdded", async (data: Tasks) => {
            dispatch(updateTask(data));
        })

        socket.current.on("taskUpdated", async (data: Tasks) => {
            dispatch(updateTask(data));
        });

        socket.current.on("taskDeleted", async (data: string) => {
            const taskObj = {
                ...tasksRef.current
            };
            delete taskObj[data];

            dispatch(updateTaskList(Object.values(taskObj)));
        });

        socket.current.on("commented", (data: Comments) => {
            if(data.taskId) {
                const taskDetail = tasksRef.current[data.taskId];
                if(taskDetail) {
                    if(taskDetail.comments) {
                        taskDetail.comments.push(data.comment);
                    } else {
                        taskDetail.comments = [data.comment];
                    }
                    dispatch(updateTask(taskDetail));
                }
            }
        });
    }

    const getAllTasks = async (searchTerm: string = "") => {
        const taskResponse = await mainInstance.get(`/tasks/${projectId}${searchTerm ? `?searchTerm=${searchTerm}` : ""}`);
        return taskResponse.data.data;
    }

    const getProjectDetails = async () => {
        const response = await mainInstance.get(`/projects/${projectId}`);
        const projectDetails = response.data.data;
        return projectDetails;
    }

    const getAllMembers = async () => {
        const membersResponse = await mainInstance.get(`/users/project/${projectId}`);
        return  membersResponse.data.data;
    }
    
    useEffect(() => {
        if (!projectId || !socket.current || !user) return;

        socket.current.emit("joinProject", { projectId, userId: user.id }, (data: { existingUsers: Users[] }) => {
            dispatch(updateProject({ users: data.existingUsers }));
        });

        return () => {
            socket.current.emit("leaveProject");
        };
    }, [projectId, socket.current, user]);

    useEffect(() => {
        initializeSocketConnection();
    }, []);
    
    return {
        socket: socket.current,
        getAllTasks,
        getProjectDetails,
        getAllMembers
    }
}

export default useSocketConnection;