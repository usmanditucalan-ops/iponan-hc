import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';

export const MiniCalendar = () => {
  const { isDark } = useTheme();
  
  const colors = {
    primary: '#5B8CFF',
    accent: '#8B5CF6',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    textPrimary: isDark ? '#F1F5F9' : '#1F2937',
    textMuted: isDark ? '#94A3B8' : '#6B7280',
    border: isDark ? '#334155' : '#E5E7EB',
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 30 }, (_, i) => i + 1); // Mock 30 days

  return (
    <View 
      className="mb-6 bg-white dark:bg-dark-surface-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 shadow-sm"
      style={{ 
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#E5E7EB'
      }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Calendar
        </Text>
        <View className="flex-row items-center gap-4">
          <Text className="text-xs font-bold text-gray-900 dark:text-gray-100">
            February 2026
          </Text>
          <View className="flex-row items-center gap-1">
            <TouchableOpacity className="p-1 rounded bg-gray-50 dark:bg-dark-surface-tertiary">
              <ChevronLeft size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity className="p-1 rounded bg-gray-50 dark:bg-dark-surface-tertiary">
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {days.map(day => (
          <Text key={day} className="w-[13%] text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-4">
            {day}
          </Text>
        ))}
        {dates.map(date => {
          const isToday = date === 16; // Mock specific date
          const hasApt = [3, 8, 12, 16, 18, 22, 25].includes(date);
          
          return (
            <TouchableOpacity 
              key={date} 
              className={`w-[13%] aspect-square items-center justify-center rounded-md mb-2 relative ${
                isToday ? 'bg-primary dark:bg-blue-600' : ''
              }`}
            >
              <Text className={`text-xs font-bold ${
                isToday ? 'text-white' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {date}
              </Text>
              {hasApt && !isToday && (
                <View className="absolute bottom-1 w-1 h-1 bg-primary dark:bg-blue-400 rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row items-center gap-4 pt-4 border-t border-gray-100 dark:border-dark-border mt-2">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 bg-primary dark:bg-blue-400 rounded-full" />
          <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
            Has appointments
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-4 h-4 bg-primary dark:bg-blue-600 rounded-sm" />
          <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
            Today
          </Text>
        </View>
      </View>
    </View>
  );
};
