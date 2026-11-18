'use client';

import React, { useState } from 'react';
import {
  Users,
  Flame,
  Car,
  GraduationCap,
  Sparkles,
  Share2,
  Check,
  ExternalLink,
  ShieldAlert,
  Megaphone,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function CommunityActionBoard() {
  const [copiedShareable, setCopiedShareable] = useState(false);

  const communityChecklist = [
    {
      id: 'comm_school',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      title: 'Idle-Free School Gate Zone',
      audience: 'School Parents & Van Drivers',
      problem:
        'Dozens of parents and van drivers leaving engines idling during 30-minute afternoon pickup windows produce extreme particulate spikes right at young children’s breathing heights.',
      actionStep:
        'Propose an "Idle-Free School Gate" policy to your school PTA or WhatsApp group. Request parents to turn off engines while parked waiting for students.',
      impact:
        'Eliminates direct exhaust plumes from the school embarkation corridor, protecting developing lungs.',
    },
    {
      id: 'comm_burning',
      icon: <Flame className="w-5 h-5 text-rose-600" />,
      title: 'Report & Halt Open Waste/Leaf Burning',
      audience: 'Neighbourhood RWA & Residents',
      problem:
        'Low-temperature smouldering of garden leaves, plastic packaging, and municipal sweepings releases carcinogenic dioxins, furans, and toxic dense black carbon at ground level.',
      actionStep:
        'Educate building guards and municipal sweepers not to ignite leaf piles. Use official civic reporting apps (e.g., Sameer App by CPCB, MCD 311, or local municipal helplines) to log geo-tagged photo complaints.',
      impact:
        'Directly stops ground-level toxic smoke clouds from invading neighbouring apartment balconies and bedrooms.',
    },
    {
      id: 'comm_carpool',
      icon: <Car className="w-5 h-5 text-teal-600" />,
      title: 'Neighbourhood Carpool & Shared School Transport',
      audience: 'Commuters & Office Colleagues',
      problem:
        'Single-occupancy private automobiles choke urban arterials during 08:00–10:00 morning rush, compounding winter temperature inversion smog.',
      actionStep:
        'Connect with 2–3 nearby families heading along the same school or office route to rotate driving duties or coordinate an organized CNG/electric school van.',
      impact:
        'Directly removes 2 to 3 tailpipes from peak morning traffic congestion for every shared ride.',
    },
    {
      id: 'comm_dust',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      title: 'Neighbourhood Dust Suppression & Tarpaulin Enclosure',
      audience: 'Building Committees & Contractors',
      problem:
        'Unpaved residential tracks and uncovered construction sand piles create heavy localized PM10 dust storms every time vehicles drive past.',
      actionStep:
        'Encourage your society maintenance team to lightly sprinkle misted recycled water over unpaved driveways each morning, and ensure building repair materials are covered with canvas tarpaulins.',
      impact:
        'Prevents tire-induced aerosolization of coarse silica and construction dust into neighbourhood air.',
    },
  ];

  const handleCopyCommunityPledge = () => {
    const text = [
      '🏘️ *AeroWise Community Clean Air Action Checklist*',
      '',
      '1. 🚸 *Idle-Free School Pickup*: Turn off vehicle engines while parked and waiting outside school gates.',
      '2. 🍂 *Zero Open Burning*: Never burn dry leaves or trash; report smouldering piles on the Sameer / 311 app.',
      '3. 🚗 *Carpooling & School Vans*: Coordinate shared rides to remove single-occupancy vehicles from peak morning traffic.',
      '4. 💧 *Dust Suppression*: Sprinkle misted water on unpaved verges and ensure construction sand is covered.',
      '',
      'Let’s take collective responsibility for the air our children breathe. Shared via AeroWise (Daily Air-Quality Action Planner).',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedShareable(true);
    setTimeout(() => setCopiedShareable(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white">
                Community Clean Air Action Board
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Individual household protection is vital, but clean air is ultimately
              a shared public good. Collective community actions target root
              emission sources right in your sector, school zone, and neighbourhood.
            </p>
          </div>

          <button
            onClick={handleCopyCommunityPledge}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {copiedShareable ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Community Checklist</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Community Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communityChecklist.map((item) => (
          <Card key={item.id} className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Target: {item.audience}
                    </span>
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  Community Action
                </Badge>
              </div>

              {/* The Problem */}
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">The Problem: </strong>
                {item.problem}
              </div>

              {/* Action Step */}
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-1">
                <div className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Practical Community Step</span>
                </div>
                <p className="text-teal-950 leading-relaxed font-medium">
                  {item.actionStep}
                </p>
              </div>
            </div>

            {/* Impact */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Airshed Impact: </strong>
              {item.impact}
            </div>
          </Card>
        ))}
      </div>

      {/* Official CPCB Reporting Tools Banner */}
      <Card className="bg-slate-50 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Official Indian Pollution Complaint Channels</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In India, citizens can log geo-tagged photo complaints for open
              waste burning, unpaved road dust, and industrial violations directly
              via the <strong>CPCB SAMEER App</strong> or municipal 311 portals.
            </p>
          </div>

          <a
            href="https://app.cpcbccr.com/AQI_India/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline shrink-0"
          >
            <span>Learn More at CPCB Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Card>
    </div>
  );
}
