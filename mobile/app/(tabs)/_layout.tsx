import { Tabs } from 'expo-router';
import { LayoutDashboard, Calendar, ClipboardList, User, Users, FileText, Activity, UserPlus } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const role = user?.role;

  const commonScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#5B8CFF', // Primary Blue
    tabBarInactiveTintColor: isDark ? '#94A3B8' : '#9CA3AF',
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1E293B' : '#F3F4F6', // Dark surface-secondary
      elevation: 8,
      shadowColor: '#5B8CFF', // Blue shadow
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      height: Platform.OS === 'ios' ? 88 : 68,
      paddingBottom: Platform.OS === 'ios' ? 28 : 12,
      paddingTop: 8,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF', // Dark surface-primary
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700' as '700',
      letterSpacing: 0.3,
    },
  };

  const getTabOptions = (icon: any, label: string) => ({
    title: label,
    tabBarIcon: ({ color, focused }: any) => (
      <View style={{ 
        backgroundColor: focused ? (isDark ? 'rgba(91, 140, 255, 0.2)' : '#EFF6FF') : 'transparent', 
        paddingHorizontal: 16, 
        paddingVertical: 6, 
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon({ size: 22, color })}
      </View>
    ),
  });

  return (
    <Tabs screenOptions={commonScreenOptions}>
      {/* 1. Dashboard (Index) - Always First */}
      <Tabs.Screen
        name="index"
        options={{
          ...getTabOptions((props: any) => <LayoutDashboard {...props} />, role === 'PATIENT' ? 'Home' : 'Dashboard')
        }}
      />

      {/* 2. Admin Tabs */}
      <Tabs.Screen
        name="users"
        options={{
          href: role === 'ADMIN' ? undefined : null,
          ...getTabOptions((props: any) => <Users {...props} />, 'Users')
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: role === 'ADMIN' ? undefined : null,
          ...getTabOptions((props: any) => <FileText {...props} />, 'Reports')
        }}
      />

      {/* 3. Nurse Tabs */}
      <Tabs.Screen
        name="register"
        options={{
          href: role === 'NURSE' ? undefined : null,
          ...getTabOptions((props: any) => <UserPlus {...props} />, 'Register')
        }}
      />

      {/* 4. Shared Tabs (Appointments, Patients, Vitals, Records) */}
      <Tabs.Screen
        name="appointments"
        options={{
          href: ['DOCTOR', 'NURSE', 'PATIENT'].includes(role || '') || !role ? undefined : null,
          ...getTabOptions((props: any) => <Calendar {...props} />, 'Appointments')
        }}
      />

      <Tabs.Screen
        name="patients"
        options={{
          href: role === 'DOCTOR' ? undefined : null,
          ...getTabOptions((props: any) => <Users {...props} />, 'Patients')
        }}
      />

      <Tabs.Screen
        name="vitals"
        options={{
          href: role === 'NURSE' ? undefined : null,
          ...getTabOptions((props: any) => <Activity {...props} />, 'Vitals')
        }}
      />

      <Tabs.Screen
        name="records"
        options={{
          href: ['DOCTOR', 'PATIENT'].includes(role || '') || !role ? undefined : null,
          ...getTabOptions((props: any) => <ClipboardList {...props} />, role === 'PATIENT' || !role ? 'EMR' : 'Records')
        }}
      />

      {/* 5. Profile - Always Last */}
      <Tabs.Screen
        name="profile"
        options={{
          ...getTabOptions((props: any) => <User {...props} />, role === 'ADMIN' ? 'Settings' : 'Profile')
        }}
      />
    </Tabs>
  );
}
