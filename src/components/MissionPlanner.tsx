
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Route, Clock, Target } from 'lucide-react';
import ReadOnlyBanner from './ReadOnlyBanner';

const MissionPlanner = () => {
  const [missionType, setMissionType] = useState('');
  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);

  const missionTemplates = [
    { id: 'patrol', name: 'Area Patrol', description: 'Systematic monitoring of designated area' },
    { id: 'surveillance', name: 'Target Surveillance', description: 'Continuous observation of specific target' },
    { id: 'reconnaissance', name: 'Reconnaissance', description: 'Intelligence gathering mission' },
    { id: 'escort', name: 'Escort Formation', description: 'Protective escort formation' },
    { id: 'search', name: 'Search & Rescue', description: 'Search and rescue operations' },
  ];

  const availableDrones = [
    { id: 'UAV-001', type: 'Group 1 Fixed-Wing', status: 'Available' },
    { id: 'UAV-002', type: 'Group 1 Rotary-Wing', status: 'Available' },
    { id: 'UAV-004', type: 'Group 2 Hybrid', status: 'Available' },
    { id: 'UAV-005', type: 'Group 1 Rotary-Wing', status: 'Available' },
  ];

  return (
    <div className="space-y-6">
      <ReadOnlyBanner />
      <fieldset disabled className="space-y-6 opacity-80 [&_button]:cursor-not-allowed [&_input]:cursor-not-allowed">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Planning */}
        <Card className="bg-slate-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Mission Planning</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Mission Template</Label>
              <Select value={missionType} onValueChange={setMissionType}>
                <SelectTrigger className="bg-slate-900 border-green-500/30 text-white">
                  <SelectValue placeholder="Select mission type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-green-500/30">
                  {missionTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="text-white hover:bg-green-500/10">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-400">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Priority Level</Label>
                <Select>
                  <SelectTrigger className="bg-slate-900 border-green-500/30 text-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-green-500/30">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-red-400">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Duration (hours)</Label>
                <Input type="number" placeholder="2" className="bg-slate-900 border-green-500/30 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Mission Description</Label>
              <Textarea 
                placeholder="Enter mission objectives and parameters..."
                className="bg-slate-900 border-green-500/30 text-white min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drone Assignment */}
        <Card className="bg-slate-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Drone Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {availableDrones.map((drone) => (
                <div key={drone.id} className="flex items-center justify-between bg-slate-900 border border-green-500/20 rounded-lg p-3">
                  <div>
                    <div className="font-mono text-sm text-white">{drone.id}</div>
                    <div className="text-xs text-gray-400">{drone.type}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-400">{drone.status}</span>
                    <input
                      type="checkbox"
                      checked={selectedDrones.includes(drone.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDrones([...selectedDrones, drone.id]);
                        } else {
                          setSelectedDrones(selectedDrones.filter(id => id !== drone.id));
                        }
                      }}
                      className="w-4 h-4 text-green-600 bg-slate-700 border-green-500/30 rounded focus:ring-green-500 focus:ring-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-green-500/20">
              <div className="text-sm text-gray-400 mb-2">Selected: {selectedDrones.length} drones</div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Assign Drones to Mission
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Path Plan */}
      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Route className="w-5 h-5" />
            <span>Flight Path Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="waypoints" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900">
              <TabsTrigger value="waypoints" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Waypoints</TabsTrigger>
              <TabsTrigger value="parameters" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Parameters</TabsTrigger>
              <TabsTrigger value="restrictions" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Restrictions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="waypoints" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Latitude</Label>
                  <Input placeholder="40.7128" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Longitude</Label>
                  <Input placeholder="-74.0060" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Altitude (ft)</Label>
                  <Input placeholder="1000" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
              </div>
              <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                Add Waypoint
              </Button>
            </TabsContent>
            
            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Max Speed (mph)</Label>
                  <Input placeholder="45" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Min Altitude (ft)</Label>
                  <Input placeholder="500" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Max Altitude (ft)</Label>
                  <Input placeholder="2000" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Loiter Time (min)</Label>
                  <Input placeholder="5" className="bg-slate-900 border-green-500/30 text-white" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="restrictions" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-green-600 bg-slate-700 border-green-500/30 rounded" />
                  <span className="text-white">Avoid populated areas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-green-600 bg-slate-700 border-green-500/30 rounded" />
                  <span className="text-white">Maintain radio contact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-green-600 bg-slate-700 border-green-500/30 rounded" />
                  <span className="text-white">Weather contingency enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-green-600 bg-slate-700 border-green-500/30 rounded" />
                  <span className="text-white">Auto-return on low battery</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="border-gray-500 text-gray-400 hover:bg-gray-500/10">
          Save as Template
        </Button>
        <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
          Validate Mission
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Deploy Mission
        </Button>
      </div>
      </fieldset>
    </div>
  );
};

export default MissionPlanner;
