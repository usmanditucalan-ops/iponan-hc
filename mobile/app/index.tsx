import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }
  }, [isLoading, isAuthenticated, isMounted]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}
