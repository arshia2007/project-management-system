import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NetworkBannerProps {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  visible,
  message = 'No network connection or server is unreachable.',
  onRetry,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#e11d48',
    borderRadius: 6,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
