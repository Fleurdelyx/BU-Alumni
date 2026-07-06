'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GraduationCap, Briefcase, Users } from 'lucide-react';

type MapPin = {
  location: string;
  program: string;
  industry: string;
  alumni_count: number;
  lat: number;
  lng: number;
  matchedName: string;
};

const PH_CENTER: [number, number] = [12.8797, 121.774];
const PH_ZOOM = 6;

export function CareerMap({ pins }: { pins: MapPin[] }) {
  if (pins.length === 0) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm font-medium">No mappable locations yet</p>
        <p className="text-xs mt-1">Locations will appear once tracer studies are submitted.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={PH_CENTER}
      zoom={PH_ZOOM}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', background: '#e5e7eb' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin, idx) => (
        <CircleMarker
          key={`${pin.location}-${pin.program}-${pin.industry}-${idx}`}
          center={[pin.lat, pin.lng]}
          radius={Math.max(6, Math.min(18, 6 + pin.alumni_count * 1.5))}
          pathOptions={{
            fillColor: '#1e3a8a',
            color: '#172554',
            weight: 1,
            fillOpacity: 0.75,
          }}
        >
          <Popup>
            <div className="space-y-1 min-w-[180px]">
              <p className="font-semibold text-sm">{pin.matchedName}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {pin.program}
                </p>
                <p className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {pin.industry}
                </p>
                <p className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {pin.alumni_count} alumni
                </p>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
