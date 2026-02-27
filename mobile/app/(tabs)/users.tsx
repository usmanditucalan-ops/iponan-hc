import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';
import { Plus, Search, User, UserPlus, Filter, X, Check } from 'lucide-react-native';
import { GradientButton } from '../../components/ui/GradientButton';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Doctor, Staff, Patient
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const { isDark } = useTheme();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#94A3B8' : '#6B7280';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF';

  // Mock data for now if API fails
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // const res = await api.get('/users');
      // setUsers(res.data);
      // Mocking for UI dev
      setTimeout(() => {
        setUsers([
          { id: '1', name: 'Dr. Sarah Smith', role: 'DOCTOR', email: 'sarah@clinic.com', status: 'Active' },
          { id: '2', name: 'Nurse Joy', role: 'NURSE', email: 'joy@clinic.com', status: 'Active' },
          { id: '3', name: 'Admin User', role: 'ADMIN', email: 'admin@clinic.com', status: 'Active' },
          { id: '4', name: 'John Doe', role: 'PATIENT', email: 'john@gmail.com', status: 'Active' },
          { id: '5', name: 'Dr. Mike Ross', role: 'DOCTOR', email: 'mike@clinic.com', status: 'On Leave' },
        ]);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'All' || u.role === filter.toUpperCase();
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'DOCTOR': return { bg: '#D1FAE5', text: '#065F46' };
      case 'NURSE': return { bg: '#FCE7F3', text: '#9D174D' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: textPrimary }}>User Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', shadowColor: accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 14, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor, marginBottom: 12 }}>
          <Search size={20} color={textMuted} />
          <TextInput 
            placeholder="Search users..." 
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 10, color: textPrimary, fontWeight: '500' }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['All', 'Doctor', 'Nurse', 'Patient'].map(f => (
            <TouchableOpacity 
              key={f} 
              onPress={() => setFilter(f)}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: filter === f ? accent : cardBg, borderWidth: 1, borderColor: filter === f ? accent : borderColor }}
            >
              <Text style={{ color: filter === f ? 'white' : textSecondary, fontWeight: '700', fontSize: 13 }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={accent} /></View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        >
          {filteredUsers.map(user => {
            const roleStyle = getRoleColor(user.role);
            return (
              <View key={user.id} style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: isDark ? '#374151' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: textSecondary }}>{user.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{user.name}</Text>
                  <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }}>{user.email}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: roleStyle.bg }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: roleStyle.text }}>{user.role}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textPrimary }}>Add New User</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <X size={24} color={textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <Text style={{ color: textMuted, marginBottom: 8, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Full Name</Text>
              <TextInput style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderRadius: 12, padding: 16, color: textPrimary, marginBottom: 16 }} placeholder="e.g. Dr. John Doe" placeholderTextColor={textMuted} />

              <Text style={{ color: textMuted, marginBottom: 8, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Email Address</Text>
              <TextInput style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderRadius: 12, padding: 16, color: textPrimary, marginBottom: 16 }} placeholder="e.g. john@clinic.com" placeholderTextColor={textMuted} keyboardType="email-address" />

              <Text style={{ color: textMuted, marginBottom: 8, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Role</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                {['Doctor', 'Nurse', 'Admin'].map(r => (
                  <TouchableOpacity key={r} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: r === 'Doctor' ? accent : isDark ? '#374151' : '#F3F4F6' }}>
                    <Text style={{ color: r === 'Doctor' ? 'white' : textPrimary, fontWeight: '700' }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <GradientButton title="Create User" onPress={() => { setModalVisible(false); Alert.alert('Success', 'User created successfully'); }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
