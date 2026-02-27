import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppointments } from '../../hooks/useAppointments';

export const DiseaseReportsChart = () => {
  const { appointments } = useAppointments();

  const chartData = useMemo(() => {
    if (!Array.isArray(appointments)) return [];

    const counts: Record<string, number> = {
      'Fever': 0,
      'Cough / colds': 0,
      'Sore throat': 0,
      'Headache / dizziness': 0,
       'Chest pain / palpitations': 0,
      'Shortness of breath': 0,
      'Stomach / abdominal pain': 0,
      'Diarrhea / vomiting': 0,
      'Fatigue / weakness': 0,
      'High blood pressure check': 0,
      'Diabetes / sugar check': 0,
      'Follow-up visit': 0,
    };

    appointments.forEach(apt => {
      if (apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW' && apt.reason) {
        // Since reason is a comma-separated string from checkboxes, we can check inclusion
        Object.keys(counts).forEach(key => {
          if (apt.reason.includes(key)) {
            counts[key]++;
          }
        });
      }
    });

    const definedColors = [
      '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', 
      '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#f43f5e', '#3b82f6'
    ];

    let colorIndex = 0;
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: definedColors[colorIndex++ % definedColors.length]
      }));

  }, [appointments]);

  return (
    <div className="bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border shadow-sm rounded-lg p-6 flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">Reasons for Visit Reports</h3>
      </div>

      <div className="flex-1 w-full h-[220px] relative">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-text-muted dark:text-dark-text-muted-dark pb-6">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [value, name]}
                contentStyle={{
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#ffffff' 
                }}
                itemStyle={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
