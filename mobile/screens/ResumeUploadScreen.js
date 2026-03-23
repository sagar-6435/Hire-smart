import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, ROLES } from '../utils/constants';
import { truncateFilename, formatFileSize } from '../utils/helpers';
import GradientCard from '../components/GradientCard';

/**
 * ResumeUploadScreen
 * Step 2: User picks a PDF/DOCX and submits for analysis
 */
const ResumeUploadScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const roleData = ROLES.find((r) => r.id === role.id) || role;

  const [selectedFile, setSelectedFile] = useState(null);
  const [picking, setPicking] = useState(false);

  // Open the document picker
  const handlePickDocument = async () => {
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      console.error('DocumentPicker error:', err);
    } finally {
      setPicking(false);
    }
  };

  // Start analysis – navigate to ProcessingScreen
  const handleAnalyze = () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a resume before proceeding.');
      return;
    }
    navigation.navigate('Processing', { role, file: selectedFile });
  };

  const fileExtension = selectedFile?.name?.split('.').pop()?.toUpperCase() || '';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Selected Role Chip */}
      <View style={[styles.roleChip, { backgroundColor: roleData.color + '22' }]}>
        <Text style={styles.roleChipIcon}>{roleData.icon}</Text>
        <Text style={[styles.roleChipText, { color: roleData.color }]}>
          {roleData.label}
        </Text>
      </View>

      {/* Step label */}
      <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
      <Text style={styles.title}>Upload Resume</Text>
      <Text style={styles.subtitle}>
        Select your candidate's resume in PDF or DOCX format.
      </Text>

      {/* Drop zone / pick area */}
      <TouchableOpacity
        style={[
          styles.dropZone,
          selectedFile ? styles.dropZoneActive : {},
        ]}
        onPress={handlePickDocument}
        activeOpacity={0.8}
        disabled={picking}
      >
        {selectedFile ? (
          <View style={styles.filePreview}>
            <View style={styles.fileIconWrap}>
              <Text style={styles.fileIconText}>
                {fileExtension === 'PDF' ? '📄' : '📝'}
              </Text>
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>
                {truncateFilename(selectedFile.name, 28)}
              </Text>
              <Text style={styles.fileMeta}>
                {fileExtension} · {formatFileSize(selectedFile.size)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={handlePickDocument}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyZone}>
            <Text style={styles.uploadIcon}>📂</Text>
            <Text style={styles.uploadTitle}>Tap to Browse</Text>
            <Text style={styles.uploadSub}>PDF or DOCX · Max 10 MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Tips */}
      <GradientCard style={styles.tipsCard} accentColor={roleData.color}>
        <Text style={styles.tipsHeading}>💡 Tips for best results</Text>
        <Text style={styles.tipItem}>• Include skills, education, experience</Text>
        <Text style={styles.tipItem}>• Mention GitHub profile link if applicable</Text>
        <Text style={styles.tipItem}>• Keep format clean and readable</Text>
      </GradientCard>

      {/* Analyze button */}
      <TouchableOpacity
        style={[
          styles.analyzeBtn,
          !selectedFile && styles.analyzeBtnDisabled,
          { backgroundColor: selectedFile ? roleData.color : '#2D2D44' },
        ]}
        onPress={handleAnalyze}
        disabled={!selectedFile}
        activeOpacity={0.8}
      >
        <Text style={styles.analyzeBtnText}>
          {selectedFile ? '🚀  Analyze Resume' : 'Select a File to Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
    gap: 6,
  },
  roleChipIcon: { fontSize: 16 },
  roleChipText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
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
    marginBottom: 28,
  },
  dropZone: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  dropZoneActive: {
    borderStyle: 'solid',
    borderColor: COLORS.accent,
  },
  emptyZone: {
    alignItems: 'center',
    padding: 24,
  },
  uploadIcon: { fontSize: 40, marginBottom: 10 },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    gap: 12,
  },
  fileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconText: { fontSize: 26 },
  fileDetails: { flex: 1 },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  fileMeta: { fontSize: 12, color: COLORS.textSecondary },
  changeBtn: {
    backgroundColor: '#2D2D44',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tipsCard: { marginBottom: 28 },
  tipsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  analyzeBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
});

export default ResumeUploadScreen;
