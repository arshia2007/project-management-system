import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setBaseUrl, getBaseUrl } from '../api/client';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Server configuration settings
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(getBaseUrl());

  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const handleLogin = async () => {
    setError(null);
    clearSessionExpiredMessage();

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Login failed.');
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setError(null);
    clearSessionExpiredMessage();
  };

  const handleSaveServerUrl = () => {
    if (customServerUrl.trim()) {
      setBaseUrl(customServerUrl.trim());
      setShowServerConfig(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>TF</Text>
          </View>
          <Text style={styles.title}>TaskFlow</Text>
          <Text style={styles.subtitle}>Mobile & Web Project Management</Text>
        </View>

        {/* Expired Session Alert Message */}
        {sessionExpiredMessage && (
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredTitle}>Session Expired</Text>
            <Text style={styles.expiredText}>{sessionExpiredMessage}</Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Demo account quick fill */}
          <TouchableOpacity style={styles.demoButton} onPress={handleDemoFill}>
            <Text style={styles.demoButtonText}>⚡ Fill Demo Account (Alex Morgan)</Text>
          </TouchableOpacity>

          {/* Navigation to Register */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Server Config Toggle */}
          <TouchableOpacity
            style={styles.configToggle}
            onPress={() => setShowServerConfig(!showServerConfig)}
          >
            <Text style={styles.configToggleText}>
              ⚙️ {showServerConfig ? 'Hide Server Settings' : 'Configure Backend IP'}
            </Text>
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.configBox}>
              <Text style={styles.configLabel}>API Server URL:</Text>
              <TextInput
                style={styles.configInput}
                value={customServerUrl}
                onChangeText={setCustomServerUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.configSaveBtn} onPress={handleSaveServerUrl}>
                <Text style={styles.configSaveBtnText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  iconText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  expiredBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  expiredTitle: {
    color: '#b45309',
    fontWeight: '700',
    fontSize: 13,
  },
  expiredText: {
    color: '#92400e',
    fontSize: 12,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#0284c7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    marginTop: 12,
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 13,
    color: '#64748b',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  configToggle: {
    marginTop: 20,
    alignItems: 'center',
  },
  configToggleText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  configBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  configLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  configInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 8,
  },
  configSaveBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  configSaveBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
