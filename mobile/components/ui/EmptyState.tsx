import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  const { isDark } = useTheme();

  return (
    <View className="items-center justify-center py-10 px-6">
      <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl items-center justify-center mb-4">
        <Icon size={32} color={isDark ? '#94A3B8' : '#6B7280'} />
      </View>
      <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-6 max-w-[250px]">
        {description}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 active:opacity-80"
        >
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
