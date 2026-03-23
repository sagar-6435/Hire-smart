import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * StatusBadge – shows a colored pill (e.g., Approved, Rejected)
 * @param {string} label
 * @param {'success'|'error'|'warning'|'info'} type
 */
const BADGE_COLORS = {
  success: { bg: '#064E3B', text: '#10B981', border: '#10B981' },
  error:   { bg: '#450A0A', text: '#EF4444', border: '#EF4444' },
  warning: { bg: '#451A03', text: '#F59E0B', border: '#F59E0B' },
  info:    { bg: '#1E1B4B', text: '#818CF8', border: '#818CF8' },
};

const StatusBadge = ({ label, type = 'info' }) => {
  const colors = BADGE_COLORS[type] || BADGE_COLORS.info;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
