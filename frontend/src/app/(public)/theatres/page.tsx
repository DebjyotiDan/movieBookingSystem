import React from 'react';
import { Building2, MapPin, Film, Sparkles } from 'lucide-react';

const mockTheatresList = [
  {
    id: 'th_1',
    name: 'PVR INOX: Forum Rex Walk',
    address: 'Brigade Road, Shanthala Nagar, Ashok Nagar',
    city: 'Bengaluru',
    screens: 6,
    amenities: ['IMAX', 'Dolby Atmos', '4DX', 'Recliner Lounge', 'Gourmet Bar'],
  },
  {
    id: 'th_2',
    name: 'Cinepolis: Nexus Koramangala',
    address: 'Hosur Rd, 7th Block, Koramangala',
    city: 'Bengaluru',
    screens: 11,
    amenities: ['Macro XE', '4DX', 'VIP Service', 'Dolby 7.1'],
  },
  {
    id: 'th_3',
    name: 'PVR: Vega City Mall',
    address: 'Bannerghatta Main Rd, Dollar Layout, BTM 2nd Stage',
    city: 'Bengaluru',
    screens: 12,
    amenities: ['IMAX with Laser', 'Playhouse', 'Gold Class', 'Dolby Atmos'],
  },
];

export default function TheatresPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Cinemas & Theatres</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Explore top-tier multiplexes, IMAX screens, and boutique cinemas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTheatresList.map((theatre) => (
          <div
            key={theatre.id}
            className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{theatre.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{theatre.address}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {theatre.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total Screens: <span className="font-semibold text-foreground">{theatre.screens} Screens</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
