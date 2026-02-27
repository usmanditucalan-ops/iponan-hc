import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { GradientButton } from '../components/ui/GradientButton';
import { User, Mail, Lock, Phone, MapPin, Calendar, FileText, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', address: '', gender: 'OTHER', birthDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const bg = isDark ? '#111827' : '#F3F4F6';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const inputBg = isDark ? '#374151' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const accent = '#10B981';

  const handleRegister = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: formData.email, password: formData.password,
        firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone,
        patientData: { dateOfBirth: formData.birthDate, gender: formData.gender, address: formData.address },
      };
      const response = await api.post('/auth/register', payload);
      await login(response.data.token, response.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => setFormData({ ...formData, [field]: value });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ padding: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
          {/* Back Button */}
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor }}
            >
              <ChevronLeft size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#5B8CFF', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <FileText color="white" size={32} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary, marginTop: 16 }}>Create Account</Text>
            <Text style={{ color: textSecondary, fontWeight: '500' }}>Join our health clinic community</Text>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 32, padding: 28, shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 24, elevation: 4 }}>
            {error && (
              <View style={{ padding: 14, backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderRadius: 16, marginBottom: 16 }}>
                <Text style={{ color: isDark ? '#FCA5A5' : '#DC2626', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            <InputField label="First Name" icon={User} value={formData.firstName} onChangeText={(v: string) => updateField('firstName', v)} placeholder="John" isDark={isDark} />
            <InputField label="Last Name" icon={User} value={formData.lastName} onChangeText={(v: string) => updateField('lastName', v)} placeholder="Doe" isDark={isDark} />
            <InputField label="Email" icon={Mail} value={formData.email} onChangeText={(v: string) => updateField('email', v)} placeholder="name@example.com" keyboardType="email-address" isDark={isDark} />
            <InputField label="Phone" icon={Phone} value={formData.phone} onChangeText={(v: string) => updateField('phone', v)} placeholder="0912..." keyboardType="phone-pad" isDark={isDark} />
            <InputField label="Birth Date (YYYY-MM-DD)" icon={Calendar} value={formData.birthDate} onChangeText={(v: string) => updateField('birthDate', v)} placeholder="1990-01-01" isDark={isDark} />
            <InputField label="Address" icon={MapPin} value={formData.address} onChangeText={(v: string) => updateField('address', v)} placeholder="Street, City" isDark={isDark} />
            <PasswordField label="Password" icon={Lock} value={formData.password} onChangeText={(v: string) => updateField('password', v)} placeholder="••••••••" isDark={isDark} />

            <GradientButton 
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              theme="main"
              icon={true}
              style={{ marginTop: 8, shadowColor: '#5B8CFF', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
            <Text style={{ color: textSecondary, fontWeight: '500' }}>Already have an account? </Text>
            <Link href="/login"><Text style={{ color: '#5B8CFF', fontWeight: '700' }}>Sign In</Text></Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon: Icon, isDark, ...props }: any) {
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const inputBg = isDark ? '#374151' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: textSecondary, fontSize: 10, fontWeight: '700', marginBottom: 6, marginLeft: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <View style={{ position: 'absolute', left: 14, top: 12, zIndex: 1 }}>
          <Icon size={18} color={textMuted} />
        </View>
        <TextInput
          style={{ backgroundColor: inputBg, borderRadius: 14, paddingVertical: 12, paddingLeft: 42, paddingRight: 14, color: textPrimary, fontSize: 14, fontWeight: '500' }}
          placeholderTextColor={textMuted}
          autoCapitalize="none"
          {...props}
        />
      </View>
    </View>
  );
}

function PasswordField({ label, icon: Icon, isDark, ...props }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const inputBg = isDark ? '#374151' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: textSecondary, fontSize: 10, fontWeight: '700', marginBottom: 6, marginLeft: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <View style={{ position: 'absolute', left: 14, top: 12, zIndex: 1 }}>
          <Icon size={18} color={textMuted} />
        </View>
        <TextInput
          style={{ backgroundColor: inputBg, borderRadius: 14, paddingVertical: 12, paddingLeft: 42, paddingRight: 42, color: textPrimary, fontSize: 14, fontWeight: '500' }}
          placeholderTextColor={textMuted}
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          {...props}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: 14, top: 12, zIndex: 1 }}
        >
          {showPassword ? <EyeOff size={18} color={textMuted} /> : <Eye size={18} color={textMuted} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
