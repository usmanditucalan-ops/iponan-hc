import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';
import { ClipboardList, ChevronRight, ChevronDown, FileText, Star, AlertCircle, Pill, Stethoscope, MessageSquare, Plus } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { AddRecordModal } from '../../components/records/AddRecordModal';

export default function MedicalRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialPatientId, setInitialPatientId] = useState('');
  const [targetAppointmentId, setTargetAppointmentId] = useState('');

  const { patientId, action, appointmentId } = useLocalSearchParams();

  useEffect(() => {
    if (patientId && action === 'new') {
        setInitialPatientId(patientId as string);
        if (appointmentId) setTargetAppointmentId(appointmentId as string);
        setShowAddModal(true);
    }
  }, [patientId, action, appointmentId]);

  const { user } = useAuth();
  const { isDark } = useTheme();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#10B981';
  const detailBg = isDark ? '#111827' : '#F9FAFB';

  const isProvider = ['DOCTOR', 'STAFF', 'ADMIN', 'NURSE'].includes(user?.role || '');

  const fetchRecords = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/medical-records');
      setRecords(response.data.medicalRecords || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch medical records');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchRecords(false); };
  useEffect(() => { fetchRecords(); }, []);
  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>Medical Records</Text>
        <Text style={{ color: textMuted, fontWeight: '500', marginTop: 4 }}>Your clinical history and results</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : error ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AlertCircle color="#EF4444" size={40} />
          <Text style={{ color: '#EF4444', fontWeight: '700', marginTop: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchRecords()} style={{ marginTop: 16 }}>
            <Text style={{ color: accent, fontWeight: '700' }}>Try Refreshing</Text>
          </TouchableOpacity>
        </View>
      ) : records.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 }}>
          <ClipboardList size={64} color={isDark ? '#374151' : '#D1D5DB'} />
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 18, marginTop: 16 }}>No Records Yet</Text>
          <Text style={{ color: textMuted, textAlign: 'center', fontWeight: '500', marginTop: 8 }}>When you visit the clinic, your medical assessment will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent]} tintColor={accent} />}
        >
          {records.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <TouchableOpacity
                key={record.id}
                onPress={() => toggleExpand(record.id)}
                activeOpacity={0.8}
                style={{ backgroundColor: cardBg, borderRadius: 24, marginBottom: 14, borderWidth: 1, borderColor, overflow: 'hidden', shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.03, shadowRadius: 8, elevation: 1 }}
              >
                <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Star size={22} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: textPrimary, fontSize: 15 }} numberOfLines={1}>
                      {record.chiefComplaint || record.diagnosis || 'Checkup Result'}
                    </Text>
                    <Text style={{ color: textMuted, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                      {record.createdAt ? format(parseISO(record.createdAt), 'MMM dd, yyyy') : 'Recent'}
                    </Text>
                  </View>
                  {isExpanded ? <ChevronDown size={20} color={textMuted} /> : <ChevronRight size={20} color={textMuted} />}
                </View>

                {isExpanded && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 16 }}>
                    {record.diagnosis && (
                      <DetailRow icon={Stethoscope} color="#3B82F6" label="Diagnosis" value={record.diagnosis} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                    )}
                    {record.treatment && (
                      <DetailRow icon={FileText} color="#10B981" label="Treatment" value={record.treatment} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                    )}
                    {record.prescription && (
                      <DetailRow icon={Pill} color="#8B5CF6" label="Prescription" value={record.prescription} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                    )}
                    {record.notes && (
                      <DetailRow icon={MessageSquare} color="#F59E0B" label="Notes" value={record.notes} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                    )}
                    <DetailRow icon={FileText} color="#6366F1" label="Attachments" value={record.attachments?.length ? `${record.attachments.length} Files` : 'None'} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                    <DetailRow icon={Star} color="#10B981" label="Verification" value={record.verifiedBy ? `Verified by Dr. ${record.verifiedBy}` : 'Pending Verification'} isDark={isDark} detailBg={detailBg} textPrimary={textPrimary} textMuted={textMuted} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
      {isProvider && (
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#5B8CFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#5B8CFF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 10
          }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}

      <AddRecordModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
            fetchRecords();
        }}
        initialPatientId={initialPatientId}
        appointmentId={targetAppointmentId}
      />
    </SafeAreaView>
  );
}

function DetailRow({ icon: Icon, color, label, value, isDark, detailBg, textPrimary, textMuted }: any) {
  return (
    <View style={{ backgroundColor: detailBg, borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#374151' : '#F3F4F6', marginRight: 12 }}>
        <Icon size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
        <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 20 }}>{value}</Text>
      </View>
    </View>
  );
}
