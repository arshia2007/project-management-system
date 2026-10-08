import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../api/client';
import { Task, Project, TaskPriority, TaskStatus } from '../types';
import { Badge } from '../components/Badge';
import { NetworkBanner } from '../components/NetworkBanner';

export const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setIsLoading(true);
    setNetworkError(null);

    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err: any) {
      if (err.isNetworkError) {
        setNetworkError(err.userFriendlyMessage);
      } else {
        setNetworkError('Failed to load tasks.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchTasks(true);
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/tasks/${task.id}`, { status: nextStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const openCreateModal = () => {
    if (projects.length === 0) {
      Alert.alert('No Projects', 'Please create a project first before creating tasks.');
      return;
    }
    setEditingTask(null);
    setTaskName('');
    setTaskDesc('');
    setSelectedProjectId(projects[0].id);
    setPriority('Medium');
    setStatus('Pending');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskDesc(task.description || '');
    setSelectedProjectId(task.projectId);
    setPriority(task.priority);
    setStatus(task.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    setFormError(null);
    if (!taskName.trim()) {
      setFormError('Task name is required');
      return;
    }
    if (!selectedProjectId) {
      setFormError('Please select a project');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: taskName.trim(),
        description: taskDesc.trim() || null,
        priority,
        status,
        projectId: selectedProjectId,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <NetworkBanner
        visible={!!networkError}
        message={networkError || ''}
        onRetry={() => fetchTasks()}
      />

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tasks by name..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchTasks()}
        />

        {/* Status and Priority Filters */}
        <View style={styles.filterRow}>
          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            {['All', 'Pending', 'In Progress', 'Completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pill, statusFilter === s && styles.pillActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.pillText, statusFilter === s && styles.pillTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          {/* Priority Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pill, priorityFilter === p && styles.pillPriorityActive]}
                onPress={() => setPriorityFilter(p)}
              >
                <Text style={[styles.pillText, priorityFilter === p && styles.pillTextActive]}>
                  {p} Priority
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Floating Add Task Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+ New Task</Text>
      </TouchableOpacity>

      {/* Tasks List */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isCompleted = item.status === 'Completed';
            return (
              <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
                <TouchableOpacity
                  style={styles.checkboxTouch}
                  onPress={() => handleToggleStatus(item)}
                >
                  <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.taskInfo}
                  onPress={() => openEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.taskName, isCompleted && styles.taskNameCompleted]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.project && (
                    <Text style={styles.projectNameText} numberOfLines={1}>
                      📁 {item.project.name}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={styles.taskDescText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  <View style={styles.badgesRow}>
                    <Badge type="priority" value={item.priority} />
                    <Badge type="taskStatus" value={item.status} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTask(item.id)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Tasks Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search criteria or add a new task.
              </Text>
            </View>
          }
        />
      )}

      {/* Create / Edit Task Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.label}>PROJECT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {projects.map((proj) => (
                <TouchableOpacity
                  key={proj.id}
                  style={[
                    styles.projectPill,
                    selectedProjectId === proj.id && styles.projectPillActive,
                  ]}
                  onPress={() => setSelectedProjectId(proj.id)}
                >
                  <Text
                    style={[
                      styles.projectPillText,
                      selectedProjectId === proj.id && styles.projectPillTextActive,
                    ]}
                  >
                    {proj.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>TASK NAME *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Test push notifications"
              value={taskName}
              onChangeText={setTaskName}
            />

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Notes..."
              multiline
              value={taskDesc}
              onChangeText={setTaskDesc}
            />

            <Text style={styles.label}>PRIORITY</Text>
            <View style={styles.optionRow}>
              {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionBtn, priority === p && styles.optionBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.optionText, priority === p && styles.optionTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>STATUS</Text>
            <View style={styles.optionRow}>
              {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.optionBtn, status === s && styles.optionBtnActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.optionText, status === s && styles.optionTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSaveTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
  },
  filterRow: {
    marginTop: 6,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#0284c7',
  },
  pillPriorityActive: {
    backgroundColor: '#6366f1',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCardCompleted: {
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  checkboxTouch: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  projectNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
    marginTop: 2,
  },
  taskDescText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
  deleteBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    zIndex: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#be123c',
    fontSize: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  projectPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  projectPillActive: {
    backgroundColor: '#0284c7',
  },
  projectPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  projectPillTextActive: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  optionBtnActive: {
    backgroundColor: '#0284c7',
  },
  optionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
