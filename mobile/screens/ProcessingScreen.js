import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { COLORS } from '../utils/constants';

// Steps that match the EXACT sequence of operations in runAnalysis()
const STEPS = [
  { id: 0, label: 'Uploading Resume',       sublabel: 'Sending file to AI server…',          icon: '📤' },
  { id: 1, label: 'Extracting Text',         sublabel: 'Parsing PDF / DOCX content…',          icon: '📄' },
  { id: 2, label: 'Running ML Model',        sublabel: 'Predicting shortlist decision…',        icon: '🤖' },
  { id: 3, label: 'Verifying GitHub',        sublabel: 'Checking repositories & activity…',     icon: '🐙' },
  { id: 4, label: 'Generating Result',       sublabel: 'Finalizing AI decision…',               icon: '✅' },
];
import { predictResume, verifyGitHub } from '../services/api';
import { delay } from '../utils/helpers';

/**
 * ProcessingScreen
 * Step 3: Shows animated progress while calling backend APIs
 */
const ProcessingScreen = ({ route, navigation }) => {
  const { role, file } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  // Spinning ring animation
  const spinVal = useRef(new Animated.Value(0)).current;
  const pulseVal = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start continuous spin
    Animated.loop(
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse the center dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseVal, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseVal, { toValue: 0.9, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      // Step 0 – Uploading resume
      setCurrentStep(0);
      await delay(400);

      // Step 1 – Extracting text (backend is parsing the file)
      setCurrentStep(1);
      await delay(300);

      // Step 2 – Running ML model (actual API call)
      setCurrentStep(2);
      const prediction = await predictResume(file, role.id);
      await delay(400);

      // Step 3 – Verifying GitHub (only if shortlisted AND github found)
      setCurrentStep(3);
      let githubResult = { github: 'invalid' };
      if (prediction.status === 'approved' && prediction.github_username) {
        githubResult = await verifyGitHub(prediction.github_username);
      }
      await delay(300);

      // Step 4 – Generating final result
      setCurrentStep(4);
      await delay(500);

      // Navigate to ResultScreen with all data
      navigation.replace('Result', {
        role,
        prediction,
        githubResult,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to connect to the server. Please check your connection and try again.'
      );
    }
  };

  const spin = spinVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <Text style={styles.goBack} onPress={() => navigation.goBack()}>
          ← Go Back
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Spinner */}
      <View style={styles.spinnerWrap}>
        <Animated.View
          style={[styles.ring, { transform: [{ rotate: spin }] }]}
        />
        <Animated.Text
          style={[styles.brainEmoji, { transform: [{ scale: pulseVal }] }]}
        >
          🧠
        </Animated.Text>
      </View>

      <Text style={styles.mainTitle}>Analyzing Candidate</Text>
      <Text style={styles.roleText}>Role: {role.label}</Text>

      {/* Step list */}
      <View style={styles.stepsList}>
        {STEPS.map((step, idx) => {
          const isDone   = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <View key={step.id} style={styles.stepRow}>
              {/* Icon / status dot */}
              <View
                style={[
                  styles.stepDot,
                  isDone   && styles.stepDotDone,
                  isActive && styles.stepDotActive,
                ]}
              >
                {isDone   && <Text style={styles.checkMark}>✓</Text>}
                {isActive && <Text style={styles.stepIcon}>{step.icon}</Text>}
              </View>

              {/* Labels */}
              <View style={styles.stepTexts}>
                <Text
                  style={[
                    styles.stepLabel,
                    isDone   && styles.stepLabelDone,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {isActive && (
                  <Text style={styles.stepSub}>{step.sublabel}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footerNote}>
        AI-powered analysis in progress…
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  spinnerWrap: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.accent,
    borderTopColor: 'transparent',
    borderRightColor: COLORS.accentLight,
  },
  brainEmoji: {
    fontSize: 44,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 36,
  },
  stepsList: {
    width: '100%',
    gap: 18,
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepDotDone: {
    backgroundColor: COLORS.success,
  },
  stepDotActive: {
    backgroundColor: COLORS.accent,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepIcon: {
    fontSize: 14,
  },
  stepTexts: { flex: 1 },
  stepLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  stepLabelDone: {
    color: COLORS.success,
  },
  stepLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  stepSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  // Error state
  errorIcon: { fontSize: 52, marginBottom: 16 },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 10,
  },
  errorMsg: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  goBack: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
  },
});

export default ProcessingScreen;
