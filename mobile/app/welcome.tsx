import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { GradientButton } from '../components/ui/GradientButton';
import { Calendar, Shield, Heart, ChevronRight, Star, FileText, Check, Sun, Moon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const { isDark, setUserPreference, userPreference } = useTheme();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF';
  const accentPurple = '#8B5CF6';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image 
            source={require('../assets/logo.png')} 
            style={{ width: 40, height: 40, marginRight: 10 }} 
            resizeMode="contain"
          />
          <Text style={{ fontSize: 18, fontWeight: '800', color: textPrimary }}>Health Clinic</Text>
        </View>

      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
          {/* Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: isDark ? 'rgba(91, 140, 255, 0.15)' : '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 20 }}>
            <Check size={14} color={accent} />
            <Text style={{ color: accent, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Trusted by Our Community</Text>
          </View>

          <Text style={{ fontSize: 34, fontWeight: '800', color: textPrimary, lineHeight: 42, letterSpacing: -0.5 }}>
            Efficient Healthcare{'\n'}for Our{' '}
            <Text style={{ color: accent }}>Community.</Text>
          </Text>

          <Text style={{ fontSize: 15, color: textSecondary, marginTop: 16, lineHeight: 24, fontWeight: '500' }}>
            Book Appointments, Access EMR, and Manage Health Records Securely — all in one modern platform built for Barangay Iponan.
          </Text>

          {/* CTAs */}
          <View style={{ flexDirection: 'row', marginTop: 28, gap: 12 }}>
            <GradientButton 
              title="Sign Up Free"
              onPress={() => router.push('/register')}
              theme="landing"
              icon={true}
              style={{ flex: 1, shadowColor: '#00dbde', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}
            />
            <TouchableOpacity 
              onPress={() => router.push('/login')}
              style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#FFFFFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: isDark ? '#374151' : '#E5E7EB' }}
            >
              <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 15 }}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 32, gap: 12 }}>
          {[
            { value: '1,200+', label: 'Patients Served' },
            { value: '98%', label: 'Satisfaction' },
            { value: '24/7', label: 'Digital Access' },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: cardBg, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: accent }}>{stat.value}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features Section */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ color: accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>✦ Features</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary, marginBottom: 20 }}>
            Everything Your Clinic Needs
          </Text>

          {[
            { icon: Calendar, color: '#14B8A6', bgColor: isDark ? '#042F2E' : '#F0FDFA', title: 'Easy Appointments', desc: 'Book clinic appointments with just a few taps. View slots, choose your time, and get instant confirmation.' },
            { icon: Shield, color: '#8B5CF6', bgColor: isDark ? '#2E1065' : '#F5F3FF', title: 'Secure EMR', desc: 'Access your Electronic Medical Records securely. Your data is encrypted with industry-standard protection.' },
            { icon: Heart, color: '#EC4899', bgColor: isDark ? '#500724' : '#FDF2F8', title: 'Community Health', desc: 'Track immunizations, manage prenatal care, and support barangay-level wellness initiatives.' },
          ].map((feature) => (
            <View key={feature.title} style={{ backgroundColor: cardBg, padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor, flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 48, height: 48, backgroundColor: feature.bgColor, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <feature.icon size={22} color={feature.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary, marginBottom: 6 }}>{feature.title}</Text>
                <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 20, fontWeight: '500' }}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ backgroundColor: isDark ? '#1a2332' : '#F0FDF4', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: isDark ? '#1f3a2a' : '#D1FAE5' }}>
            <Text style={{ fontSize: 32, color: accent, fontWeight: '300', marginBottom: 8 }}>"</Text>
            <Text style={{ fontSize: 14, color: textSecondary, lineHeight: 22, fontWeight: '500', fontStyle: 'italic' }}>
              Thank you to this amazing system. It has completely changed how I manage my family's health appointments. Booking is so easy, and I love that I can view my medical records anytime.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <View style={{ width: 40, height: 40, backgroundColor: accent, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>SN</Text>
              </View>
              <View>
                <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 14 }}>Sean Nelson</Text>
                <Text style={{ color: textMuted, fontSize: 11, fontWeight: '600' }}>Patient • Brgy. Iponan Resident</Text>
                <View style={{ flexDirection: 'row', marginTop: 4, gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} color="#FACC15" fill="#FACC15" />)}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Banner */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ backgroundColor: accent, padding: 28, borderRadius: 28, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}>Ready to Get Started?</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20, fontWeight: '500', lineHeight: 20 }}>
              Join hundreds of families in Barangay Iponan who trust our clinic.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/register')}
              style={{ backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 }}
            >
              <Text style={{ color: accent, fontWeight: '700', fontSize: 15 }}>Create Free Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 24, marginTop: 32, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 24, height: 24, backgroundColor: accent, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>+</Text>
            </View>
            <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 14 }}>Barangay Iponan Health Clinic</Text>
          </View>
          <Text style={{ color: textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' }}>
            © 2026 Barangay Iponan Health Clinic.{'\n'}Powered by EMR System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
