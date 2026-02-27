import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronLeft, Users, Calendar, Clock, Map, TrendingUp, PieChart, Download, FileText } from 'lucide-react-native';
import Svg, { Rect, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function Reports() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#10B981';

  // Mock data for Admin Report
  const demographicData = [
    { label: 'Adults', value: 85, color: '#4f46e5' },
    { label: 'Seniors', value: 42, color: '#f59e0b' },
    { label: 'Children', value: 63, color: '#10b981' },
    { label: 'Infants', value: 28, color: '#ef4444' },
    { label: 'Teens', value: 35, color: '#8b5cf6' },
  ];

  const handleExport = (type: 'CSV' | 'PDF') => {
    Alert.alert('Export', `${type} export initiated. Check your email/downloads.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor, marginRight: 14 }}>
            <ChevronLeft size={20} color={textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary }}>Reports</Text>
            <Text style={{ color: textSecondary, fontWeight: '500', fontSize: 13 }}>Analytics & Metrics</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => handleExport('CSV')} style={{ padding: 10, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor }}>
            <Download size={20} color={textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleExport('PDF')} style={{ padding: 10, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor }}>
            <FileText size={20} color={textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Stat Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {[
            { icon: Users, label: 'New Patients', val: '128', trend: '+12%', color: '#3B82F6', bgColor: isDark ? '#1E3A5F' : '#EFF6FF' },
            { icon: Calendar, label: 'Appointments', val: '432', trend: '+5%', color: '#6366F1', bgColor: isDark ? '#312E81' : '#EEF2FF' },
            { icon: Clock, label: 'Avg Waiting', val: '14m', trend: '-2m', color: '#F59E0B', bgColor: isDark ? '#78350F' : '#FFFBEB' },
            { icon: Map, label: 'Outreach', val: '12', trend: '+2', color: '#EF4444', bgColor: isDark ? '#7F1D1D' : '#FEF2F2' },
          ].map((stat, i) => (
            <View key={i} style={{ width: '47%', backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
              <View style={{ width: 40, height: 40, backgroundColor: stat.bgColor, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, marginRight: 6 }}>{stat.val}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: stat.trend.includes('+') ? accent : '#F59E0B', marginBottom: 4 }}>{stat.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chart Section */}
        <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Patient Demographics</Text>
            <TouchableOpacity onPress={() => setChartType(chartType === 'bar' ? 'donut' : 'bar')} style={{ padding: 8, backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 10 }}>
              {chartType === 'bar' ? <PieChart size={18} color={textMuted} /> : <TrendingUp size={18} color={textMuted} />}
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', minHeight: 220, justifyContent: 'center' }}>
            {chartType === 'bar' ? (
              <BarChartSVG height={200} width={300} data={demographicData} isDark={isDark} />
            ) : (
              <DonutChartSVG size={180} data={demographicData} isDark={isDark} />
            )}
          </View>
        </View>

        {/* Forecast Section */}
        <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TrendingUp size={18} color={accent} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary, marginLeft: 8 }}>Forecast</Text>
          </View>
          <Text style={{ color: textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 20, lineHeight: 18 }}>
            Based on current trends, we expect a <Text style={{ fontWeight: '700', color: accent }}>15% increase</Text> in appointments for the next quarter.
          </Text>
          {[
            { label: 'Routine Checkups', val: 75, color: '#10B981' },
            { label: 'Follow-ups', val: 45, color: '#F59E0B' },
            { label: 'Vaccinations', val: 90, color: '#3B82F6' },
          ].map(item => (
            <View key={item.label} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: textPrimary }}>{item.val}%</Text>
              </View>
              <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${item.val}%`, backgroundColor: item.color, borderRadius: 999 }} />
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Custom SVG Bar Chart Re-implementation for React Native
const BarChartSVG = ({ width, height, data, isDark }: any) => {
  const maxValue = Math.max(...data.map((d: any) => d.value), 1);
  const barWidth = 32;
  const gap = 20;
  // Dynamic chart width based on data
  const totalWidth = data.length * (barWidth + gap);
  const startX = (width - totalWidth) / 2; // Center chart

  return (
    <Svg width={width} height={height}>
      {/* Grid Lines */}
      {[0, 0.5, 1].map((frac) => {
        const y = height - (frac * (height - 40)) - 20;
        return (
          <G key={frac}>
            <Rect x="0" y={y} width={width} height="1" fill={isDark ? '#374151' : '#F3F4F6'} />
            <SvgText x="10" y={y + 12} fontSize="10" fill={isDark ? '#6B7280' : '#9CA3AF'} fontWeight="bold">{Math.round(frac * maxValue)}</SvgText>
          </G>
        );
      })}

      {data.map((d: any, i: number) => {
        const barHeight = (d.value / maxValue) * (height - 40);
        const x = startX + i * (barWidth + gap);
        const y = height - barHeight - 20;
        return (
          <G key={d.label}>
             {/* Gradient Defs could be added here but simple fill is robust */}
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill={d.color}
              opacity={0.9}
            />
            <SvgText
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={isDark ? '#9CA3AF' : '#6B7280'}
            >
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// Custom SVG Donut Chart Re-implementation
const DonutChartSVG = ({ size, data, isDark }: any) => {
  const total = data.reduce((sum: any, d: any) => sum + d.value, 0);
  let cumulativePercent = 0;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {data.map((d: any) => {
          const percent = d.value / total;
          const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
          const strokeDashoffset = -circumference * cumulativePercent;
          cumulativePercent += percent;
          return (
            <Circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
      {/* Legend */}
      <View style={{ marginLeft: 24 }}>
        {data.map((d: any) => (
          <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color, marginRight: 8 }} />
            <Text style={{ color: isDark ? '#D1D5DB' : '#4B5563', fontSize: 12, fontWeight: '700' }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
