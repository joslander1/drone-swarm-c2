
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Zap, Shield, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

const SwarmControl = () => {
  const [activeSwarms, setActiveSwarms] = useState([
    {
      id: 'SWARM-ALPHA',
      drones: ['UAV-001', 'UAV-002', 'UAV-005'],
      formation: 'Triangle',
      status: 'Active',
      mission: 'Area Patrol',
      leader: 'UAV-001'
    },
    {
      id: 'SWARM-BETA',
      drones: ['UAV-003', 'UAV-004'],
      formation: 'Line',
      status: 'Standby',
      mission: 'Reserve',
      leader: 'UAV-003'
    }
  ]);

  const [spacing, setSpacing] = useState([50]);
  const [altitude, setAltitude] = useState([1000]);

  const formations = [
    { id: 'triangle', name: 'Triangle', description: 'Triangular formation for area coverage' },
    { id: 'line', name: 'Line Abreast', description: 'Linear formation for wide surveillance' },
    { id: 'diamond', name: 'Diamond', description: 'Diamond formation for protection' },
    { id: 'wedge', name: 'Wedge', description: 'V-shaped formation for penetration' },
    { id: 'column', name: 'Column', description: 'Single file formation' },
    { id: 'circle', name: 'Circle', description: 'Circular formation for target observation' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Standby': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Forming': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Swarms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeSwarms.map((swarm) => (
          <Card key={swarm.id} className="bg-slate-800 border-green-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{swarm.id}</span>
                </CardTitle>
                <Badge className={getStatusColor(swarm.status)}>
                  {swarm.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Formation</div>
                  <div className="text-sm text-white">{swarm.formation}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Leader</div>
                  <div className="text-sm text-white font-mono">{swarm.leader}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Mission</div>
                <div className="text-sm text-white">{swarm.mission}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2">Drones ({swarm.drones.length})</div>
                <div className="flex flex-wrap gap-1">
                  {swarm.drones.map((drone) => (
                    <span 
                      key={drone}
                      className="px-2 py-1 bg-slate-900 border border-green-500/20 rounded text-xs font-mono text-green-400"
                    >
                      {drone}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10">
                  <Shield className="w-3 h-3 mr-1" />
                  Protect
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reform
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formation Controls */}
      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Formation Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Formation Type</label>
                <Select>
                  <SelectTrigger className="bg-slate-900 border-green-500/30 text-white">
                    <SelectValue placeholder="Select formation" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-green-500/30">
                    {formations.map((formation) => (
                      <SelectItem key={formation.id} value={formation.id} className="text-white hover:bg-green-500/10">
                        <div>
                          <div className="font-medium">{formation.name}</div>
                          <div className="text-xs text-gray-400">{formation.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Spacing: {spacing[0]}m
                </label>
                <Slider
                  value={spacing}
                  onValueChange={setSpacing}
                  max={200}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Formation Altitude: {altitude[0]}ft
                </label>
                <Slider
                  value={altitude}
                  onValueChange={setAltitude}
                  max={3000}
                  min={500}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Quick Commands</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Climb
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                    <ArrowDown className="w-3 h-3 mr-1" />
                    Descend
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                    Tighten
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                    Spread
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Formation Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cohesion:</span>
                    <span className="text-green-400">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Integrity:</span>
                    <span className="text-green-400">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Communication:</span>
                    <span className="text-green-400">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-green-500/20">
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Disband Swarm
            </Button>
            <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              Return to Base
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Apply Formation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwarmControl;
