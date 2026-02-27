import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Save, Search, Check } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { GradientButton } from '../ui/GradientButton';
import api from '../../src/services/api';

interface AddRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPatientId?: string;
  appointmentId?: string;
}

export function AddRecordModal({ visible, onClose, onSuccess, initialPatientId, appointmentId }: AddRecordModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Form State
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill patient if provided
  React.useEffect(() => {
      if (visible && initialPatientId) {
          setPatientId(initialPatientId);
          // Trigger search
          handleSearchPatient(initialPatientId);
      }
  }, [visible, initialPatientId]);

  // Styles based on theme
  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBg = isDark ? '#374151' : '#F9FAFB';

  const handleSearchPatient = async (pid?: string) => {
    const idToSearch = pid || patientId;
    if (!idToSearch?.trim()) return;
    
    setSearching(true);
    try {
        const res = await api.get(`/patients/${idToSearch}`); 
        const p = res.data.patient; 
        if (p) {
            setPatientName(`${p.user.firstName} ${p.user.lastName}`);
        } else {
            Alert.alert('Not Found', 'Patient not found with that ID');
            setPatientName('');
        }
    } catch (error) {
        Alert.alert('Error', 'Could not find patient');
        console.error(error);
    } finally {
        setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!patientId || !diagnosis || !chiefComplaint) {
      Alert.alert('Missing Fields', 'Please fill in Patient ID, Diagnosis, and Chief Complaint.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/medical-records', {
        patientId,
        diagnosis,
        chiefComplaint,
        treatment,
        notes,
      });
      
      Alert.alert('Success', 'Medical record created successfully');
      resetForm();
      onSuccess();

      // Prompt for Appointment Completion
      if (appointmentId) {
          Alert.alert(
              'Complete Appointment',
              `Mark appointment for ${patientName} as completed?`,
              [
                  { text: 'Later', onPress: onClose },
                  { 
                      text: 'Yes, Complete', 
                      onPress: async () => {
                          try {
                              await api.put(`/appointments/${appointmentId}`, { status: 'COMPLETED' });
                              Alert.alert('Success', 'Appointment marked as completed');
                          } catch (e) {
                              Alert.alert('Error', 'Failed to update appointment');
                          } finally {
                              onClose();
                          }
                      }
                  }
              ]
          );
      } else {
          onClose();
      }

    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create record');
      setLoading(false); // Only stop loading on error, let success flow handle close
    }
  };

  const resetForm = () => {
    setPatientId('');
    setPatientName('');
    setDiagnosis('');
    setChiefComplaint('');
    setTreatment('');
    setNotes('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%', width: '100%' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: borderColor }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>New Medical Record</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
            {/* Patient Search */}
            <View>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Patient ID</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholder="Enter Patient ID"
                  placeholderTextColor={textMuted}
                  style={{ flex: 1, backgroundColor: inputBg, borderRadius: 12, padding: 14, color: textPrimary, borderWidth: 1, borderColor }}
                />
                <TouchableOpacity 
                    onPress={() => handleSearchPatient()}
                    style={{ backgroundColor: '#5B8CFF', borderRadius: 12, width: 50, alignItems: 'center', justifyContent: 'center' }}
                >
                    {searching ? <ActivityIndicator color="white" /> : <Search size={20} color="white" />}
                </TouchableOpacity>
              </View>
              {patientName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                      <Check size={16} color="#10B981" />
                      <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{patientName}</Text>
                  </View>
              ) : null}
            </View>

            {/* Chief Complaint */}
            <View>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Chief Complaint</Text>
              <TextInput
                value={chiefComplaint}
                onChangeText={setChiefComplaint}
                placeholder="e.g. Severe headache, Fever"
                placeholderTextColor={textMuted}
                style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, color: textPrimary, borderWidth: 1, borderColor }}
              />
            </View>

            {/* Diagnosis */}
            <View>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Diagnosis</Text>
              <TextInput
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="e.g. Migraine, Viral Infection"
                placeholderTextColor={textMuted}
                style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, color: textPrimary, borderWidth: 1, borderColor }}
              />
            </View>

            {/* Treatment */}
            <View>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Treatment Plan</Text>
              <TextInput
                value={treatment}
                onChangeText={setTreatment}
                placeholder="Medications, rest advice..."
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, color: textPrimary, borderWidth: 1, borderColor, minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* Notes */}
            <View>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Clinical Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional observations..."
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={4}
                style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, color: textPrimary, borderWidth: 1, borderColor, minHeight: 100, textAlignVertical: 'top' }}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={{ padding: 24, borderTopWidth: 1, borderTopColor: borderColor, backgroundColor: bg }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ 
                backgroundColor: '#5B8CFF', 
                borderRadius: 16, 
                paddingVertical: 16, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#5B8CFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Save Record</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
