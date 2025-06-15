
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Cpu, Thermometer, Zap } from 'lucide-react';

const Telemetry = () => {
  const altitudeData = [
    { time: '14:00', altitude: 1200, target: 1200 },
    { time: '14:05', altitude: 1180, target: 1200 },
    { time: '14:10', altitude: 1220, target: 1200 },
    { time: '14:15', altitude: 1190, target: 1200 },
    { time: '14:20', altitude: 1210, target: 1200 },
    { time: '14:25', altitude: 1195, target: 1200 },
  ];

  const batteryData = [
    { time: '14:00', uav001: 95, uav002: 87, uav003: 62, uav004: 100, uav005: 91 },
    { time: '14:05', uav001: 92, uav002: 84, uav003: 58, uav004: 100, uav005: 89 },
    { time: '14:10', uav001: 89, uav002: 81, uav003: 54, uav004: 100, uav005: 87 },
    { time: '14:15', uav001: 87, uav002: 78, uav003: 50, uav004: 100, uav005: 85 },
    { time: '14:20', uav001: 85, uav002: 75, uav003: 46, uav004: 100, uav005: 83 },
    { time: '14:25', uav001: 82, uav002: 73, uav003: 42, uav004: 100, uav005: 81 },
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 23, unit: '%', icon: Cpu, color: 'text-blue-400' },
    { name: 'Temperature', value: 68, unit: '°F', icon: Thermometer, color: 'text-orange-400' },
    { name: 'Power Draw', value: 85, unit: 'W', icon: Zap, color: 'text-yellow-400' },
    { name: 'Data Rate', value: 1.2, unit: 'MB/s', icon: Activity, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} className="bg-slate-800 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}
                    <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                  </p>
                </div>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Chart */}
        <Card className="bg-slate-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">Altitude Profile - UAV-001</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={altitudeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Line 
                  type="monotone" 
                  dataKey="altitude" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#F59E0B" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Battery Levels */}
        <Card className="bg-slate-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">Battery Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Area 
                  type="monotone" 
                  dataKey="uav001" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="uav002" 
                  stackId="2" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="uav005" 
                  stackId="3" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Telemetry Table */}
      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400">Live Telemetry Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-left py-2 text-gray-400">Drone ID</th>
                  <th className="text-left py-2 text-gray-400">Lat/Lng</th>
                  <th className="text-left py-2 text-gray-400">Alt (ft)</th>
                  <th className="text-left py-2 text-gray-400">Speed (mph)</th>
                  <th className="text-left py-2 text-gray-400">Heading</th>
                  <th className="text-left py-2 text-gray-400">Battery</th>
                  <th className="text-left py-2 text-gray-400">Signal</th>
                  <th className="text-left py-2 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-green-500/10">
                  <td className="py-2 text-white font-mono">UAV-001</td>
                  <td className="py-2 text-gray-300 font-mono">40.7128, -74.0060</td>
                  <td className="py-2 text-white">1,205</td>
                  <td className="py-2 text-white">45.2</td>
                  <td className="py-2 text-white">087°</td>
                  <td className="py-2 text-green-400">87%</td>
                  <td className="py-2 text-green-400">95%</td>
                  <td className="py-2 text-green-400">ACTIVE</td>
                </tr>
                <tr className="border-b border-green-500/10">
                  <td className="py-2 text-white font-mono">UAV-002</td>
                  <td className="py-2 text-gray-300 font-mono">40.7589, -73.9851</td>
                  <td className="py-2 text-white">798</td>
                  <td className="py-2 text-white">32.1</td>
                  <td className="py-2 text-white">142°</td>
                  <td className="py-2 text-green-400">73%</td>
                  <td className="py-2 text-green-400">88%</td>
                  <td className="py-2 text-green-400">ACTIVE</td>
                </tr>
                <tr className="border-b border-green-500/10">
                  <td className="py-2 text-white font-mono">UAV-003</td>
                  <td className="py-2 text-gray-300 font-mono">40.6892, -74.0445</td>
                  <td className="py-2 text-white">1,487</td>
                  <td className="py-2 text-white">62.7</td>
                  <td className="py-2 text-white">270°</td>
                  <td className="py-2 text-yellow-400">34%</td>
                  <td className="py-2 text-yellow-400">76%</td>
                  <td className="py-2 text-yellow-400">RTB</td>
                </tr>
                <tr className="border-b border-green-500/10">
                  <td className="py-2 text-white font-mono">UAV-004</td>
                  <td className="py-2 text-gray-300 font-mono">40.7282, -73.7949</td>
                  <td className="py-2 text-white">0</td>
                  <td className="py-2 text-white">0.0</td>
                  <td className="py-2 text-white">000°</td>
                  <td className="py-2 text-green-400">100%</td>
                  <td className="py-2 text-green-400">100%</td>
                  <td className="py-2 text-blue-400">STANDBY</td>
                </tr>
                <tr>
                  <td className="py-2 text-white font-mono">UAV-005</td>
                  <td className="py-2 text-gray-300 font-mono">40.7505, -73.9934</td>
                  <td className="py-2 text-white">912</td>
                  <td className="py-2 text-white">38.4</td>
                  <td className="py-2 text-white">095°</td>
                  <td className="py-2 text-green-400">91%</td>
                  <td className="py-2 text-green-400">92%</td>
                  <td className="py-2 text-green-400">ACTIVE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Telemetry;
