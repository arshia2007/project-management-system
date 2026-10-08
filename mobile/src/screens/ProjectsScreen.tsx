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
import { Project, ProjectStatus } from '../types';
import { Badge } from '../components/Badge';
import { NetworkBanner } from '../components/NetworkBanner';

export const ProjectsScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Create Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Not Started');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setIsLoading(true);
    setNetworkError(null);

    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err: any) {
      if (err.isNetworkError) {
        setNetworkError(err.userFriendlyMessage);
      } else {
        setNetworkError('Failed to load projects.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProjects(true);
  };

  const handleCreateProject = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/projects', {
        name: name.trim(),
        description: description.trim() || null,
        status,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setStatus('Not Started');
        fetchProjects();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (id: string, projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectName}"? This will also remove all its tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/projects/${id}`);
              setProjects((prev) => prev.filter((p) => p.id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Badge type="projectStatus" value={item.status} />
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description || 'No description provided.'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.taskCountText}>📋 {item._count?.tasks ?? 0} tasks</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteProject(item.id, item.name)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NetworkBanner
        visible={!!networkError}
        message={networkError || ''}
        onRetry={() => fetchProjects()}
      />

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search projects..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchProjects()}
        />

        {/* Status Filter Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusPills}>
          {['All', 'Not Started', 'In Progress', 'Completed'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.pill,
                statusFilter === opt && styles.pillActive,
              ]}
              onPress={() => setStatusFilter(opt)}
            >
              <Text
                style={[
                  styles.pillText,
                  statusFilter === opt && styles.pillTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Add Project FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Text style={styles.fabText}>+ New Project</Text>
      </TouchableOpacity>

      {/* Projects List */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectItem}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Projects Found</Text>
              <Text style={styles.emptySubtitle}>
                Create a project to get started organizing tasks.
              </Text>
            </View>
          }
        />
      )}

      {/* Create Project Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.label}>PROJECT NAME *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Website Overhaul"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Project goals and notes..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>STATUS</Text>
            <View style={styles.modalStatusRow}>
              {(['Not Started', 'In Progress', 'Completed'] as ProjectStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, status === s && styles.statusOptionActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextActive,
                    ]}
                  >
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
                onPress={handleCreateProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Create</Text>
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
    marginBottom: 10,
  },
  statusPills: {
    flexDirection: 'row',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#0284c7',
  },
  pillText: {
    fontSize: 12,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  taskCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
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
  modalStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  statusOptionActive: {
    backgroundColor: '#0284c7',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusOptionTextActive: {
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
