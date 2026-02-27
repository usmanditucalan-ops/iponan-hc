import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { FileText, TrendingUp, Users, DollarSign, Download, Calendar } from 'lucide-react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';

export default function Reports() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const reports = [
    { id: '1', title: 'Daily Consultation Report', icon: FileText, desc: 'Summary of all checkups today', color: '#3B82F6' },
    { id: '2', title: 'Patient Demographics', icon: Users, desc: 'Age, gender, and location distribution', color: '#8B5CF6' },
    { id: '3', title: 'Clinic Revenue', icon: DollarSign, desc: 'Financial performance summary', color: '#10B981' },
    { id: '4', title: 'Staff Performance', icon: TrendingUp, desc: 'Doctor and staff activity logs', color: '#F59E0B' },
  ];

  const handleDownload = (id: string) => {
    setLoading(id);
    setTimeout(() => {
      setLoading(null);
      alert('Report downloaded successfully');
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>Reports & Analytics</Text>
        <Text style={{ color: textMuted, fontWeight: '500', marginTop: 4 }}>Generate and view system reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        
        {/* Featured Insight */}
        <GradientBackground 
          theme="main" 
          borderRadius={24} 
          style={{ padding: 24, marginBottom: 24, shadowColor: '#5B8CFF', shadowOpacity: 0.2, shadowRadius: 10 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: 'white', opacity: 0.8, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Total Patients This Month</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 }}>1,248</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TrendingUp size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', marginLeft: 6 }}>+12% vs last month</Text>
              </View>
            </View>
            <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="white" />
            </View>
          </View>
        </GradientBackground>

        {/* Reports List */}
        <Text style={{ color: textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Available Reports</Text>
        
        <View style={{ gap: 12 }}>
          {reports.map((report) => (
            <View 
              key={report.id}
              style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor, flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: isDark ? `${report.color}20` : `${report.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <report.icon size={28} color={report.color} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{report.title}</Text>
                <Text style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{report.desc}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleDownload(report.id)}
                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDark ? '#374151' : '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading === report.id ? (
                  <ActivityIndicator size="small" color={textMuted} />
                ) : (
                  <Download size={20} color={textMuted} />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
