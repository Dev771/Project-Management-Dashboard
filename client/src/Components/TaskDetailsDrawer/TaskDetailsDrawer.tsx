// src/components/TaskDetailsDrawer.jsx
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Tasks } from '../../interface/types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
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

interface TaskDetailsDrawer {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onAddComment: (taskId: string, comment: string | null) => void;
}

const TaskDetailsDrawer = ({ isOpen, onClose, taskId, onAddComment }: TaskDetailsDrawer) => {
  const [task, setTask] = useState<Tasks>({
    title: "",
    description: ""
  });
  const [comment, setComment] = useState<string | null>(null);
  const taskObj = useSelector((state) => state.task.tasks);

  const { user } = useSelector((state) => state.user);

  const handleAddComment = (e : React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    onAddComment(taskId, comment);
    setComment("");
  }

  useEffect(() => {
    if(taskId) {
      setTask(taskObj[taskId]);
    }
  }, [taskObj, taskId]);

  if (!isOpen || !taskId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose} 
    >
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-white shadow-lg w-full h-full overflow-auto transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <button onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {task.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Assigned To</label>
                <p className="font-medium">{task.assigned_to_name || "Unassigned"}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Due Date</label>
                <p className="font-medium">{new Date(task.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Priority</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Comments</h3>
              {task.comments && Array.isArray(task.comments) && task.comments.length > 0 ? (
                <ul className="space-y-3">
                  {task?.comments.map((comment) => (
                    <li key={comment.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <strong className={`flex gap-3 items-center ${user.id === comment.userId && "text-[#2970BC]"}`}>
                          {comment.author}
                        </strong>
                        <small className="text-gray-500">{new Date(comment.created_at).toLocaleString()}</small>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No comments yet.</p>
              )}
            </div>

            <div>
              <form onSubmit={handleAddComment}>
                <textarea
                  value={comment || ""}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsDrawer;