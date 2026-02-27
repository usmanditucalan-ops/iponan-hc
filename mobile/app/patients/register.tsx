import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ChevronLeft, User, Mail, Lock, Phone, MapPin, Calendar, Check } from 'lucide-react-native';
import { GradientButton } from '../../components/ui/GradientButton'; // Assuming we can reuse this
import api from '../../src/services/api';

export default function RegisterPatient() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     firstName: '',
     lastName: '',
     email: '',
     password: '',
     phone: '',
     address: 'Barangay Iponan, CDO',
     dateOfBirth: '',
     gender: 'MALE'
  });

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBg = isDark ? '#374151' : '#F9FAFB';

  const updateForm = (key: string, value: string) => updateFormState(key, value);
  const updateFormState = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        Alert.alert('Missing Fields', 'Please fill in all required fields.');
        return;
    }

    setLoading(true);
    try {
        await api.post('/auth/register', {
            ...formData,
            role: 'PATIENT',
            patientData: {
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender
            }
        });
        Alert.alert('Success', 'Patient registered successfully!', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    } catch (err: any) {
        Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
                <ChevronLeft size={24} color={textPrimary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Register New Patient</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
                
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Input label="First Name" icon={User} value={formData.firstName} onChangeText={(t: string) => updateForm('firstName', t)} style={{ flex: 1 }} isDark={isDark} />
                    <Input label="Last Name" value={formData.lastName} onChangeText={(t: string) => updateForm('lastName', t)} style={{ flex: 1 }} isDark={isDark} />
                </View>

                <Input label="Email Address" icon={Mail} value={formData.email} onChangeText={(t: string) => updateForm('email', t)} keyboardType="email-address" autoCapitalize="none" isDark={isDark} />
                
                <Input label="Password" icon={Lock} value={formData.password} onChangeText={(t: string) => updateForm('password', t)} secureTextEntry isDark={isDark} />
                <Text style={{ fontSize: 10, color: textMuted, marginTop: -8, marginLeft: 4 }}>Min 8 chars, 1 uppercase, 1 number</Text>

                <View style={{ flexDirection: 'row', gap: 16 }}>
                   <Input label="Gender" value={formData.gender} onChangeText={(t: string) => updateForm('gender', t)} placeholder="MALE / FEMALE" style={{ flex: 1 }} isDark={isDark} />
                   <Input label="Birth Date" icon={Calendar} value={formData.dateOfBirth} onChangeText={(t: string) => updateForm('dateOfBirth', t)} placeholder="YYYY-MM-DD" style={{ flex: 1 }} isDark={isDark} />
                </View>
                
                <Input label="Phone (Optional)" icon={Phone} value={formData.phone} onChangeText={(t: string) => updateForm('phone', t)} keyboardType="phone-pad" isDark={isDark} />
                
                <Input label="Address" icon={MapPin} value={formData.address} onChangeText={(t: string) => updateForm('address', t)} isDark={isDark} />

                <View style={{ marginTop: 24 }}>
                    <GradientButton 
                        title={loading ? "Registering..." : "Create Account"}
                        onPress={handleRegister}
                        disabled={loading}
                        icon={!loading}
                    />
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({ label, icon: Icon, style, isDark, ...props }: any) {
    return (
      <View style={style}>
        <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 2 }}>{label}</Text>
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
