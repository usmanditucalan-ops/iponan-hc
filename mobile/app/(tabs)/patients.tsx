import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Search, Filter, ChevronRight, User, Plus, MapPin } from 'lucide-react-native';
import api from '../../src/services/api';
import { format, parseISO } from 'date-fns';

export default function MyPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#94A3B8' : '#6B7280';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF';

  const isProvider = ['DOCTOR', 'STAFF', 'ADMIN', 'NURSE'].includes(user?.role || '');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      // API returns { patients: [...] } or just [...] depending on endpoint
      // Adjusting based on common pattern in this project
      setPatients(res.data.patients || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchPatients(); };

  const filtered = patients.filter(p => {
    const name = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>My Patients</Text>
        <Text style={{ color: textMuted, fontWeight: '500', marginTop: 4 }}>Manage and view patient records</Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 14, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor }}>
          <Search size={20} color={textMuted} />
          <TextInput 
            placeholder="Search patients..." 
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 10, color: textPrimary, fontWeight: '500' }}
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={accent} /></View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        >
          {filtered.length === 0 ? (
            <Text style={{ textAlign: 'center', color: textMuted, marginTop: 20 }}>No patients found.</Text>
          ) : (
            filtered.map(patient => (
                <TouchableOpacity 
                key={patient.id}
                activeOpacity={0.7}
                // onPress={() => router.push(`/patient/${patient.id}`)} // Future detail view
                style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.03, shadowRadius: 8, elevation: 2 }}
                >
                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: isDark ? 'rgba(91, 140, 255, 0.15)' : '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: accent }}>{patient.user.firstName[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{patient.user.firstName} {patient.user.lastName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MapPin size={12} color={textMuted} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }} numberOfLines={1}>{patient.address || 'No address'}</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={textMuted} />
                </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Add Patient FAB */}
      {isProvider && (
        <TouchableOpacity
          onPress={() => router.push('/patients/register')}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: accent,
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
    </SafeAreaView>
  );
}
