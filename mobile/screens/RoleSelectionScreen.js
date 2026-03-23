import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { COLORS, ROLES } from '../utils/constants';

/**
 * RoleSelectionScreen
 * Step 1: User picks a job role (ML, Frontend, Backend)
 */
const RoleSelectionScreen = ({ navigation }) => {
  // Stagger-animate cards on mount
  const fadePan = useRef(ROLES.map(() => new Animated.Value(0))).current;
  const translateY = useRef(ROLES.map(() => new Animated.Value(40))).current;

  useEffect(() => {
    const anims = ROLES.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadePan[i], {
          toValue: 1,
          duration: 500,
          delay: i * 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY[i], {
          toValue: 0,
          duration: 500,
          delay: i * 150,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const handleSelect = (role) => {
    navigation.navigate('ResumeUpload', { role });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>🧠 HireSmart</Text>
        <Text style={styles.tagline}>Intelligent Candidate Screening</Text>
      </View>

      {/* Subtitle */}
      <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
      <Text style={styles.title}>Select a Job Role</Text>
      <Text style={styles.subtitle}>
        Choose the position you are screening candidates for.
      </Text>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        {ROLES.map((role, i) => (
          <Animated.View
            key={role.id}
            style={{
              opacity: fadePan[i],
              transform: [{ translateY: translateY[i] }],
            }}
          >
            <TouchableOpacity
              style={[styles.roleCard, { borderLeftColor: role.color }]}
              activeOpacity={0.75}
              onPress={() => handleSelect(role)}
            >
              <View style={[styles.iconBubble, { backgroundColor: role.color + '22' }]}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleLabel}>{role.label}</Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Footer note */}
      <Text style={styles.footerNote}>
        Powered by AI · NLP Skill Extraction · GitHub Verification
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 14,
  },
  roleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  roleDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  arrow: {
    fontSize: 28,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    letterSpacing: 0.3,
  },
});

export default RoleSelectionScreen;
