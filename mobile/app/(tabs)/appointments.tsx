import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Modal, Share, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, ChevronDown, CheckCircle2, XCircle, AlertCircle, FileText, Share as ShareIcon, Info } from 'lucide-react-native';
import { format, isAfter, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { GradientButton } from '../../components/ui/GradientButton';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#10B981';

  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  const handleShare = async (apt: any) => {
    try {
      const message = `Appointment at Brgy. Iponan Health Center\n` +
        `Date: ${format(parseISO(apt.date), 'EEEE, MMMM dd, yyyy')}\n` +
        `Time: ${apt.time}\n` +
        `Reason: ${apt.reason}\n\n` +
        `Please arrive 15 minutes early.`;

      await Share.share({
        message,
        title: 'Appointment Details',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  /* Reschedule Logic */
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  /* Confirmation Modal */
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string, status: string, title: string, message: string, type: 'confirm' | 'cancel' | 'complete', patientId?: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleStatusUpdate = (id: string, newStatus: string, patientId?: string) => {
    let title = 'Confirm Action';
    let message = `Mark appointment as ${newStatus}?`;
    let type: 'confirm' | 'cancel' | 'complete' = 'confirm';

    if (newStatus === 'CANCELLED') {
      title = 'Cancel Appointment';
      message = 'Are you sure you want to cancel this appointment?';
      type = 'cancel';
    } else if (newStatus === 'COMPLETED') {
        title = 'Complete Appointment';
        message = 'Mark this appointment as completed?';
        type = 'complete';
    } else if (newStatus === 'CONFIRMED') {
      title = 'Confirm Appointment';
      message = 'Confirm this appointment request?';
      type = 'confirm';
    }

    setConfirmAction({ id, status: newStatus, title, message, type, patientId });
    setConfirmModalVisible(true);
  };

  const executeStatusUpdate = async () => {
    if (!confirmAction) return;
    try {
      let payload: any = { status: confirmAction.status };
      
      if (confirmAction.status === 'CANCELLED' && user?.role === 'PATIENT') {
        const reason = cancelReason.trim();
        if (!reason) {
          Alert.alert('Required', 'Please enter a reason for cancellation.');
          return;
        }

        const aptToCancel = appointments.find(a => a.id === confirmAction.id);
        const existingNotes = typeof aptToCancel?.notes === 'string' ? aptToCancel.notes : '';
        const baseNotes = existingNotes
          .split('\n')
          .filter((line: string) => !line.startsWith('CANCEL_REASON:'))
          .join('\n')
          .trim();
        
        payload.notes = [baseNotes, `CANCEL_REASON: ${reason}`].filter(Boolean).join('\n');
      }

      await api.put(`/appointments/${confirmAction.id}`, payload);
      
      // Vitals Prompt for Nurses
      if (user?.role === 'NURSE' && confirmAction.status === 'CONFIRMED' && confirmAction.patientId) {
          Alert.alert(
              'Success',
              'Appointment confirmed. Do you want to record vitals for this patient now?',
              [
                  { text: 'Later', style: 'cancel' },
                  { text: 'Record Now', onPress: () => router.push(`/vitals?patientId=${confirmAction.patientId}`) }
              ]
          );
      } else {
          Alert.alert('Success', `Appointment marked as ${confirmAction.status}`);
      }

      fetchAppointments(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update status');
    } finally {
      setConfirmModalVisible(false);
      setConfirmAction(null);
      setCancelReason('');
    }
  };

  const openReschedule = (apt: any) => {
    setSelectedAppointment(apt);
    setNewDate(apt.date.split('T')[0]);
    setNewTime(apt.time);
    setRescheduleModalVisible(true);
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment) return;
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        date: newDate,
        time: newTime,
        // Backend handles status change to PENDING for patients
      });
      Alert.alert('Success', 'Appointment rescheduled successfully');
      setRescheduleModalVisible(false);
      fetchAppointments(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to reschedule');
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchAppointments(false); };
  useEffect(() => { fetchAppointments(); }, []);

  const [filter, setFilter] = useState('Upcoming'); // All, Upcoming, Pending, Past
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('List'); // List, Calendar

  /* Doctor Actions */
  const handleDoctorAction = (apt: any) => {
    // Navigate to Records with params
    router.push({
      pathname: '/(tabs)/records',
      params: { 
        patientId: apt.patientId,
        action: 'new',
        appointmentId: apt.id
      }
    });
  };

  const filteredAppointments = appointments.filter(a => {
    const date = parseISO(`${format(parseISO(a.date), 'yyyy-MM-dd')}T${a.time}:00`);
    const isFuture = isAfter(date, new Date());
    
    if (filter === 'Upcoming') return isFuture && !['CANCELLED', 'COMPLETED'].includes(a.status);
    if (filter === 'Pending') return a.status === 'PENDING';
    if (filter === 'History') return !isFuture || ['CANCELLED', 'COMPLETED'].includes(a.status);
    return true; // All
  });

  const statusColors = (status: string) => {
    if (status === 'CONFIRMED') return { bg: isDark ? '#064E3B' : '#ECFDF5', text: '#059669' };
    if (status === 'PENDING') return { bg: isDark ? '#78350F' : '#FFFBEB', text: '#D97706' };
    if (status === 'RESCHEDULED') return { bg: isDark ? '#4C1D95' : '#F3E8FF', text: '#7C3AED' };
    return { bg: isDark ? '#7F1D1D' : '#FEF2F2', text: '#DC2626' };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>Appointments</Text>
        <GradientButton 
          title="Book" 
          onPress={() => router.push('/book')}
          size="small"
          theme="main"
          icon={true}
          style={{ shadowColor: '#5B8CFF', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}
        />
      </View>

      <View style={{ height: 20 }} />
      {/* Filters */}
      <View style={{ paddingHorizontal: 24, marginBottom: 20, zIndex: 10 }}>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: cardBg,
            borderWidth: 1.5,
            borderColor: '#5B8CFF', // Blue border like reference
          }}
        >
          <Text style={{ color: '#5B8CFF', fontWeight: '700', fontSize: 13, marginRight: 6 }}>
            {filter}
          </Text>
          <ChevronDown size={16} color="#5B8CFF" />
        </TouchableOpacity>

        <Modal
          visible={filterModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} 
            activeOpacity={1} 
            onPress={() => setFilterModalVisible(false)}
          >
            <View style={{ 
              marginTop: 180, // Approximate position below header
              marginLeft: 24,
              width: 150,
              backgroundColor: cardBg,
              borderRadius: 12,
              padding: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5
            }}>
              {['Upcoming', 'Pending', 'Past', 'All'].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => { setFilter(f); setFilterModalVisible(false); }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: filter === f ? (isDark ? 'rgba(91, 140, 255, 0.1)' : '#EFF6FF') : 'transparent',
                  }}
                >
                  <Text style={{ 
                    color: filter === f ? '#5B8CFF' : textPrimary, 
                    fontWeight: filter === f ? '700' : '500',
                    fontSize: 14
                  }}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : error ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AlertCircle color="#EF4444" size={40} />
          <Text style={{ color: '#EF4444', fontWeight: '700', marginTop: 8 }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchAppointments()} style={{ marginTop: 16 }}>
            <Text style={{ color: accent, fontWeight: '700' }}>Try Refreshing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent]} tintColor={accent} />}
        >
          <Section 
            title={filter} 
            data={filteredAppointments} 
            emptyMessage={`No ${filter.toLowerCase()} appointments.`} 
            isDark={isDark} 
            statusColors={statusColors} 
            cardBg={cardBg} 
            textPrimary={textPrimary} 
            textMuted={textMuted} 
            borderColor={borderColor} 
            accent={accent}
            onShare={handleShare}
            userRole={user?.role}
            onAction={handleStatusUpdate}
            onReschedule={openReschedule}
            onRecordVitals={(patientId: string) => router.push(`/(tabs)/vitals?patientId=${patientId}`)}
            onDoctorAction={handleDoctorAction} 
          />
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Reschedule Modal */}
      <Modal visible={rescheduleModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary, marginBottom: 20 }}>Reschedule Appointment</Text>
            
            <Text style={{ color: textMuted, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>New Date (YYYY-MM-DD)</Text>
            <TextInput 
              value={newDate} 
              onChangeText={setNewDate}
              placeholder="2024-01-01"
              placeholderTextColor={textMuted}
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', padding: 16, borderRadius: 12, color: textPrimary, marginBottom: 16 }} 
            />

            <Text style={{ color: textMuted, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>New Time (HH:MM)</Text>
            <TextInput 
              value={newTime} 
              onChangeText={setNewTime} 
              placeholder="09:00"
              placeholderTextColor={textMuted}
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', padding: 16, borderRadius: 12, color: textPrimary, marginBottom: 24 }} 
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)} style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: isDark ? '#374151' : '#F3F4F6', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmReschedule} style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: accent, alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: 'white' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 24, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: confirmAction?.type === 'cancel' ? (isDark ? '#7F1D1D' : '#FEF2F2') : (isDark ? '#064E3B' : '#ECFDF5'), alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <AlertCircle size={28} color={confirmAction?.type === 'cancel' ? '#DC2626' : '#059669'} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary, textAlign: 'center', marginBottom: 8 }}>{confirmAction?.title}</Text>
            <Text style={{ fontSize: 14, color: textMuted, textAlign: 'center', marginBottom: 24 }}>{confirmAction?.message}</Text>
            
            {confirmAction?.type === 'cancel' && user?.role === 'PATIENT' && (
              <TextInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Reason for cancellation..."
                placeholderTextColor={textMuted}
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', padding: 16, borderRadius: 12, color: textPrimary, marginBottom: 24, width: '100%', minHeight: 80 }}
                multiline
                textAlignVertical="top"
              />
            )}

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: isDark ? '#374151' : '#F3F4F6', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={executeStatusUpdate} 
                style={{ 
                  flex: 1, padding: 14, borderRadius: 14, alignItems: 'center',
                  backgroundColor: confirmAction?.type === 'cancel' ? '#EF4444' : accent
                }}
              >
                <Text style={{ fontWeight: '700', color: 'white' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, data, emptyMessage, isDark, statusColors, cardBg, textPrimary, textMuted, borderColor, accent, onShare, userRole, onAction, onReschedule, onRecordVitals, onDoctorAction }: any) {
  const VITALS_MARKER = '[NURSE_VITALS_RECORDED]';

  return (
    <View style={{ marginTop: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: textPrimary }}>{title}</Text>
        <Text style={{ color: textMuted, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{data.length} Total</Text>
      </View>

      {data.length === 0 ? (
        <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 32, borderWidth: 1, borderColor, alignItems: 'center' }}>
          <Text style={{ color: textMuted, fontWeight: '500', textAlign: 'center' }}>{emptyMessage}</Text>
        </View>
      ) : (
        data.map((apt: any) => {
          let displayStatus = apt.status;
          let displayReason = null;
          let rBg = '';
          let rText = '';

          const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes(VITALS_MARKER);
          if (apt.status === 'CONFIRMED' && hasVitalsMarker) {
            displayStatus = 'READY';
          }

          if (apt.status === 'CANCELLED') {
             const rejectionMatch = typeof apt.notes === 'string' ? apt.notes.match(/REJECTION_REASON:\s*(.*)/) : null;
             const cancelMatch = typeof apt.notes === 'string' ? apt.notes.match(/CANCEL_REASON:\s*(.*)/) : null;
             
             if (rejectionMatch) {
                displayStatus = 'REJECTED';
                displayReason = rejectionMatch[1].trim();
                rBg = isDark ? '#7F1D1D' : '#FEF2F2';
                rText = '#DC2626';
             } else if (cancelMatch) {
                displayReason = cancelMatch[1].trim();
                rBg = isDark ? '#374151' : '#F3F4F6';
                rText = isDark ? '#9CA3AF' : '#4B5563';
             }
          }

          const sc = statusColors(displayStatus === 'READY' || displayStatus === 'REJECTED' ? (displayStatus === 'READY' ? 'CONFIRMED' : 'CANCELLED') : displayStatus);
          
          // Override ready sc if needed
          if (displayStatus === 'READY') {
             sc.bg = isDark ? '#064E3B' : '#D1FAE5';
             sc.text = isDark ? '#34D399' : '#059669';
          }

          return (
            <View key={apt.id} style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, marginBottom: 14, borderWidth: 1, borderColor, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.03, shadowRadius: 8, elevation: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                  <View style={{ width: 48, height: 48, backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Calendar size={22} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: textPrimary, fontSize: 15 }} numberOfLines={2}>{apt.reason}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Clock size={12} color={textMuted} />
                      <Text style={{ color: textMuted, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>{apt.time}</Text>
                      <Text style={{ color: textMuted, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>• {format(parseISO(apt.date), 'MMM dd, yyyy')}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: sc.bg, marginRight: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: sc.text }}>{displayStatus}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => onShare(apt)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                  >
                    <ShareIcon size={14} color={textMuted} />
                  </TouchableOpacity>
                </View>
                </View>

              {displayReason && (
                 <View style={{ marginTop: 16, padding: 12, backgroundColor: rBg, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <Info size={16} color={rText} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                       <Text style={{ fontSize: 11, fontWeight: '800', color: rText, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                          {displayStatus === 'REJECTED' ? 'Reason for Rejection' : 'Reason for Cancellation'}
                       </Text>
                       <Text style={{ fontSize: 13, color: rText, fontWeight: '500' }}>{displayReason}</Text>
                    </View>
                 </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6', display: apt.status === 'CANCELLED' || apt.status === 'COMPLETED' ? 'none' : 'flex' }}>
                {userRole === 'NURSE' && (
                  <>
                    {apt.status === 'PENDING' && (
                      <TouchableOpacity onPress={() => onAction(apt.id, 'CONFIRMED', apt.patientId)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#A7F3D0' : '#059669' }}>Confirm</Text>
                      </TouchableOpacity>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <TouchableOpacity onPress={() => onRecordVitals(apt.patientId)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#4C1D95' : '#F3E8FF', borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#A78BFA' : '#7C3AED' }}>Rec. Vitals</Text>
                      </TouchableOpacity>
                    )}
                    {/* Allow Reschedule/Cancel on PENDING/CONFIRMED */}
                    {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                      <>
                        <TouchableOpacity onPress={() => onReschedule(apt)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderRadius: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#BFDBFE' : '#2563EB' }}>Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onAction(apt.id, 'CANCELLED')} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderRadius: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#FCA5A5' : '#DC2626' }}>Cancel</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}

                {userRole === 'DOCTOR' && apt.status === 'CONFIRMED' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                   <TouchableOpacity 
                      onPress={() => onDoctorAction(apt)}
                      style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                   >
                      <FileText size={12} color="#9333EA" />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#9333EA' }}>Record Entry</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => onAction(apt.id, 'COMPLETED')} style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#059669' }}>Mark Complete</Text>
                   </TouchableOpacity>
                </View>
              )}

                {userRole === 'PATIENT' && ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(apt.status) && (
                  <>
                    <TouchableOpacity onPress={() => onReschedule(apt)} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#BFDBFE' : '#2563EB' }}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onAction(apt.id, 'CANCELLED')} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#FCA5A5' : '#DC2626' }}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
