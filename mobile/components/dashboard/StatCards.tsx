import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

interface StatCardsProps {
  stats: any;
  loading: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, loading }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const isPatient = user?.role === 'PATIENT';

  // Theme colors matching Web
  const colors = {
    primary: '#5B8CFF',
    primaryLight: isDark ? 'rgba(91, 140, 255, 0.2)' : '#EEF2FF',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    textPrimary: isDark ? '#F1F5F9' : '#1F2937',
    textMuted: isDark ? '#94A3B8' : '#6B7280',
    border: isDark ? '#334155' : '#E5E7EB',
    successBg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
    successText: isDark ? '#34D399' : '#059669',
    neutralBg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
    neutralText: isDark ? '#60A5FA' : '#2563EB',
  };

  if (loading) {
    return (
      <View className="flex-row flex-wrap gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <View 
            key={i} 
            className="w-[48%] h-32 rounded-2xl border items-center justify-center bg-white dark:bg-dark-surface-secondary border-gray-200 dark:border-dark-border"
          >
            <ActivityIndicator color={colors.primary} />
          </View>
        ))}
      </View>
    );
  }

  const defaultCards = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients || '0',
      trend: stats?.trends?.patients || '0%',
      trendLabel: 'from last month',
      icon: Users,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: '#6366f1' // Indigo
    },
    {
      label: 'Appointments',
      value: stats?.appointmentsToday || '0',
      trend: stats?.trends?.appointments || '0 today',
      trendLabel: 'scheduled visits',
      icon: Calendar,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: '#10b981' // Emerald
    },
    {
      label: 'Records',
      value: stats?.totalRecords || '0',
      trend: stats?.trends?.records || '0%',
      trendLabel: 'total records',
      icon: FileText,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: '#8b5cf6' // Purple
    },

  ];

  const cards = (isPatient && Array.isArray(stats?.stats)) 
    ? (stats.stats as any[]).map((s: any, i: number) => ({
        label: s.label,
        value: s.value,
        trend: s.trend,
        trendLabel: '',
        icon: [Users, Calendar, FileText][i] || FileText,
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: '#3b82f6'
      })) 
    : defaultCards;

  return (
    <View className="flex-row flex-wrap justify-between mb-6">
      {cards.map((stat: any, index: number) => {
        const Icon = stat.icon;
        const trendPositive = (stat.trend?.toString() || '').startsWith('+');
        
        return (
          <View 
            key={index} 
            className="w-[48%] mb-4 rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface-secondary overflow-hidden"
            style={{ 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E5E7EB',
                shadowColor: stat.iconColor, 
                shadowOpacity: isDark ? 0 : 0.08, 
                shadowRadius: 12, 
                shadowOffset: { width: 0, height: 4 },
                elevation: 3 
            }}
          >
            {/* Gradient Background slightly visible */}
            <View className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05] ${stat.iconBg.replace('bg-', 'bg-')}`} />
            
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-2">
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" numberOfLines={1}>
                    {stat.label}
                    </Text>
                    <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                    </Text>
                </View>
                <View className={`p-2 rounded-xl ${stat.iconBg}`}>
                    <Icon size={18} color={stat.iconColor} />
                </View>
                </View>

                <View className="flex-row items-center">
                <View className={`flex-row items-center px-1.5 py-0.5 rounded-full mr-2 ${
                    trendPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                    <TrendingUp size={10} color={trendPositive ? '#16a34a' : '#2563eb'} />
                    <Text className={`text-[10px] font-bold ml-1 ${
                    trendPositive ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'
                    }`}>
                    {stat.trend}
                    </Text>
                </View>
                </View>
            </View>
          </View>
        );

      })}
    </View>
  );
};
