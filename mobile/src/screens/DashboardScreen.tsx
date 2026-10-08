import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardStats } from '../types';
import { Badge } from '../components/Badge';
import { NetworkBanner } from '../components/NetworkBanner';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setIsLoading(true);
    setNetworkError(null);

    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      if (err.isNetworkError) {
        setNetworkError(err.userFriendlyMessage);
      } else {
        setNetworkError('Failed to load dashboard data.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(true);
  };

  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading dashboard metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#0284c7']} />
      }
    >
      {/* Network Error Notification Banner */}
      <NetworkBanner
        visible={!!networkError}
        message={networkError || ''}
        onRetry={() => fetchDashboardData()}
      />

      {/* User Welcome Header */}
      <View style={styles.welcomeCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeGreeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 5 Required KPI Stats Cards */}
      <Text style={styles.sectionTitle}>Overview Statistics</Text>

      <View style={styles.statsGrid}>
        {/* Total Projects */}
        <View style={[styles.statCard, { borderLeftColor: '#0284c7' }]}>
          <Text style={styles.statLabel}>TOTAL PROJECTS</Text>
          <Text style={styles.statValue}>{stats?.totalProjects ?? 0}</Text>
          <Text style={styles.statSub}>Owned by you</Text>
        </View>

        {/* Total Tasks */}
        <View style={[styles.statCard, { borderLeftColor: '#6366f1' }]}>
          <Text style={styles.statLabel}>TOTAL TASKS</Text>
          <Text style={styles.statValue}>{stats?.totalTasks ?? 0}</Text>
          <Text style={styles.statSub}>In all projects</Text>
        </View>

        {/* Completed Tasks */}
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statLabel}>COMPLETED TASKS</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>
            {stats?.completedTasks ?? 0}
          </Text>
          <Text style={styles.statSub}>{completionRate}% finished</Text>
        </View>

        {/* Pending Tasks */}
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statLabel}>PENDING TASKS</Text>
          <Text style={[styles.statValue, { color: '#d97706' }]}>
            {stats?.pendingTasks ?? 0}
          </Text>
          <Text style={styles.statSub}>Needs attention</Text>
        </View>
      </View>

      {/* Projects In Progress Card */}
      <View style={styles.inProgressCard}>
        <View style={styles.inProgressHeader}>
          <Text style={styles.inProgressLabel}>PROJECTS IN PROGRESS</Text>
          <Text style={styles.inProgressValue}>{stats?.projectsInProgress ?? 0}</Text>
        </View>
        <Text style={styles.inProgressSub}>Active projects currently being worked on</Text>
      </View>

      {/* Overall Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Task Completion Rate</Text>
          <Text style={styles.progressPercentage}>{completionRate}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
        </View>
      </View>

      {/* Recent Projects Preview */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {stats?.recentProjects && stats.recentProjects.length > 0 ? (
          stats.recentProjects.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => navigation.navigate('Projects')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recentItemName}>{item.name}</Text>
                <Text style={styles.recentItemDesc} numberOfLines={1}>
                  {item.description || 'No description'}
                </Text>
              </View>
              <Badge type="projectStatus" value={item.status} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No projects created yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#0284c7',
    fontSize: 20,
    fontWeight: '800',
  },
  welcomeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  welcomeGreeting: {
    fontSize: 11,
    color: '#64748b',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 11,
    color: '#94a3b8',
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  statSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  inProgressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    marginBottom: 16,
  },
  inProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  inProgressValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0284c7',
  },
  inProgressSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  recentSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recentItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  recentItemDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
