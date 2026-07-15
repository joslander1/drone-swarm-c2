import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BookOpen } from 'lucide-react';

const glossary: { term: string; definition: string }[] = [
  {
    term: 'Mission Planning',
    definition:
      'Section for defining mission type, priority, duration, and objectives before deployment.',
  },
  {
    term: 'Mission Template',
    definition:
      'Reusable preset (patrol, surveillance, reconnaissance, escort, search & rescue) that seeds mission parameters.',
  },
  {
    term: 'Drone Assignment',
    definition:
      'Selection of available UAVs from the fleet to be tasked with the current mission.',
  },
  {
    term: 'Flight Path Plan',
    definition:
      'The waypoints, flight parameters, and operational restrictions that define the drone route.',
  },
  {
    term: 'Waypoints',
    definition:
      'Ordered geographic coordinates (latitude, longitude, altitude) the drone traverses.',
  },
  {
    term: 'Parameters',
    definition:
      'Speed and altitude bounds plus loiter time governing how the route is flown.',
  },
  {
    term: 'Restrictions',
    definition:
      'Operational safety rules such as avoiding populated areas or auto-return on low battery.',
  },
  {
    term: 'Deploy Mission',
    definition:
      'Commits the plan and dispatches assigned drones. Disabled in this read-only demo.',
  },
];

const MissionGlossary = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Glossary
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-slate-900 border-green-500/30 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-green-400">Mission Label Glossary</SheetTitle>
          <SheetDescription className="text-gray-400">
            Standardized terminology used across the Mission Planner.
          </SheetDescription>
        </SheetHeader>
        <dl className="mt-6 space-y-4">
          {glossary.map((entry) => (
            <div
              key={entry.term}
              className="border border-green-500/20 rounded-md p-3 bg-slate-800/60"
            >
              <dt className="text-sm font-semibold text-green-400">{entry.term}</dt>
              <dd className="text-sm text-gray-300 mt-1">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </SheetContent>
    </Sheet>
  );
};

export default MissionGlossary;
