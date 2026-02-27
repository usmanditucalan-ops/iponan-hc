import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { GradientButton } from '../../components/ui/GradientButton';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react-native';
import api from '../../src/services/api';

export default function RegisterPatient() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    emergencyContact: '',
    medicalHistory: ''
  });

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      // await api.post('/patients', form);
      // Mocking success
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Patient registered successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.response?.data?.error || 'Failed to register patient');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>Register New Patient</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        <Text style={{ color: textMuted, marginBottom: 24 }}>Enter patient details to create a new record.</Text>

        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input label="First Name" icon={User} value={form.firstName} onChangeText={(t: string) => setForm({...form, firstName: t})} style={{ flex: 1 }} isDark={isDark} />
            <Input label="Last Name" value={form.lastName} onChangeText={(t: string) => setForm({...form, lastName: t})} style={{ flex: 1 }} isDark={isDark} />
          </View>
          
          <Input label="Email Address (Optional)" icon={Mail} value={form.email} onChangeText={(t: string) => setForm({...form, email: t})} keyboardType="email-address" isDark={isDark} />
          <Input label="Phone Number" icon={Phone} value={form.phone} onChangeText={(t: string) => setForm({...form, phone: t})} keyboardType="phone-pad" isDark={isDark} />
          <Input label="Date of Birth" icon={Calendar} value={form.birthDate} onChangeText={(t: string) => setForm({...form, birthDate: t})} placeholder="YYYY-MM-DD" isDark={isDark} />
          <Input label="Complete Address" icon={MapPin} value={form.address} onChangeText={(t: string) => setForm({...form, address: t})} isDark={isDark} />
          
          <Input label="Emergency Contact" icon={Phone} value={form.emergencyContact} onChangeText={(t: string) => setForm({...form, emergencyContact: t})} isDark={isDark} />
          
          <View>
            <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medical History / Notes</Text>
            <TextInput 
              style={{ 
                backgroundColor: isDark ? '#374151' : '#FFFFFF', 
                borderRadius: 16, 
                padding: 16, 
                color: textPrimary, 
                height: 100, 
                textAlignVertical: 'top',
                borderWidth: 1,
                borderColor
              }} 
              placeholder="Allergies, previous conditions, etc..."
              placeholderTextColor={textMuted}
              multiline
              value={form.medicalHistory}
              onChangeText={(t) => setForm({...form, medicalHistory: t})}
            />
          </View>
        </View>

        <View style={{ marginTop: 32 }}>
          <GradientButton 
            title={loading ? 'Registering...' : 'Register Patient'} 
            onPress={handleRegister}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
