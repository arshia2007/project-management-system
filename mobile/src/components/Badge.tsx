import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  type: 'projectStatus' | 'taskStatus' | 'priority';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  let bg = '#f1f5f9';
  let text = '#475569';
  let border = '#e2e8f0';

  if (type === 'projectStatus' || type === 'taskStatus') {
    switch (value) {
      case 'Completed':
        bg = '#ecfdf5';
        text = '#047857';
        border = '#a7f3d0';
        break;
      case 'In Progress':
        bg = '#fffbeb';
        text = '#b45309';
        border = '#fde68a';
        break;
      case 'Not Started':
      case 'Pending':
        bg = '#f1f5f9';
        text = '#475569';
        border = '#cbd5e1';
        break;
    }
  } else if (type === 'priority') {
    switch (value) {
      case 'High':
        bg = '#fff1f2';
        text = '#be123c';
        border = '#fecdd3';
        break;
      case 'Medium':
        bg = '#eff6ff';
        text = '#1d4ed8';
        border = '#bfdbfe';
        break;
      case 'Low':
        bg = '#ecfdf5';
        text = '#047857';
        border = '#a7f3d0';
        break;
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
