import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { ChevronLeft, Heart, Thermometer, Wind, Droplets, Scale, Ruler, Activity } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

export default function VitalSigns() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#10B981';

  const fetchVitals = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const patientId = user?.patientId;
      if (!patientId) {
        setError('Patient profile not linked. Please contact the clinic.');
        setLoading(false);
        return;
      }
      const res = await api.get(`/vital-signs/patient/${patientId}`);
      setVitals(res.data.vitalSigns || res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch vital signs');
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchVitals(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchVitals(false); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor, marginRight: 14 }}>
          <ChevronLeft size={20} color={textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary }}>Vital Signs</Text>
          <Text style={{ color: textSecondary, fontWeight: '500', fontSize: 13 }}>Your health measurements</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <Activity size={56} color={isDark ? '#374151' : '#D1D5DB'} />
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 18, marginTop: 16, textAlign: 'center' }}>No Vitals Available</Text>
          <Text style={{ color: textSecondary, textAlign: 'center', marginTop: 8, fontWeight: '500', lineHeight: 20 }}>{error}</Text>
        </View>
      ) : vitals.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <Activity size={56} color={isDark ? '#374151' : '#D1D5DB'} />
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 18, marginTop: 16 }}>No Records Yet</Text>
          <Text style={{ color: textSecondary, textAlign: 'center', marginTop: 8, fontWeight: '500' }}>When the nurse takes your vitals during a visit, they'll appear here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent]} tintColor={accent} />}
        >
          {vitals.map((v: any, idx: number) => (
            <View key={v.id || idx} style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, marginBottom: 14, borderWidth: 1, borderColor }}>
              {/* Date Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Activity size={18} color={accent} />
                </View>
                <View>
                  <Text style={{ fontWeight: '700', color: textPrimary, fontSize: 14 }}>
                    {v.createdAt ? format(parseISO(v.createdAt), 'MMMM dd, yyyy') : 'Assessment'}
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 11, fontWeight: '600' }}>
                    {v.createdAt ? format(parseISO(v.createdAt), 'hh:mm a') : ''}
                  </Text>
                </View>
              </View>

              {/* Vitals Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {v.bloodPressure && <VitalItem isDark={isDark} icon={Heart} color="#EF4444" label="Blood Pressure" value={v.bloodPressure} unit="mmHg" />}
                {v.heartRate && <VitalItem isDark={isDark} icon={Heart} color="#EC4899" label="Heart Rate" value={v.heartRate} unit="bpm" />}
                {v.temperature && <VitalItem isDark={isDark} icon={Thermometer} color="#F59E0B" label="Temperature" value={v.temperature} unit="°C" />}
                {v.respiratoryRate && <VitalItem isDark={isDark} icon={Wind} color="#3B82F6" label="Resp. Rate" value={v.respiratoryRate} unit="bpm" />}
                {v.oxygenSaturation && <VitalItem isDark={isDark} icon={Droplets} color="#06B6D4" label="SpO₂" value={v.oxygenSaturation} unit="%" />}
                {v.weight && <VitalItem isDark={isDark} icon={Scale} color="#8B5CF6" label="Weight" value={v.weight} unit="kg" />}
                {v.height && <VitalItem isDark={isDark} icon={Ruler} color="#10B981" label="Height" value={v.height} unit="cm" />}
              </View>

              {v.notes ? (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: borderColor }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes</Text>
                  <Text style={{ color: textSecondary, fontSize: 13, fontWeight: '500', lineHeight: 20 }}>{v.notes}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function VitalItem({ isDark, icon: Icon, color, label, value, unit }: any) {
  return (
    <View style={{ width: '47%', backgroundColor: isDark ? '#111827' : '#F9FAFB', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon size={14} color={color} />
        <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 10, fontWeight: '700', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#F9FAFB' : '#111827' }}>{value}<Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#6B7280' : '#9CA3AF' }}> {unit}</Text></Text>
    </View>
  );
}
