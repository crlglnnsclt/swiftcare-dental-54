import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Star, TrendingUp } from 'lucide-react';

interface DentistWorkloadRadarProps {
  data?: Array<{
    dentist: string;
    patients: number;
    hours: number;
    satisfaction: number;
    procedures: number;
    efficiency: number;
  }>;
}

export const DentistWorkloadRadar: React.FC<DentistWorkloadRadarProps> = ({ data }) => {
  // Mock dentist performance data
  const dentistData = [
    {
      name: 'Dr. Smith',
      patients: 85,
      procedures: 92,
      satisfaction: 95,
      efficiency: 88,
      revenue: 78,
      availability: 82
    },
    {
      name: 'Dr. Johnson',
      patients: 78,
      procedures: 85,
      satisfaction: 91,
      efficiency: 85,
      revenue: 82,
      availability: 90
    },
    {
      name: 'Dr. Williams',
      patients: 92,
      procedures: 88,
      satisfaction: 89,
      efficiency: 91,
      revenue: 88,
      availability: 75
    },
    {
      name: 'Dr. Brown',
      patients: 70,
      procedures: 75,
      satisfaction: 87,
      efficiency: 79,
      revenue: 71,
      availability: 95
    }
  ];

  // Workload comparison data
  const workloadComparison = [
    { dentist: 'Dr. Smith', patients: 145, hours: 38, avgTime: 28 },
    { dentist: 'Dr. Johnson', patients: 132, hours: 36, avgTime: 31 },
    { dentist: 'Dr. Williams', patients: 168, hours: 42, avgTime: 25 },
    { dentist: 'Dr. Brown', patients: 98, hours: 32, avgTime: 35 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart for Performance Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Dentist Performance Radar
          </CardTitle>
          <CardDescription>
            Multi-dimensional performance analysis across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={dentistData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickCount={5}
                />
                <Radar
                  name="Patients Treated"
                  dataKey="patients"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Procedure Success"
                  dataKey="procedures"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Patient Satisfaction"
                  dataKey="satisfaction"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Efficiency"
                  dataKey="efficiency"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name
                  ]}
                  labelStyle={{ color: '#1f2937' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Patients Treated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Procedure Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Patient Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Efficiency</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Monthly Workload Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadComparison} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="dentist" width={80} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'patients' ? `${value} patients` : 
                    name === 'hours' ? `${value}h` : `${value}min`,
                    name === 'patients' ? 'Patients' :
                    name === 'hours' ? 'Hours Worked' : 'Avg Time per Patient'
                  ]}
                />
                <Bar dataKey="patients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Performance Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Performers This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dentistData
            .sort((a, b) => (b.satisfaction + b.efficiency + b.procedures) / 3 - (a.satisfaction + a.efficiency + a.procedures) / 3)
            .slice(0, 3)
            .map((dentist, index) => (
              <div key={dentist.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{dentist.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {dentist.satisfaction}% satisfaction
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {Math.round((dentist.satisfaction + dentist.efficiency + dentist.procedures) / 3)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};