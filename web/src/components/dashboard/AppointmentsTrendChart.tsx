import { useMemo } from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { useAppointments } from '../../hooks/useAppointments';
import { subDays, format, isSameDay, parseISO } from 'date-fns';

export const AppointmentsTrendChart = () => {
  const { appointments } = useAppointments();

  const { chartData, dateRangeLabel } = useMemo(() => {
    // Generate the last 14 days array (including today)
    const daysArray = Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(new Date(), 13 - i);
      return {
        dateObj: d,
        dayLabel: format(d, 'MMM d'), // e.g., "Feb 15"
        male: 0,
        female: 0
      };
    });

    if (Array.isArray(appointments) && appointments.length > 0) {
      appointments.forEach(apt => {
        if (apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') return;
        if (!apt.patient?.gender) return;

        // Try to parse the date safely, accommodating various format types if needed
        let aptDate: Date;
        try {
          // If the date is already a string timestamp or ISO 
          aptDate =  typeof apt.date === 'string' ? parseISO(apt.date) : new Date(apt.date);
        } catch(e) {
          return; // Skip invalid dates
        }

        // Find which day bucket this falls into
        const dayBucketIndex = daysArray.findIndex(bucket => isSameDay(bucket.dateObj, aptDate));
        
        if (dayBucketIndex !== -1) {
           const gender = apt.patient.gender.toUpperCase();
           if (gender === 'MALE') daysArray[dayBucketIndex].male++;
           if (gender === 'FEMALE') daysArray[dayBucketIndex].female++;
        }
      });
    }

    const startLabel = daysArray[0].dayLabel;
    const endLabel = daysArray[13].dayLabel;

    return {
      chartData: daysArray,
      dateRangeLabel: `${startLabel} - ${endLabel}`
    };
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border shadow-sm rounded-lg p-6 flex flex-col w-full h-full min-h-[350px]">
      <div className="flex flex-col items-center justify-center mb-6">
        <h3 className="text-[17px] font-bold text-text-primary dark:text-dark-text-primary tracking-tight">Appointments</h3>
        <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted dark:text-dark-text-muted-dark mt-1">{dateRangeLabel}</p>
      </div>

      <div className="flex-1 w-full h-[200px] relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="dayLabel" axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }} tickLine={false} tick={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#111827', fontWeight: 600, fontSize: '12px' }}
              labelStyle={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}
            />
            {/* Smooth lines without the "prefer not to say" category mapping */}
            <Area type="monotone" dataKey="male" name="Male" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMale)" />
            <Area type="monotone" dataKey="female" name="Female" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFemale)" />
            
            {/* Mocking the little ticks on the x-axis for visual flair like the reference */}
            <g transform="translate(0, 100%)">
               {chartData.map((_, i) => (
                 <rect key={i} x={`${(i / (chartData.length - 1)) * 100}%`} y="-15" width="2" height="6" fill="#d1d5db" />
               ))}
            </g>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Female</span>
        </div>
      </div>
    </div>
  );
};
