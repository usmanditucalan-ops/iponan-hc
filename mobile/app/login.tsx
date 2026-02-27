import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { GradientButton } from '../components/ui/GradientButton';
import { Mail, Lock, FileText, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.token, response.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ padding: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
          {/* Back Button */}
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/welcome');
                }
              }}
              style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor }}
            >
              <ChevronLeft size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Image 
              source={require('../assets/logo.png')} 
              style={{ width: 100, height: 100, marginBottom: 16 }} 
              resizeMode="contain"
            />
            <Text style={{ fontSize: 28, fontWeight: '800', color: textPrimary, marginTop: 20, textAlign: 'center' }}>Health Clinic</Text>
            <Text style={{ color: textSecondary, fontWeight: '500', textAlign: 'center', marginTop: 6 }}>Sign in to your account</Text>
          </View>

          {/* Form Card */}
          <View style={{ backgroundColor: cardBg, borderRadius: 32, padding: 28, shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 24, elevation: 4 }}>
            {error && (
              <View style={{ padding: 16, backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderWidth: 1, borderColor: isDark ? '#991B1B' : '#FEE2E2', borderRadius: 16, marginBottom: 20 }}>
                <Text style={{ color: isDark ? '#FCA5A5' : '#DC2626', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8, marginLeft: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</Text>
              <View style={{ position: 'relative' }}>
                <View style={{ position: 'absolute', left: 16, top: 14, zIndex: 1 }}>
                  <Mail size={20} color={textMuted} />
                </View>
                <TextInput
                  style={{ backgroundColor: inputBg, borderRadius: 16, paddingVertical: 14, paddingLeft: 48, paddingRight: 16, color: textPrimary, fontSize: 14, fontWeight: '500' }}
                  placeholder="name@example.com"
                  placeholderTextColor={textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8, marginLeft: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</Text>
              <View style={{ position: 'relative' }}>
                <View style={{ position: 'absolute', left: 16, top: 14, zIndex: 1 }}>
                  <Lock size={20} color={textMuted} />
                </View>
                <TextInput
                  style={{ backgroundColor: inputBg, borderRadius: 16, paddingVertical: 14, paddingLeft: 48, paddingRight: 48, color: textPrimary, fontSize: 14, fontWeight: '500' }}
                  placeholder="••••••••"
                  placeholderTextColor={textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 16, top: 14, zIndex: 1 }}
                >
                  {showPassword ? <EyeOff size={20} color={textMuted} /> : <Eye size={20} color={textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignItems: 'flex-end', paddingHorizontal: 4, marginBottom: 24 }}>
              <Text style={{ color: '#5B8CFF', fontSize: 12, fontWeight: '700' }}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In */}
            <GradientButton 
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              theme="main"
              icon={true}
              style={{ shadowColor: '#5B8CFF', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Text style={{ color: textSecondary, fontWeight: '500' }}>Don't have an account? </Text>
            <Link href="/register">
              <Text style={{ color: '#5B8CFF', fontWeight: '700' }}>Create Account</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
