import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Switch } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Mail, MapPin, Activity, TrendingUp, Sun, Moon, User } from 'lucide-react-native';

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF';

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { 
        await logout(); 
        router.replace('/login'); 
      } },
    ]);
  };

  const displayName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Patient');
  const initials = (user?.firstName || user?.name || 'P')[0].toUpperCase();
  const roleLabel = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Patient';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Profile Card */}
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <View style={{ width: 96, height: 96, backgroundColor: isDark ? 'rgba(91, 140, 255, 0.15)' : '#EEF2FF', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 4, borderColor: cardBg, shadowColor: accent, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 }}>
            <Text style={{ color: accent, fontSize: 32, fontWeight: '800' }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>{displayName}</Text>
          <Text style={{ color: textMuted, fontWeight: '500', marginTop: 4 }}>{user?.email || 'patient@example.com'}</Text>
          
          <View style={{ backgroundColor: isDark ? 'rgba(91, 140, 255, 0.15)' : '#EEF2FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, marginTop: 12 }}>
            <Text style={{ color: accent, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{roleLabel}</Text>
          </View>
          
          <TouchableOpacity style={{ marginTop: 16 }}>
            <Text style={{ color: accent, fontWeight: '600', fontSize: 14 }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Info Grid */}
        <View style={{ flexDirection: 'row', marginBottom: 24, gap: 10 }}>
          <InfoCard icon={Mail} color="#5B8CFF" bgColor={isDark ? 'rgba(91, 140, 255, 0.15)' : '#EEF2FF'} label="Email" value={user?.email ? 'Verified' : 'Not Set'} isDark={isDark} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} borderColor={borderColor} />
          <InfoCard icon={Shield} color="#8B5CF6" bgColor={isDark ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF'} label="Role" value={roleLabel} isDark={isDark} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} borderColor={borderColor} />
          <InfoCard icon={MapPin} color="#F59E0B" bgColor={isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB'} label="Status" value="Active" isDark={isDark} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} borderColor={borderColor} />
        </View>

        {/* Options */}
        <View style={{ backgroundColor: cardBg, borderRadius: 32, padding: 20, borderWidth: 1, borderColor, marginBottom: 24, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.03, shadowRadius: 8, elevation: 1 }}>
          <OptionRow 
            icon={User} 
            title="Edit Profile" 
            color="#5B8CFF" 
            isDark={isDark} 
            textPrimary={textPrimary} 
            textMuted={textMuted} 
            borderColor={borderColor} 
            onPress={() => router.push('/profile/edit')}
          />
          <OptionRow 
            icon={Shield} 
            title="Security" 
            color="#8B5CF6" 
            isDark={isDark} 
            textPrimary={textPrimary} 
            textMuted={textMuted} 
            borderColor={borderColor} 
            onPress={() => router.push('/profile/security')}
          />
          <OptionRow 
            icon={Bell} 
            title="Notifications" 
            color="#F59E0B" 
            isDark={isDark} 
            textPrimary={textPrimary} 
            textMuted={textMuted} 
            borderColor={borderColor} 
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in the next update.')}
          />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  {isDark ? <Moon size={20} color="#6B7280" /> : <Sun size={20} color="#F59E0B" />}
                </View>
                <Text style={{ fontWeight: '700', color: textPrimary, fontSize: 15 }}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme} 
                trackColor={{ false: '#E5E7EB', true: '#5B8CFF' }}
                thumbColor={'#FFFFFF'}
              />
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={{ fontWeight: '700', color: '#EF4444', fontSize: 15 }}>Sign Out</Text>
            </View>
            <ChevronRight size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: textMuted, fontSize: 10, fontWeight: '600' }}>Barangay Iponan Health Clinic • v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ icon: Icon, color, bgColor, label, value, isDark, cardBg, textPrimary, textMuted, borderColor }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: cardBg, padding: 16, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.03, shadowRadius: 8, elevation: 1 }}>
      <View style={{ width: 40, height: 40, backgroundColor: bgColor, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Icon size={18} color={color} />
      </View>
      <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 12, marginTop: 4 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function OptionRow({ icon: Icon, title, color, onPress, isDark, textPrimary, textMuted, borderColor }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Icon size={20} color={color} />
        </View>
        <Text style={{ fontWeight: '700', color: textPrimary, fontSize: 15 }}>{title}</Text>
      </View>
      <ChevronRight size={18} color={textMuted} />
    </TouchableOpacity>
  );
}
