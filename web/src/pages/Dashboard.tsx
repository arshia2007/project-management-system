import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DashboardStats } from '../types';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  Activity,
  Layers,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard analytics..." />;
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 mb-4">{error || 'Could not load data'}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const taskCompletionRate =
    stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview of your projects and task progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors disabled:opacity-60"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/projects"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards - Required in Assessment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Projects
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalProjects}</span>
            <span className="text-xs text-slate-500">registered</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tasks
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalTasks}</span>
            <span className="text-xs text-slate-500">across all projects</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Tasks
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.completedTasks}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {taskCompletionRate}%
            </span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Tasks
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{stats.pendingTasks}</span>
            <span className="text-xs text-slate-500">awaiting action</span>
          </div>
        </div>

        {/* Projects In Progress */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Projects In Progress
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600">{stats.projectsInProgress}</span>
            <span className="text-xs text-slate-500">active</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-800">Overall Task Completion</span>
          <span className="text-sm font-bold text-sky-600">{taskCompletionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed: {stats.completedTasks}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>In Progress: {stats.breakdown.tasks.inProgress}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Pending: {stats.pendingTasks}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Projects & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentProjects.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No projects created yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 flex items-center justify-between transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge type="projectStatus" value={project.status} size="sm" />
                    <span className="text-xs text-slate-400">
                      {project._count?.tasks ?? 0} tasks
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Upcoming Tasks</h2>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No upcoming tasks scheduled.</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 truncate">
                        {task.project?.name}
                      </span>
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge type="priority" value={task.priority} size="sm" />
                    <Badge type="taskStatus" value={task.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
