import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { EmptyState } from '../ui/EmptyState';
import { useTheme } from '../../src/context/ThemeContext';

interface TodayAppointmentsProps {
  appointments: any[];
  loading: boolean;
}

export const TodayAppointments: React.FC<TodayAppointmentsProps> = ({ appointments, loading }) => {
  const router = useRouter();
  const { isDark } = useTheme();

  // Theme colors matching Web
  const colors = {
    primary: '#5B8CFF',
    accent: '#8B5CF6',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    textPrimary: isDark ? '#F1F5F9' : '#1F2937',
    textMuted: isDark ? '#94A3B8' : '#6B7280',
    border: isDark ? '#334155' : '#E5E7EB',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    hoverBg: isDark ? '#334155' : '#F5F7FF',
  };

  if (loading) {
    return (
      <View className="p-6 rounded-3xl border items-center justify-center bg-white dark:bg-dark-surface-secondary border-gray-200 dark:border-dark-border h-48">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-base font-bold text-gray-900 dark:text-gray-100">
          Today's Appointments
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
          <Text className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">
            See All {">"}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        {(!appointments || appointments.length === 0) ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments"
            description="You have no appointments scheduled for today."
          />
        ) : (
          appointments.slice(0, 4).map((apt) => {
            const patientUser = apt.patient?.user || {};
            const firstName = patientUser.firstName || 'Patient';
            const lastName = patientUser.lastName || '';
            const initial = firstName.charAt(0).toUpperCase() || 'P';

            let displayStatus = apt.status;
            const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes('[NURSE_VITALS_RECORDED]');
            if (apt.status === 'CONFIRMED' && hasVitalsMarker) {
               displayStatus = 'READY';
            }
            if (apt.status === 'CANCELLED') {
               if (typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:')) {
                  displayStatus = 'REJECTED';
               }
            }

            const statusColors: any = {
              CONFIRMED: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
              READY: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
              PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
              CANCELLED: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400' },
              REJECTED: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
              COMPLETED: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
            };
            
            const statusStyle = statusColors[displayStatus] || statusColors.PENDING;

            return (
              <View 
                key={apt.id} 
                className="flex-row items-center justify-between p-3 mb-2 rounded-2xl bg-white dark:bg-dark-surface-secondary border border-gray-100 dark:border-dark-border"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                    <Text className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 dark:text-gray-100 text-sm" numberOfLines={1}>
                      {firstName} {lastName}
                    </Text>
                    <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-medium" numberOfLines={1}>
                      {apt.reason}
                    </Text>
                  </View>
                </View>

                <View className="items-end gap-1">
                  <View className="flex-row items-center gap-1">
                    <Clock size={10} color={colors.textMuted} />
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {apt.time}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-md border border-transparent ${statusStyle.bg}`}>
                    <Text className={`text-[9px] font-bold uppercase tracking-wider ${statusStyle.text}`}>
                      {displayStatus}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};
