import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { GradientButton } from '../../components/ui/GradientButton';
import { Heart, Activity, Thermometer, User, Search, Check, Clock, Calendar, X } from 'lucide-react-native';
import api from '../../src/services/api';
import { format, parseISO } from 'date-fns';

export default function RecordVitals() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { patientId: paramPatientId } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (paramPatientId) {
        // Auto-search/fetch if patientId is passed
        const fetchPatient = async () => {
             try {
                 setLoading(true);
                 // We can re-use the search endpoint or a specific get-by-id if available.
                 // Ideally we want to set selectedPatient directly.
                 const res = await api.get(`/patients/${paramPatientId}`);
                 if (res.data.patient) {
                     const p = res.data.patient;
                     setFoundPatient(p);
                     setPatientName(`${p.user.firstName} ${p.user.lastName}`);
                     setPatientId(p.id); // Also set the input field
                 }
             } catch (err) {
                 console.log("Failed to auto-load patient stats", err);
             } finally {
                 setLoading(false);
             }
        };
        fetchPatient();
    }
  }, [paramPatientId]);

  const searchPatients = async (query: string) => {};
  const [searching, setSearching] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [foundPatient, setFoundPatient] = useState<any>(null);
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [form, setForm] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const accent = '#EC4899'; // Pink for Vitals

  const handleSearchPatient = async () => {
    if (!patientId.trim()) return;
    setSearching(true);
    setFoundPatient(null);
    setPatientName('');
    
    try {
        const res = await api.get(`/patients/${patientId}`);
        const p = res.data.patient;
        
        if (p) {
            setFoundPatient(p);
            setPatientName(`${p.user.firstName} ${p.user.lastName}`);
        } else {
            Alert.alert('Not Found', 'Patient not found');
        }
    } catch (err) {
        Alert.alert('Error', 'Could not find patient with that ID');
    } finally {
        setSearching(false);
    }
  };

  const fetchHistory = async () => {
      if (!foundPatient) return;
      setLoadingHistory(true);
      setShowHistory(true);
      try {
          const res = await api.get(`/vital-signs/patient/${foundPatient.id}`);
          setHistory(res.data.vitalSigns || []);
      } catch (err) {
          Alert.alert('Error', 'Failed to fetch history');
      } finally {
          setLoadingHistory(false);
      }
  };

  const handleSubmit = async () => {
    if (!foundPatient) {
       Alert.alert('Error', 'Please select a patient first.');
       return;
    }
    setLoading(true);
    try {
      const payload = {
        patientId: foundPatient.id,
        bloodPressure: form.bpSystolic && form.bpDiastolic ? `${form.bpSystolic}/${form.bpDiastolic}` : undefined,
        heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        oxygenSaturation: form.oxygenSaturation ? parseInt(form.oxygenSaturation) : undefined,
      };

      await api.post('/vital-signs', payload); 
      
      Alert.alert('Success', 'Vitals recorded successfully!', [
         { text: 'Done', onPress: () => {
             setForm({ bpSystolic: '', bpDiastolic: '', heartRate: '', temperature: '', weight: '', height: '', oxygenSaturation: '' });
             setPatientName('');
             setPatientId('');
             setFoundPatient(null);
         }}
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to record vitals');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>Record Vitals</Text>
        <Text style={{ color: textMuted, fontWeight: '500', marginTop: 4 }}>Enter patient measurements</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        
        {/* Patient Select */}
        <View style={{ marginBottom: 24 }}>
           <Text style={{ color: textMuted, marginBottom: 8, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Select Patient (By ID)</Text>
           <View style={{ flexDirection: 'row', gap: 10 }}>
             <View style={{ flex: 1, position: 'relative' }}>
               <View style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}><Search size={18} color={textMuted} /></View>
               <TextInput 
                 placeholder="Enter Patient ID"
                 placeholderTextColor={textMuted}
                 style={{ backgroundColor: cardBg, borderRadius: 14, paddingVertical: 14, paddingLeft: 44, paddingRight: 16, color: textPrimary, fontWeight: '500', borderWidth: 1, borderColor }}
                 value={patientId}
                 onChangeText={setPatientId}
               />
             </View>
             <TouchableOpacity onPress={handleSearchPatient} style={{ backgroundColor: accent, borderRadius: 14, width: 48, alignItems: 'center', justifyContent: 'center' }}>
                {searching ? <ActivityIndicator color="white" /> : <Search size={22} color="white" />}
             </TouchableOpacity>
           </View>
           {patientName !== '' && (
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', padding: 12, borderRadius: 12 }}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <View style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                     <Check size={14} color="white" />
                   </View>
                   <Text style={{ color: '#059669', fontWeight: '700' }}>{patientName}</Text>
               </View>
               <TouchableOpacity onPress={fetchHistory}>
                   <Text style={{ color: accent, fontWeight: '700', fontSize: 12 }}>History</Text>
               </TouchableOpacity>
             </View>
           )}
        </View>

        {/* Vitals Form */}
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="BP Systolic" icon={Activity} value={form.bpSystolic} onChangeText={(t: string) => setForm({...form, bpSystolic: t})} placeholder="120" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
            <Input label="BP Diastolic" value={form.bpDiastolic} onChangeText={(t: string) => setForm({...form, bpDiastolic: t})} placeholder="80" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="Heart Rate" icon={Heart} value={form.heartRate} onChangeText={(t: string) => setForm({...form, heartRate: t})} placeholder="72 bpm" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
            <Input label="Oxygen Sat" value={form.oxygenSaturation} onChangeText={(t: string) => setForm({...form, oxygenSaturation: t})} placeholder="98%" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="Temperature" icon={Thermometer} value={form.temperature} onChangeText={(t: string) => setForm({...form, temperature: t})} placeholder="36.5 °C" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
            <Input label="Weight (kg)" value={form.weight} onChangeText={(t: string) => setForm({...form, weight: t})} placeholder="70" keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} />
          </View>
        </View>

        <View style={{ marginTop: 32 }}>
          <GradientButton 
            title={loading ? 'Saving...' : 'Save Vitals'} 
            onPress={handleSubmit}
            disabled={loading}
            icon={!loading}
          />
        </View>

        {/* History Modal */}
        <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowHistory(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
                <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: borderColor }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Vitals History</Text>
                    <TouchableOpacity onPress={() => setShowHistory(false)} style={{ padding: 4 }}>
                        <X size={24} color={textMuted} />
                    </TouchableOpacity>
                </View>
                {loadingHistory ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={accent} size="large" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 24 }}>
                        {history.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: textMuted }}>No history found.</Text>
                        ) : (
                            history.map(v => (
                                <View key={v.id} style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text style={{ fontWeight: '700', color: textPrimary }}>{format(parseISO(v.recordedAt), 'MMM dd, yyyy')}</Text>
                                        <Text style={{ fontSize: 12, color: textMuted }}>{format(parseISO(v.recordedAt), 'hh:mm a')}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {v.bloodPressure && <Tag label="BP" value={v.bloodPressure} color="blue" />}
                                        {v.heartRate && <Tag label="HR" value={`${v.heartRate} bpm`} color="red" />}
                                        {v.temperature && <Tag label="Temp" value={`${v.temperature}°C`} color="orange" />}
                                        {v.oxygenSaturation && <Tag label="SpO2" value={`${v.oxygenSaturation}%`} color="cyan" />}
                                        {v.weight && <Tag label="Wt" value={`${v.weight} kg`} color="gray" />}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tag({ label, value, color }: any) {
    // simplified tag
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#6B7280', marginRight: 4 }}>{label}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2937' }}>{value}</Text>
        </View>
    );
}

function Input({ label, icon: Icon, style, isDark, ...props }: any) {
  return (
    <View style={style}>
      <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 2 }}>{label}</Text>
      <View style={{ position: 'relative' }}>
        {Icon && (
          <View style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}>
            <Icon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </View>
        )}
        <TextInput
          style={{ 
            backgroundColor: isDark ? '#374151' : '#FFFFFF', 
            borderRadius: 14, 
            paddingVertical: 14, 
            paddingHorizontal: 16, 
            paddingLeft: Icon ? 44 : 16,
            color: isDark ? '#F9FAFB' : '#111827', 
            fontSize: 14, 
            fontWeight: '500', 
            borderWidth: 1, 
            borderColor: isDark ? '#4B5563' : '#E5E7EB' 
          }}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          {...props}
        />
      </View>
    </View>
  );
}
