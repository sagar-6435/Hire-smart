import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * ProgressBar – animated fill bar
 * @param {number} progress - 0 to 1
 * @param {string} color - fill color
 * @param {boolean} showLabel
 */
const ProgressBar = ({ progress = 0, color = COLORS.accent, showLabel = false, height = 8 }) => {
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthInterpolate, backgroundColor: color, height },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#2D2D44',
    borderRadius: 100,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 100,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;
