import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { GradientButton } from '../../components/ui/GradientButton';
import api from '../../src/services/api';

export default function ChangePassword() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     currentPassword: '',
     newPassword: '',
     confirmPassword: '',
  });

  const bg = isDark ? '#111827' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  
  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
    }
    if (formData.newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return;
    }

    setLoading(true);
    try {
        await api.post('/auth/change-password', {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });
        Alert.alert('Success', 'Password changed successfully', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to change password');
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
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Change Password</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
                
                <View style={{ marginBottom: 8 }}>
                   <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, lineHeight: 20 }}>
                       Ensure your account is secure by using a strong password.
                   </Text>
                </View>

                <Input label="Current Password" icon={Lock} value={formData.currentPassword} onChangeText={(t: string) => updateForm('currentPassword', t)} secureTextEntry isDark={isDark} />
                
                <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#E5E7EB', marginVertical: 8 }} />

                <Input label="New Password" icon={Lock} value={formData.newPassword} onChangeText={(t: string) => updateForm('newPassword', t)} secureTextEntry isDark={isDark} />
                
                <Input label="Confirm New Password" icon={Lock} value={formData.confirmPassword} onChangeText={(t: string) => updateForm('confirmPassword', t)} secureTextEntry isDark={isDark} />

                <View style={{ marginTop: 24 }}>
                    <GradientButton 
                        title={loading ? "Updating..." : "Update Password"}
                        onPress={handleSave}
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
              borderColor: isDark ? '#4B5563' : '#E5E7EB',
            }}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            {...props}
          />
        </View>
      </View>
    );
}
