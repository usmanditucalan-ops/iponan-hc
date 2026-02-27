import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { ChevronLeft, User, Mail, Phone, MapPin, Save, Lock } from 'lucide-react-native';
import { GradientButton } from '../../components/ui/GradientButton';
import api from '../../src/services/api';

export default function EditProfile() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     firstName: user?.firstName || '',
     lastName: user?.lastName || '',
     phone: user?.phone || '',
     address: user?.address || '',
  });

  const bg = isDark ? '#111827' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  
  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        await api.put('/users/profile', formData);
        await refreshUser(); // Assuming this exists or we need to implement it to update local state
        Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to update profile');
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
            <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Edit Profile</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
                
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Input label="First Name" icon={User} value={formData.firstName} onChangeText={(t: string) => updateForm('firstName', t)} style={{ flex: 1 }} isDark={isDark} />
                    <Input label="Last Name" value={formData.lastName} onChangeText={(t: string) => updateForm('lastName', t)} style={{ flex: 1 }} isDark={isDark} />
                </View>
                
                <View style={{ opacity: 0.6 }}>
                   <Input label="Email Address (Read Only)" icon={Mail} value={user?.email} editable={false} isDark={isDark} />
                </View>

                <Input label="Phone Number" icon={Phone} value={formData.phone} onChangeText={(t: string) => updateForm('phone', t)} keyboardType="phone-pad" isDark={isDark} />
                
                <Input label="Address" icon={MapPin} value={formData.address} onChangeText={(t: string) => updateForm('address', t)} isDark={isDark} />

                <View style={{ marginTop: 24 }}>
                    <GradientButton 
                        title={loading ? "Saving..." : "Save Changes"}
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

function Input({ label, icon: Icon, style, isDark, editable = true, ...props }: any) {
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
              opacity: editable ? 1 : 0.7
            }}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            editable={editable}
            {...props}
          />
        </View>
      </View>
    );
}
