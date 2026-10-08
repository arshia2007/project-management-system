import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    priority: 'Medium' as TaskPriority,
    status: 'Pending' as TaskStatus,
    dueDate: '',
  });
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
        setTasks(res.data.project.tasks || []);
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      setError('Project not found or you do not have permission to access it.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/tasks/${task.id}`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      name: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
    });
    setTaskFormError(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setTaskFormError(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskFormError(null);

    if (!taskForm.name.trim()) {
      setTaskFormError('Task name is required');
      return;
    }

    setIsSubmittingTask(true);
    try {
      const payload = {
        name: taskForm.name.trim(),
        description: taskForm.description.trim() || null,
        priority: taskForm.priority,
        status: taskForm.status,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
        projectId: id,
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        if (res.data.success) {
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTask.id ? res.data.task : t))
          );
        }
      } else {
        const res = await api.post('/tasks', payload);
        if (res.data.success) {
          setTasks((prev) => [res.data.task, ...prev]);
        }
      }

      setIsTaskModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save task';
      setTaskFormError(msg);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">{error || 'Project not found'}</h3>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Banner / Info Card */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.name}</h1>
              <Badge type="projectStatus" value={project.status} />
            </div>
            <p className="text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
          </div>
        </div>

        {/* Timeline & Stats */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Start:{' '}
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : 'Not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              End:{' '}
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString()
                : 'Not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>
              Tasks: {completedCount} / {tasks.length} completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tasks Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Project Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage and track checklist items for this project
          </p>
        </div>

        <button
          onClick={openCreateTaskModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No tasks in this project yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create tasks to break down the deliverables.
          </p>
          <button
            onClick={openCreateTaskModal}
            className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
          >
            + Add First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`p-4 bg-white rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Checkbox and Info */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {task.name}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <Badge type="priority" value={task.priority} size="sm" />
                      <Badge type="taskStatus" value={task.status} size="sm" />

                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditTaskModal(task)}
                    title="Edit task"
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        {taskFormError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{taskFormError}</span>
          </div>
        )}
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskForm.name}
              onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
              placeholder="e.g. Write unit tests"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task instructions and details..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors disabled:opacity-60"
            >
              {isSubmittingTask ? 'Saving...' : editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
