import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, ROLES } from '../utils/constants';
import GradientCard from '../components/GradientCard';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';

/**
 * ResultScreen
 * Step 4: Displays screening result, GitHub verification, and final verdict
 */
const ResultScreen = ({ route, navigation }) => {
  const { role, prediction, githubResult } = route.params;
  const roleData = ROLES.find((r) => r.id === role.id) || role;

  const isApproved = prediction?.status === 'approved';
  const isGitHubValid = githubResult?.github === 'valid';
  const isSelected = isApproved; // final decision based on screening
  const skillsMatchScore = prediction?.skills_match_score ?? null;
  const extractedSkills = prediction?.skills ?? [];

  // Fade-in animation for the verdict banner
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRestart = () => {
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Verdict banner */}
      <Animated.View
        style={[
          styles.verdictBanner,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          isSelected ? styles.verdictBannerSuccess : styles.verdictBannerError,
        ]}
      >
        <Text style={styles.verdictEmoji}>{isSelected ? '🎉' : '😔'}</Text>
        <Text style={styles.verdictTitle}>
          {isSelected ? 'Candidate Selected' : 'Candidate Rejected'}
        </Text>
        <Text style={styles.verdictSubtitle}>
          {isSelected
            ? 'Great match for this position'
            : 'Does not meet requirements'}
        </Text>
      </Animated.View>

      {/* Role tag */}
      <View style={[styles.roleChip, { backgroundColor: roleData.color + '22' }]}>
        <Text style={styles.roleChipIcon}>{roleData.icon}</Text>
        <Text style={[styles.roleChipText, { color: roleData.color }]}>
          {roleData.label}
        </Text>
      </View>

      {/* Resume Screening Result */}
      <GradientCard
        style={styles.resultCard}
        accentColor={isApproved ? COLORS.success : COLORS.error}
      >
        <View style={styles.resultRow}>
          <View style={styles.resultLeft}>
            <Text style={styles.resultIcon}>{isApproved ? '✅' : '❌'}</Text>
            <View>
              <Text style={styles.resultCardTitle}>Resume Screening</Text>
              <Text style={styles.resultCardSub}>AI-powered NLP analysis</Text>
            </View>
          </View>
          <StatusBadge
            label={isApproved ? 'Approved' : 'Rejected'}
            type={isApproved ? 'success' : 'error'}
          />
        </View>

        {/* Skills match score */}
        {skillsMatchScore !== null && (
          <View style={styles.scoreSection}>
            <View style={styles.scoreLabelRow}>
              <Text style={styles.scoreLabel}>Skills Match Score</Text>
              <Text style={[styles.scoreValue, { color: isApproved ? COLORS.success : COLORS.error }]}>
                {Math.round(skillsMatchScore * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={skillsMatchScore}
              color={isApproved ? COLORS.success : COLORS.error}
              height={10}
            />
          </View>
        )}
      </GradientCard>

      {/* GitHub Verification */}
      <GradientCard
        style={styles.resultCard}
        accentColor={isGitHubValid ? COLORS.success : COLORS.warning}
      >
        <View style={styles.resultRow}>
          <View style={styles.resultLeft}>
            <Text style={styles.resultIcon}>
              {prediction?.github_username ? (isGitHubValid ? '🐙' : '🔴') : '⚠️'}
            </Text>
            <View>
              <Text style={styles.resultCardTitle}>GitHub Verification</Text>
              <Text style={styles.resultCardSub}>
                {prediction?.github_username
                  ? `@${prediction.github_username}`
                  : 'No GitHub found in resume'}
              </Text>
            </View>
          </View>
          <StatusBadge
            label={
              prediction?.github_username
                ? isGitHubValid
                  ? 'Valid'
                  : 'Invalid'
                : 'N/A'
            }
            type={
              !prediction?.github_username
                ? 'warning'
                : isGitHubValid
                ? 'success'
                : 'error'
            }
          />
        </View>
      </GradientCard>

      {/* Extracted Skills */}
      {extractedSkills.length > 0 && (
        <GradientCard style={styles.resultCard} accentColor={roleData.color}>
          <Text style={styles.skillsTitle}>🔍 Extracted Skills</Text>
          <View style={styles.skillsWrap}>
            {extractedSkills.map((skill, idx) => (
              <View
                key={idx}
                style={[styles.skillPill, { borderColor: roleData.color + '66' }]}
              >
                <Text style={[styles.skillText, { color: roleData.color }]}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </GradientCard>
      )}

      {/* Final Verdict Card */}
      <GradientCard
        style={[
          styles.finalCard,
          isSelected ? styles.finalCardSuccess : styles.finalCardError,
        ]}
      >
        <Text style={styles.finalLabel}>Final Verdict</Text>
        <Text style={styles.finalVerdict}>
          {isSelected ? '✅ SELECTED' : '❌ REJECTED'}
        </Text>
        <Text style={styles.finalNote}>
          {isSelected
            ? 'Candidate meets the role criteria. Proceed to interview.'
            : 'Candidate does not meet minimum requirements.'}
        </Text>
      </GradientCard>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.restartBtn}
        onPress={handleRestart}
        activeOpacity={0.8}
      >
        <Text style={styles.restartBtnText}>🔄  Screen Another Candidate</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  verdictBanner: {
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 4,
  },
  verdictBannerSuccess: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B98166',
  },
  verdictBannerError: {
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#EF444466',
  },
  verdictEmoji: { fontSize: 44, marginBottom: 10 },
  verdictTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  verdictSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  roleChipIcon: { fontSize: 16 },
  roleChipText: { fontSize: 13, fontWeight: '700' },
  resultCard: { gap: 0 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resultIcon: { fontSize: 28 },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  resultCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreSection: {
    marginTop: 16,
    gap: 8,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#ffffff08',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  finalCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  finalCardSuccess: {
    backgroundColor: '#064E3B',
    borderColor: '#10B98155',
  },
  finalCardError: {
    backgroundColor: '#450A0A',
    borderColor: '#EF444455',
  },
  finalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  finalVerdict: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  finalNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  restartBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  restartBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default ResultScreen;
