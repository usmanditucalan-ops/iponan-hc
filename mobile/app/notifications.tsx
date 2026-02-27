import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Bell, Check, Clock } from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export default function Notifications() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Appointment Confirmed', message: 'Your checkup with Dr. Smith is confirmed for tomorrow at 10:00 AM.', time: '2 hours ago', read: false, type: 'success' },
    { id: '2', title: 'System Update', message: 'The app has been updated to version 1.0.0. Check out the new dark mode!', time: '1 day ago', read: true, type: 'info' },
    { id: '3', title: 'Reminder', message: 'Don\'t forget to bring your previous medical records.', time: '2 days ago', read: true, type: 'warning' },
  ]);

  const colors = {
    bg: isDark ? '#0F172A' : '#F5F7FF',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    textPrimary: isDark ? '#F1F5F9' : '#1F2937',
    textSecondary: isDark ? '#94A3B8' : '#6B7280',
    border: isDark ? '#334155' : '#E5E7EB',
    accent: '#5B8CFF',
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={{ 
        backgroundColor: item.read ? colors.cardBg : (isDark ? '#172554' : '#EFF6FF'), 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.textPrimary, flex: 1 }}>{item.title}</Text>
        {!item.read && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginLeft: 8 }} />
        )}
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 10 }}>{item.message}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Clock size={12} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500', marginLeft: 4 }}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: colors.cardBg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: 14 }}>
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Notifications</Text>
        </View>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Bell size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={{ color: colors.textSecondary, marginTop: 16, fontWeight: '600' }}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
