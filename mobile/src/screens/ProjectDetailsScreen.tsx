import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { api } from '../api/client';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { Badge } from '../components/Badge';
import { NetworkBanner } from '../components/NetworkBanner';

export const ProjectDetailsScreen = ({ route, navigation }: any) => {
  const { projectId } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Add Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setIsLoading(true);
    setNetworkError(null);

    try {
      const res = await api.get(`/projects/${projectId}`);
      if (res.data.success) {
        setProject(res.data.project);
        setTasks(res.data.project.tasks || []);
      }
    } catch (err: any) {
      if (err.isNetworkError) {
        setNetworkError(err.userFriendlyMessage);
      } else {
        setNetworkError('Failed to load project details.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProjectDetails(true);
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/tasks/${task.id}`, { status: nextStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleCreateTask = async () => {
    setFormError(null);
    if (!taskName.trim()) {
      setFormError('Task name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        name: taskName.trim(),
        description: taskDesc.trim() || null,
        priority,
        status,
        projectId,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setTaskName('');
        setTaskDesc('');
        setPriority('Medium');
        setStatus('Pending');
        setTasks((prev) => [res.data.task, ...prev]);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create task');
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

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <NetworkBanner
        visible={!!networkError}
        message={networkError || ''}
        onRetry={() => fetchProjectDetails()}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <View style={styles.headerTop}>
              <Text style={styles.projectTitle}>{project?.name}</Text>
              <Badge type="projectStatus" value={project?.status || 'Not Started'} />
            </View>

            <Text style={styles.projectDesc}>
              {project?.description || 'No description provided.'}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>
                  Tasks: {completedCount} / {tasks.length} Completed
                </Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            <View style={styles.tasksSectionHeader}>
              <Text style={styles.tasksSectionTitle}>Tasks in Project</Text>
              <TouchableOpacity
                style={styles.addTaskBtn}
                onPress={() => setIsModalOpen(true)}
              >
                <Text style={styles.addTaskBtnText}>+ Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isCompleted = item.status === 'Completed';
          return (
            <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
              <TouchableOpacity
                style={styles.checkboxTouch}
                onPress={() => handleToggleTaskStatus(item)}
              >
                <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text
                  style={[styles.taskName, isCompleted && styles.taskNameCompleted]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={styles.taskDescText} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.badgesRow}>
                  <Badge type="priority" value={item.priority} />
                  <Badge type="taskStatus" value={item.status} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.taskDeleteBtn}
                onPress={() => handleDeleteTask(item.id)}
              >
                <Text style={styles.taskDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Tasks Yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add Task" above to add deliverables.</Text>
          </View>
        }
      />

      {/* Add Task Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.label}>TASK NAME *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Conduct usability test"
              value={taskName}
              onChangeText={setTaskName}
            />

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Instructions..."
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

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleCreateTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Add</Text>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  projectDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  tasksSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  addTaskBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addTaskBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '600',
    color: '#0f172a',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
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
  taskDeleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
  taskDeleteText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
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
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 8,
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
