import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { ChevronLeft, User, Lock, Save, Eye, EyeOff } from 'lucide-react-native';

export default function Settings() {
  const { user, logout } = useAuth();
  const { isDark, userPreference, setUserPreference } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const inputBg = isDark ? '#374151' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF';

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.patch('/users/profile', {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert('Success', 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const tabs = [
    { icon: User, label: 'Profile' },
    { icon: Lock, label: 'Security' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor, marginRight: 14 }}>
          <ChevronLeft size={20} color={textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary }}>Settings</Text>
          <Text style={{ color: textSecondary, fontWeight: '500', fontSize: 13 }}>Personalize your experience</Text>
        </View>
      </View>

      {/* Tab Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 8 }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.label;
          return (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveTab(tab.label)}
              style={{
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
                backgroundColor: isActive ? accent : cardBg, borderWidth: 1, borderColor: isActive ? accent : borderColor,
              }}
            >
              <tab.icon size={16} color={isActive ? '#FFFFFF' : textSecondary} />
              <Text style={{ marginLeft: 8, fontWeight: '700', fontSize: 13, color: isActive ? '#FFFFFF' : textSecondary }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}>
        {activeTab === 'Profile' && (
          <View style={{ backgroundColor: cardBg, borderRadius: 28, padding: 24, borderWidth: 1, borderColor }}>
            {/* Avatar */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 80, height: 80, backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ color: accent, fontSize: 28, fontWeight: '800' }}>{(user?.firstName || 'P')[0]}</Text>
              </View>
              <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 16 }}>{user?.firstName} {user?.lastName}</Text>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '600' }}>{user?.email}</Text>
            </View>

            <SettingsInput label="First Name" value={profileForm.firstName} onChangeText={(v: string) => setProfileForm({...profileForm, firstName: v})} isDark={isDark} />
            <SettingsInput label="Last Name" value={profileForm.lastName} onChangeText={(v: string) => setProfileForm({...profileForm, lastName: v})} isDark={isDark} />
            <SettingsInput label="Email" value={profileForm.email} editable={false} isDark={isDark} />
            <SettingsInput label="Phone" value={profileForm.phone} onChangeText={(v: string) => setProfileForm({...profileForm, phone: v})} isDark={isDark} keyboardType="phone-pad" />

            <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
              <TouchableOpacity
                onPress={() => setProfileForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: (user as any)?.phone || '' })}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
              >
                <Text style={{ fontWeight: '700', color: textPrimary }}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} disabled={loading} style={{ flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: accent, opacity: loading ? 0.6 : 1 }}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'Security' && (
          <View style={{ backgroundColor: cardBg, borderRadius: 28, padding: 24, borderWidth: 1, borderColor }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: textPrimary, marginBottom: 4 }}>Change Password</Text>
            <Text style={{ color: textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 20 }}>Update your password to keep your account secure</Text>

            <PasswordField label="Current Password" value={passwordForm.currentPassword} onChangeText={(v: string) => setPasswordForm({...passwordForm, currentPassword: v})} show={showPasswords.current} onToggle={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} isDark={isDark} />
            <PasswordField label="New Password" value={passwordForm.newPassword} onChangeText={(v: string) => setPasswordForm({...passwordForm, newPassword: v})} show={showPasswords.new} onToggle={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} isDark={isDark} />
            <PasswordField label="Confirm Password" value={passwordForm.confirmPassword} onChangeText={(v: string) => setPasswordForm({...passwordForm, confirmPassword: v})} show={showPasswords.confirm} onToggle={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} isDark={isDark} />

            <TouchableOpacity onPress={handleChangePassword} disabled={loading} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: accent, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}



        {/* App Info */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ color: textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Barangay Iponan Health Clinic</Text>
          <Text style={{ color: textMuted, fontSize: 10, fontWeight: '600', marginTop: 4 }}>Version 1.0.0 • Build 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsInput({ label, isDark, ...props }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 2 }}>{label}</Text>
      <TextInput
        style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, color: isDark ? '#F9FAFB' : '#111827', fontSize: 14, fontWeight: '500', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E5E7EB' }}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        {...props}
      />
    </View>
  );
}

function PasswordField({ label, value, onChangeText, show, onToggle, isDark }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 2 }}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, paddingRight: 48, color: isDark ? '#F9FAFB' : '#111827', fontSize: 14, fontWeight: '500', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E5E7EB' }}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          placeholder="••••••••"
        />
        <TouchableOpacity onPress={onToggle} style={{ position: 'absolute', right: 14, top: 14 }}>
          {show ? <EyeOff size={18} color={isDark ? '#6B7280' : '#9CA3AF'} /> : <Eye size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
