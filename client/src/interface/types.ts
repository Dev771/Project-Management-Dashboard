/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Users {
    userId?: string;
    id?: string;
    name?: string;
    email?: string;
    status?: string;
    created_at?: Date | number; 
    role?: string;
}

export interface Projects {
    id?: string;
    name: string;
    description: string;
    created_by?: string;
    role?: string;
    project_id?: string;
    created_at?: Date | string | number;
    owner_name?: string;
    owner_email?: string;
}

export interface Tasks {
    id?: string;
    title: string;
    description: string;
    status?: string;
    dueDate?: Date | number;
    due_date?: Date;
    assignedTo?: string;
    assigned_to?: string;
    priority?: string;
    assigned_to_name?: string;
    assigned_to_email?: string;
    comments?: Comments[]
}

export interface Comments {
    id: string;
    author?: string;
    name?: string;
    comment?: string;
    text: string;
    userId?: string;
    created_at?: number;
    role?: string;
    taskId?: string;
}

export interface UserState {
    loading: boolean;
    user: Users | null;
    token: string | null;
}

export interface Actions {
    type: string;
    payload?: any;
}

export interface ProjectState {
    loading: boolean,
    project: Projects | null;
    users: Users[] | null;
    members: Users[] | null;
}

export interface TaskState {
    loading: boolean,
    tasks: Record<string, Tasks>;
}

export interface RootState {
    user: UserState;
    project: ProjectState;
    task: TaskState;
}