import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Activity, FileText, Users, ChevronRight, UserPlus } from 'lucide-react-native';
import { format, parseISO, isToday } from 'date-fns';

import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

// Components
import { StatCards } from '../../components/dashboard/StatCards';
import { TodayAppointments } from '../../components/dashboard/TodayAppointments';
import { MiniCalendar } from '../../components/dashboard/MiniCalendar';

import { GradientBackground } from '../../components/ui/GradientBackground';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Theme colors
  const colors = {
    bg: isDark ? '#0F172A' : '#F5F7FF', // bg-page / surface-primary
    textPrimary: isDark ? '#F1F5F9' : '#1F2937',
    textMuted: isDark ? '#94A3B8' : '#6B7280',
    accent: '#5B8CFF', // Primary Blue
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E5E7EB',
  };

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Fetch dashboard stats
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.log('Failed to fetch stats', err);
        setStats(null); 
      }

      // Fetch appointments
      try {
        const apptRes = await api.get('/appointments');
        const appts = apptRes.data.appointments || apptRes.data || [];
        setAppointments(appts);
        
        const today = appts.filter((a: any) => {
          try { return isToday(parseISO(a.date)); } catch { return false; }
        });
        setTodayAppointments(today);
      } catch (err) {
        console.log('Failed to fetch appointments', err);
        setAppointments([]); 
        setTodayAppointments([]); 
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  const onRefresh = () => { 
    setRefreshing(true); 
    fetchDashboardData(false); 
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const role = user?.role || 'PATIENT';

  const renderDashboardContent = () => {
    if (!user) return null;

    switch (role) {
      case 'ADMIN':
        return (
          <View>
            <View className="mb-4 bg-white dark:bg-dark-surface-secondary p-3 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
              <Text className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">Quick Actions</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                   onPress={() => router.push('/(tabs)/users')} 
                   className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl items-center flex-row justify-center gap-2"
                >
                  <UserPlus size={16} color="#3B82F6" />
                  <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">Add Doctor</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => router.push('/(tabs)/users?tab=staff')}
                   className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl items-center flex-row justify-center gap-2"
                >
                  <Users size={16} color="#8B5CF6" />
                  <Text className="text-purple-600 dark:text-purple-400 font-bold text-xs">Add Staff</Text>
                </TouchableOpacity>
              </View>
            </View>

            <StatCards stats={stats} loading={loading} />
            <TodayAppointments appointments={todayAppointments} loading={loading} />

          </View>
        );

      case 'DOCTOR':
        return (
          <View>

            <StatCards stats={stats} loading={loading} />
            <TodayAppointments appointments={todayAppointments} loading={loading} />
            <MiniCalendar />

          </View>
        );

      case 'STAFF':
      case 'NURSE':
        return (
          <View>
            <View className="mb-4 bg-white dark:bg-dark-surface-secondary p-3 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
              <Text className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">Quick Actions</Text>
              <View className="gap-2">
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/vitals')}
                    className="flex-1 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl items-center border border-pink-100 dark:border-pink-900/30 flex-row justify-center gap-2"
                    >
                    <Activity size={16} color="#EC4899" />
                    <Text className="font-bold text-pink-600 dark:text-pink-400 text-xs">Vitals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/records')} 
                    className="flex-1 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl items-center border border-indigo-100 dark:border-indigo-900/30 flex-row justify-center gap-2"
                    >
                    <FileText size={16} color="#6366F1" />
                    <Text className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">Notes</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/appointments')}
                  className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex-row items-center justify-center border border-cyan-100 dark:border-cyan-900/30 gap-2"
                >
                  <Users size={16} color="#06B6D4" />
                  <Text className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">Manage Queue</Text>
                </TouchableOpacity>
              </View>
            </View>

            <StatCards stats={stats} loading={loading} />
            <TodayAppointments appointments={todayAppointments} loading={loading} />

          </View>
        );

      case 'PATIENT':
        return (
          <View>
            {/* Book Now CTA - Priority */}
            <TouchableOpacity 
              onPress={() => router.push('/book')}
              className="mb-4 w-full bg-blue-600 dark:bg-blue-500 rounded-2xl p-4 shadow-sm flex-row items-center justify-between"
              activeOpacity={0.9}
            >
              <View>
                <Text className="text-white font-bold text-base">Book Appointment</Text>
                <Text className="text-blue-100 text-xs">Schedule a visit with our doctors</Text>
              </View>
              <View className="bg-white/20 p-2 rounded-full">
                 <ChevronRight size={20} color="white" />
              </View>
            </TouchableOpacity>

            <StatCards stats={stats} loading={loading} />
            
            <TodayAppointments appointments={todayAppointments} loading={loading} />
            <MiniCalendar />

          </View>
        );

      default:
        return (
          <View className="items-center justify-center py-20">
             <Text className="text-red-500 font-bold">Role Not Recognized</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text 
              className="text-gray-500 dark:text-gray-400 font-medium text-xs"
              style={{ color: isDark ? '#94A3B8' : '#6B7280' }}
            >
              Hello,
            </Text>
            <Text 
              className="text-xl font-bold text-gray-900 dark:text-gray-100" 
              numberOfLines={1} 
              ellipsizeMode="tail"
              style={{ color: isDark ? '#F1F5F9' : '#111827' }}
            >
              {firstName}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 bg-white dark:bg-dark-surface-secondary rounded-full items-center justify-center border border-gray-200 dark:border-dark-border"
          >
            <Bell size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {renderDashboardContent()}

      </ScrollView>
    </SafeAreaView>
  );
}
