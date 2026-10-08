import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
// import LoginScreen from './src/screens/LoginScreen';
import { LoginScreen } from './src/screens/LoginScreen';
// import RegisterScreen from './src/screens/RegisterScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
// import DashboardScreen from './src/screens/DashboardScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
// import ProjectsScreen from './src/screens/ProjectsScreen';
// import ProjectDetailsScreen from './src/screens/ProjectDetailsScreen';
// import TasksScreen from './src/screens/TasksScreen';

import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { ProjectDetailsScreen } from './src/screens/ProjectDetailsScreen';
import { TasksScreen } from './src/screens/TasksScreen';

// ─── Type Definitions ────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  ProjectsTab: undefined;
  TasksTab: undefined;
};

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetails: { projectId: string; projectName: string };
};

// ─── Navigators ──────────────────────────────────────────────────────
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>();

// ─── Projects Stack (nested inside tab) ──────────────────────────────
function ProjectsStackNavigator() {
  return (
    <ProjectsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <ProjectsStack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{ title: 'Projects' }}
      />
      <ProjectsStack.Screen
        name="ProjectDetails"
        component={ProjectDetailsScreen}
        options={({ route }) => ({
          title: route.params.projectName || 'Project Details',
        })}
      />
    </ProjectsStack.Navigator>
  );
}

// ─── Main Tab Navigator (after login) ────────────────────────────────
function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ProjectsTab') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'TasksTab') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <MainTab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{ title: 'Projects', headerShown: false }}
      />
      <MainTab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
    </MainTab.Navigator>
  );
}

// ─── Auth Stack (before login) ───────────────────────────────────────
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root Navigator (switches between auth and main) ─────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

// ─── App Entry Point ─────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
