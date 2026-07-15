
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TacticalMap from '@/components/TacticalMap';
import DroneFleet from '@/components/DroneFleet';
import MissionPlanner from '@/components/MissionPlanner';
import SwarmControl from '@/components/SwarmControl';
import Telemetry from '@/components/Telemetry';
import EmergencyPanel from '@/components/EmergencyPanel';
import { Plane, Users, Map, Activity, AlertTriangle, Settings } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-slate-800 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DRONE FLEET COMMAND</h1>
                <p className="text-green-400/80">Autonomous Flight Control System v2.1</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/10 px-3 py-1 rounded border border-green-500/30">
                <span className="text-sm">Mission Active</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Mission Time</div>
                <div className="text-lg font-mono text-white">02:47:15</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full bg-slate-800 border border-green-500/30">
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Map className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Plane className="w-4 h-4" />
              <span>Fleet</span>
            </TabsTrigger>
            <TabsTrigger value="mission" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Settings className="w-4 h-4" />
              <span>Mission</span>
            </TabsTrigger>
            <TabsTrigger value="swarm" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Users className="w-4 h-4" />
              <span>Swarm</span>
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Activity className="w-4 h-4" />
              <span>Telemetry</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center space-x-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TacticalMap />
              </div>
              <div>
                <DroneFleet />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fleet">
            <DroneFleet expanded={true} />
          </TabsContent>

          <TabsContent value="mission">
            <MissionPlanner />
          </TabsContent>

          <TabsContent value="swarm">
            <SwarmControl />
          </TabsContent>

          <TabsContent value="telemetry">
            <Telemetry />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
