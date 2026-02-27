import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/services/api';
import { Calendar, Clock, MessageSquare, ChevronLeft, ChevronRight, Check, Users } from 'lucide-react-native';
import { format, addDays } from 'date-fns';

export default function BookAppointment() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Who, 2: Intake, 3: Reason, 4: Symptoms, 5: History, 6: Confirm
  
  // Selection State
  const [bookingType, setBookingType] = useState<'myself' | 'dependent'>('myself');
  
  // Form State
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    sex: 'Male',
    dob: '',
    address: '',
    contact: '',
    email: '',
    guardianName: user ? `${user.firstName} ${user.lastName}` : '',
    relation: ''
  });

  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState('08:00 AM');
  
  const [reasons, setReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState('');

  const [medHistory, setMedHistory] = useState({
    illnessType: 'none',
    illnessDetails: '',
    allergy: '',
    takingMeds: 'No'
  });

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-fill logic for mobile
  useState(() => {
    if (bookingType === 'myself' && user) {
      setPatientData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.phone || ''
      }));
    }
  });

  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  
  const router = useRouter();
  const { isDark } = useTheme();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const inputBg = isDark ? '#374151' : '#F9FAFB';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const textMuted = isDark ? '#6B7280' : '#9CA3AF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';
  const accent = '#5B8CFF'; // Primary Blue matched with system

  if (user?.role !== 'PATIENT') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: textPrimary, fontSize: 16, fontWeight: 'bold' }}>Access Denied</Text>
        <Text style={{ color: textMuted, marginTop: 8 }}>Only patients can book new appointments.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: accent, borderRadius: 8 }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBooking = async () => {
    if (!date) {
       Alert.alert('Missing Info', 'Please select a date.');
       return;
    }
    
    if (reasons.length === 0) {
       Alert.alert('Missing Info', 'Please select at least one reason for visit.');
       return;
    }

    if (reasons.includes('Other') && !otherReason.trim()) {
       Alert.alert('Missing Info', 'Please specify the "Other" reason.');
       return;
    }
    
    if (!confirmed) {
       Alert.alert('Confirmation Required', 'Please confirm that the information provided is correct.');
       return;
    }

    if (bookingType === 'dependent') {
       if (!patientData.name || !patientData.dob || !patientData.relation) {
          Alert.alert('Missing Info', 'Please complete all dependent information.');
          return;
       }
    }

    try {
        const reasonString = [
          ...reasons.filter(r => r !== 'Other'),
          otherReason ? `Other: ${otherReason}` : null
        ].filter(Boolean).join(', ');

        const symptomString = [
          ...symptoms.filter(s => s !== 'Other'),
          otherSymptom ? `Other: ${otherSymptom}` : null
        ].filter(Boolean).join(', ');

        const finalIntake = {
          patientInfo: patientData,
          reasons: reasonString,
          symptoms: symptomString,
          medicalHistory: medHistory,
          isDependent: bookingType === 'dependent'
        };

        await api.post('/appointments', {
          patientId: patientId || undefined,
          date,
          time,
          reason: reasonString || 'Consultation',
          notes: bookingType === 'dependent' ? `Guardian: ${patientData.guardianName} (${patientData.relation})` : '',
          intakeForm: finalIntake
        });

        Alert.alert('Success', 'Appointment booked successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
    } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to book appointment.');
    } finally {
        setLoading(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
  const times = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const stepLabels = ['Who', 'Patient', 'Reason', 'Symptoms', 'History', 'Review'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={{ width: 40, height: 40, backgroundColor: cardBg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor, marginRight: 14 }}>
          <ChevronLeft size={20} color={textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary }}>Book Visit</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        {/* Progress */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: i <= step ? accent : (isDark ? '#374151' : '#E5E7EB'), marginRight: i < 6 ? 8 : 0 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {stepLabels.map((label, i) => (
            <View key={label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: i + 1 <= step ? '700' : '500', color: i + 1 <= step ? accent : textMuted }}>{label}</Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <View style={{ gap: 16 }}>
             <TouchableOpacity 
                onPress={() => { setBookingType('myself'); setStep(2); }}
                style={{ backgroundColor: cardBg, borderRadius: 24, padding: 24, borderWidth: 2, borderColor: bookingType === 'myself' ? accent : borderColor, alignItems: 'center', gap: 12 }}
             >
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1F2937' : '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                   <Text style={{ fontSize: 32 }}>👤</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                   <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Myself</Text>
                   <Text style={{ fontSize: 14, color: textMuted }}>I am the patient</Text>
                </View>
             </TouchableOpacity>

             <TouchableOpacity 
                onPress={() => { setBookingType('dependent'); setStep(2); }}
                style={{ backgroundColor: cardBg, borderRadius: 24, padding: 24, borderWidth: 2, borderColor: bookingType === 'dependent' ? accent : borderColor, alignItems: 'center', gap: 12 }}
             >
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1F2937' : '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                   <Text style={{ fontSize: 32 }}>👥</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                   <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Dependent</Text>
                   <Text style={{ fontSize: 14, color: textMuted }}>Child or family member</Text>
                </View>
             </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 20, paddingBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Patient Information</Text>
            
            {bookingType === 'dependent' && (
              <View style={{ gap: 12, padding: 20, backgroundColor: isDark ? '#1F2937' : '#EFF6FF', borderRadius: 20, borderWidth: 1, borderColor: isDark ? '#374151' : '#DBEAFE' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: accent, textTransform: 'uppercase' }}>Guardian Details</Text>
                <View style={{ gap: 8 }}>
                   <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Guardian Name</Text>
                   <TextInput
                      readOnly
                      value={patientData.guardianName}
                      style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textMuted }}
                   />
                </View>
                <View style={{ gap: 8 }}>
                   <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Relationship</Text>
                   <TextInput
                      placeholder="e.g. Mother"
                      placeholderTextColor={textMuted}
                      value={patientData.relation}
                      onChangeText={(t) => setPatientData({...patientData, relation: t})}
                      style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                   />
                </View>
              </View>
            )}

            <View style={{ gap: 16 }}>
               <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Full Name</Text>
                  <TextInput
                     placeholder="Enter patient name"
                     placeholderTextColor={textMuted}
                     value={patientData.name}
                     onChangeText={(t) => setPatientData({...patientData, name: t})}
                     style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                  />
               </View>
               <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 8 }}>
                     <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>DOB (YYYY-MM-DD)</Text>
                     <TextInput
                        placeholder="2020-01-01"
                        placeholderTextColor={textMuted}
                        value={patientData.dob}
                        onChangeText={(t) => setPatientData({...patientData, dob: t})}
                        style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                     />
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                     <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Sex</Text>
                     <View style={{ flexDirection: 'row', gap: 4 }}>
                        {['Male', 'Female'].map(s => (
                           <TouchableOpacity 
                              key={s}
                              onPress={() => setPatientData({...patientData, sex: s})}
                              style={{ 
                                flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', 
                                backgroundColor: patientData.sex === s ? accent : inputBg,
                                borderWidth: 1, borderColor: patientData.sex === s ? accent : borderColor
                              }}
                           >
                              <Text style={{ fontSize: 12, fontWeight: '700', color: patientData.sex === s ? '#FFF' : textPrimary }}>{s}</Text>
                           </TouchableOpacity>
                        ))}
                     </View>
                  </View>
               </View>
               <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Address</Text>
                  <TextInput
                     placeholder="Enter address"
                     placeholderTextColor={textMuted}
                     value={patientData.address}
                     onChangeText={(t) => setPatientData({...patientData, address: t})}
                     style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                  />
               </View>
               <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: textMuted }}>Contact Number</Text>
                  <TextInput
                     placeholder="09XXXXXXXXX"
                     keyboardType="phone-pad"
                     placeholderTextColor={textMuted}
                     value={patientData.contact}
                     onChangeText={(t) => setPatientData({...patientData, contact: t})}
                     style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                  />
               </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 16, paddingBottom: 24 }}>
             <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Reason for Visit</Text>
             <View style={{ gap: 8 }}>
                {[
                  'Fever', 'Cough / colds', 'Sore throat', 'Headache / dizziness', 
                  'Chest pain / palpitations', 'Shortness of breath', 'Stomach / abdominal pain',
                  'Diarrhea / vomiting', 'Fatigue / weakness', 'High blood pressure check',
                  'Diabetes check', 'Follow-up visit', 'Medical certificate'
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      const next = reasons.includes(opt) ? reasons.filter(r => r !== opt) : [...reasons, opt];
                      setReasons(next);
                    }}
                    style={{ 
                      flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, 
                      backgroundColor: cardBg, borderWidth: 1, borderColor: reasons.includes(opt) ? accent : borderColor,
                      gap: 12
                    }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: reasons.includes(opt) ? accent : 'transparent', borderColor: reasons.includes(opt) ? accent : textMuted }}>
                       {reasons.includes(opt) && <Check size={12} color="white" />}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  onPress={() => {
                    const next = reasons.includes('Other') ? reasons.filter(r => r !== 'Other') : [...reasons, 'Other'];
                    setReasons(next);
                  }}
                  style={{ 
                    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, 
                    backgroundColor: cardBg, borderWidth: 1, borderColor: reasons.includes('Other') ? accent : borderColor,
                    gap: 12
                  }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: reasons.includes('Other') ? accent : 'transparent', borderColor: reasons.includes('Other') ? accent : textMuted }}>
                     {reasons.includes('Other') && <Check size={12} color="white" />}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>Other</Text>
                </TouchableOpacity>
                
                {reasons.includes('Other') && (
                  <TextInput
                    placeholder="Specify other reason..."
                    placeholderTextColor={textMuted}
                    value={otherReason}
                    onChangeText={setOtherReason}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor, marginLeft: 32 }}
                  />
                )}
             </View>
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 16, paddingBottom: 24 }}>
             <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Current Symptoms</Text>
             <View style={{ gap: 8 }}>
                {[
                  'Fever', 'Pain', 'Difficulty breathing', 'Vomiting', 'Diarrhea', 'Dizziness / fainting'
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      const next = symptoms.includes(opt) ? symptoms.filter(s => s !== opt) : [...symptoms, opt];
                      setSymptoms(next);
                    }}
                    style={{ 
                      flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, 
                      backgroundColor: cardBg, borderWidth: 1, borderColor: symptoms.includes(opt) ? accent : borderColor,
                      gap: 12
                    }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: symptoms.includes(opt) ? accent : 'transparent', borderColor: symptoms.includes(opt) ? accent : textMuted }}>
                       {symptoms.includes(opt) && <Check size={12} color="white" />}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  onPress={() => {
                    const next = symptoms.includes('Other') ? symptoms.filter(s => s !== 'Other') : [...symptoms, 'Other'];
                    setSymptoms(next);
                  }}
                  style={{ 
                    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, 
                    backgroundColor: cardBg, borderWidth: 1, borderColor: symptoms.includes('Other') ? accent : borderColor,
                    gap: 12
                  }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: symptoms.includes('Other') ? accent : 'transparent', borderColor: symptoms.includes('Other') ? accent : textMuted }}>
                     {symptoms.includes('Other') && <Check size={12} color="white" />}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>Other</Text>
                </TouchableOpacity>
                
                {symptoms.includes('Other') && (
                  <TextInput
                    placeholder="Specify other symptoms..."
                    placeholderTextColor={textMuted}
                    value={otherSymptom}
                    onChangeText={setOtherSymptom}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor, marginLeft: 32 }}
                  />
                )}
             </View>
          </View>
        )}

        {step === 5 && (
          <View style={{ gap: 24, paddingBottom: 24 }}>
             <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Medical History</Text>
             
             <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted, textTransform: 'uppercase' }}>Illness</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                   <TouchableOpacity 
                      onPress={() => setMedHistory({...medHistory, illnessType: 'none', illnessDetails: ''})}
                      style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: medHistory.illnessType === 'none' ? accent : borderColor, backgroundColor: medHistory.illnessType === 'none' ? (isDark ? accent + '10' : accent + '05') : cardBg, alignItems: 'center' }}
                   >
                       <Text style={{ fontSize: 13, fontWeight: '700', color: medHistory.illnessType === 'none' ? accent : textSecondary }}>No known illness</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                      onPress={() => setMedHistory({...medHistory, illnessType: 'existing'})}
                      style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: medHistory.illnessType === 'existing' ? accent : borderColor, backgroundColor: medHistory.illnessType === 'existing' ? (isDark ? accent + '10' : accent + '05') : cardBg, alignItems: 'center' }}
                   >
                       <Text style={{ fontSize: 13, fontWeight: '700', color: medHistory.illnessType === 'existing' ? accent : textSecondary }}>With existing illness</Text>
                   </TouchableOpacity>
                </View>
                {medHistory.illnessType === 'existing' && (
                  <TextInput
                    placeholder="Describe illness..."
                    placeholderTextColor={textMuted}
                    value={medHistory.illnessDetails}
                    onChangeText={(t) => setMedHistory({...medHistory, illnessDetails: t})}
                    style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                  />
                )}
             </View>

             <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted, textTransform: 'uppercase' }}>Allergy</Text>
                <TextInput
                  placeholder="e.g. Peanuts, Penicillin"
                  placeholderTextColor={textMuted}
                  value={medHistory.allergy}
                  onChangeText={(t) => setMedHistory({...medHistory, allergy: t})}
                  style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: inputBg, borderRadius: 12, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor }}
                />
             </View>

             <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted, textTransform: 'uppercase' }}>Currently taking medicines?</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                   {['Yes', 'No'].map(opt => (
                     <TouchableOpacity 
                        key={opt}
                        onPress={() => setMedHistory({...medHistory, takingMeds: opt})}
                        style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: medHistory.takingMeds === opt ? accent : borderColor, backgroundColor: medHistory.takingMeds === opt ? (isDark ? accent + '10' : accent + '05') : cardBg, alignItems: 'center' }}
                     >
                         <Text style={{ fontSize: 13, fontWeight: '700', color: medHistory.takingMeds === opt ? accent : textSecondary }}>{opt}</Text>
                     </TouchableOpacity>
                   ))}
                </View>
             </View>
          </View>
        )}

        {step === 6 && (
          <View style={{ gap: 24, paddingBottom: 24 }}>
             <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>Schedule & Review</Text>
             
             <View style={{ gap: 16 }}>
                <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Pick Date</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {dates.map(d => {
                      const dateKey = format(d, 'yyyy-MM-dd');
                      const isSelected = date === dateKey;
                      return (
                        <TouchableOpacity
                          key={dateKey}
                          onPress={() => setDate(dateKey)}
                          style={{
                            width: 64, paddingVertical: 14, borderRadius: 18, alignItems: 'center',
                            backgroundColor: isSelected ? accent : (isDark ? '#374151' : '#F9FAFB'),
                            borderWidth: 1, borderColor: isSelected ? accent : borderColor,
                          }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '700', color: isSelected ? '#FFFFFF' : textMuted, textTransform: 'uppercase' }}>{format(d, 'EEE')}</Text>
                          <Text style={{ fontSize: 20, fontWeight: '800', color: isSelected ? '#FFFFFF' : textPrimary, marginTop: 4 }}>{format(d, 'dd')}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Pick Time</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {times.map(t => {
                      const isSelected = time === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setTime(t)}
                          style={{
                            width: '23%', paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                            backgroundColor: isSelected ? accent : (isDark ? '#374151' : '#F9FAFB'),
                            borderWidth: 1, borderColor: isSelected ? accent : borderColor,
                          }}
                        >
                          <Text style={{ fontWeight: '700', fontSize: 13, color: isSelected ? '#FFFFFF' : textPrimary }}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
             </View>

             <View style={{ backgroundColor: isDark ? '#1F2937' : '#EFF6FF', padding: 20, borderRadius: 24, gap: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#DBEAFE' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                   <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted }}>Patient</Text>
                   <Text style={{ fontSize: 13, fontWeight: '800', color: textPrimary }}>{patientData.name || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                   <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted }}>Date</Text>
                   <Text style={{ fontSize: 13, fontWeight: '800', color: textPrimary }}>{date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                   <Text style={{ fontSize: 12, fontWeight: '700', color: textMuted }}>Time</Text>
                   <Text style={{ fontSize: 13, fontWeight: '800', color: textPrimary }}>{time}</Text>
                </View>
             </View>

             <TouchableOpacity 
                onPress={() => setConfirmed(!confirmed)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor: confirmed ? accent : borderColor }}
             >
                <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: confirmed ? accent : 'transparent', borderColor: confirmed ? accent : textMuted }}>
                   {confirmed && <Check size={12} color="white" />}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: textPrimary }}>Ready to confirm?</Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: cardBg, borderTopWidth: 1, borderTopColor: borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 12, elevation: 8 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: isDark ? '#374151' : '#F3F4F6' }}>
              <Text style={{ fontWeight: '700', color: textPrimary }}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 6 ? (
            <TouchableOpacity
              onPress={() => setStep(step + 1)}
              disabled={
                (step === 2 && (!patientData.name || !patientData.dob)) ||
                (step === 3 && reasons.length === 0) ||
                (step === 4 && symptoms.length === 0)
              }
              style={{ flex: step > 1 ? 2 : 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: accent, opacity: ((step === 2 && (!patientData.name || !patientData.dob)) || (step === 3 && reasons.length === 0) || (step === 4 && symptoms.length === 0)) ? 0.5 : 1, flexDirection: 'row', justifyContent: 'center' }}
            >
              <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Continue</Text>
              <ChevronRight size={18} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleBooking}
              disabled={loading || !confirmed || !date}
              style={{ flex: 2, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: accent, opacity: (loading || !confirmed || !date) ? 0.6 : 1 }}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: '700', color: '#FFFFFF', fontSize: 15 }}>Confirm Appointment</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
