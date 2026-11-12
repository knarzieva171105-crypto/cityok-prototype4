import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { InfrastructureFacility } from '../../types/model';
import { SYNTHETIC_DEMO_FACILITIES, MODEL_METADATA } from '../../constants/modelConfig';
import { MapPin, Check, AlertCircle } from 'lucide-react';

interface MapComponentProps {
  siteAreaHa: number;
  onAdoptPolygonArea?: (newAreaHa: number) => void;
  selectedFacilityId?: string | null;
  onSelectFacility?: (facility: InfrastructureFacility) => void;
}

// Calculate polygon area in hectares from LatLng coordinates
function calculatePolygonAreaHa(latlngs: [number, number][]): number {
  if (latlngs.length < 3) return 0;
  const radius = 6378137; // Earth radius in meters
  let area = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length;
    const p1 = latlngs[i];
    const p2 = latlngs[j];
    const rad1 = (p1[0] * Math.PI) / 180;
    const rad2 = (p2[0] * Math.PI) / 180;
    const deltaLng = ((p2[1] - p1[1]) * Math.PI) / 180;
    area += deltaLng * (2 + Math.sin(rad1) + Math.sin(rad2));
  }
  area = Math.abs((area * radius * radius) / 2.0); // m²
  return Math.round((area / 10000) * 100) / 100; // ha
}

export const MapComponent: React.FC<MapComponentProps> = ({
  siteAreaHa,
  onAdoptPolygonArea,
  selectedFacilityId,
  onSelectFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const facilitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapError, setMapError] = useState<string | null>(null);
  const [showBuffers, setShowBuffers] = useState(false);
  const [showSchools, setShowSchools] = useState(true);
  const [showKindergartens, setShowKindergartens] = useState(true);
  const [showParkings, setShowParkings] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'schematic'>('map');

  // Initial parcel coordinates in Privolzhsky district, Kazan
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([
    [55.7485, 49.1930],
    [55.7510, 49.1990],
    [55.7475, 49.2025],
    [55.7450, 49.1960],
  ]);

  const geometricAreaHa = calculatePolygonAreaHa(polygonCoords);

  useEffect(() => {
    if (!mapContainerRef.current || viewMode !== 'map') return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center in Privolzhsky District, Kazan
      const map = L.map(mapContainerRef.current, {
        center: [55.748, 49.195],
        zoom: 14,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Base tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      });

      tileLayer.on('tileerror', () => {
        // Fallback
      });
      tileLayer.addTo(map);

      // Facilities layer group
      facilitiesLayerGroupRef.current = L.layerGroup().addTo(map);
      bufferLayerGroupRef.current = L.layerGroup().addTo(map);

      // Parcel Polygon
      const parcelPolygon = L.polygon(polygonCoords, {
        color: '#F59E0B',
        weight: 3,
        fillColor: '#F59E0B',
        fillOpacity: 0.25,
        dashArray: '6, 6',
      });
      parcelPolygon.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #d97706;">Границы земельного участка ЖК</strong><br/>
          Локация: Приволжский район, Казань<br/>
          Площадь контура на карте: <strong>${geometricAreaHa} га</strong><br/>
          Текущая расчётная площадь проекта: <strong>${siteAreaHa} га</strong>
        </div>
      `);
      parcelPolygon.addTo(map);
      polygonLayerRef.current = parcelPolygon;

    } catch (err: any) {
      console.warn('Leaflet map initialization warning, falling back to schematic:', err);
      setMapError('Картографический сервис недоступен. Включена резервная схема.');
      setViewMode('schematic');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // Update facilities markers and buffers when layers toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerGroupRef.current || !bufferLayerGroupRef.current) return;

    facilitiesLayerGroupRef.current.clearLayers();
    bufferLayerGroupRef.current.clearLayers();

    SYNTHETIC_DEMO_FACILITIES.forEach((facility) => {
      if (facility.type === 'school' && !showSchools) return;
      if (facility.type === 'kindergarten' && !showKindergartens) return;
      if (facility.type === 'parking' && !showParkings) return;

      const markerColor =
        facility.type === 'school'
          ? '#3B82F6'
          : facility.type === 'kindergarten'
          ? '#EC4899'
          : '#10B981';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">
            ${facility.type === 'school' ? 'Ш' : facility.type === 'kindergarten' ? 'Д' : 'П'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(facility.coordinates, { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; max-width: 260px;">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #0f172a;">
            ${facility.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            Статус: <strong>${facility.qualityStatus === 'fact' ? 'Подтверждённый факт' : 'Сценарная оценка'}</strong>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; margin-bottom: 4px;">
            Проектная мощность: <strong>${facility.totalCapacity}</strong><br/>
            Текущая загрузка: <strong>${facility.currentLoad !== null ? facility.currentLoad : 'Данных нет'}</strong><br/>
            Доступный резерв: <strong style="color: ${facility.availableReserve !== null && facility.availableReserve > 0 ? '#16a34a' : '#dc2626'};">
              ${facility.availableReserve !== null ? `${facility.availableReserve} мест` : 'Не определён (загрузка неизвестна)'}
            </strong>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px; font-style: italic;">
            ${facility.notes || ''}<br/>
            <strong>Примечание:</strong> ${MODEL_METADATA.syntheticDataNotice}
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(facility);
      });

      marker.addTo(facilitiesLayerGroupRef.current!);

      if (showBuffers) {
        const radius = facility.type === 'school' ? 750 : facility.type === 'kindergarten' ? 400 : 500;
        const circle = L.circle(facility.coordinates, {
          radius,
          color: markerColor,
          weight: 1,
          dashArray: '4, 4',
          fillColor: markerColor,
          fillOpacity: 0.08,
        });
        circle.bindTooltip(`Условная зона визуализации (${radius}м)`, {
          sticky: true,
        });
        circle.addTo(bufferLayerGroupRef.current!);
      }
    });
  }, [showSchools, showKindergartens, showParkings, showBuffers]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
      
      {/* Top Map Control Bar */}
      <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">
            Участок на карте
          </span>
          <span className="text-slate-400 text-[11px]">
            (Приволжский район Казани)
          </span>
        </div>

        {/* Layer Switches & View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={showSchools}
              onChange={(e) => setShowSchools(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span>Школы</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={showKindergartens}
              onChange={(e) => setShowKindergartens(e.target.checked)}
              className="accent-pink-500 rounded"
            />
            <span>Детсады</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={showParkings}
              onChange={(e) => setShowParkings(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Парковки</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px] ml-1">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span title="Условная зона визуализации">Зоны</span>
          </label>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'schematic' : 'map')}
            className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {viewMode === 'map' ? 'Схема' : 'Карта'}
          </button>
        </div>
      </div>

      {/* Map or Schematic Container */}
      <div className="relative w-full h-[320px] bg-slate-950">
        {viewMode === 'map' ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-300 space-y-3">
            <div className="w-48 h-32 border-2 border-dashed border-amber-500/60 rounded-xl bg-amber-500/10 flex flex-col items-center justify-center p-3">
              <span className="font-bold text-amber-400 text-sm">Участок ЖК</span>
              <span className="font-mono text-slate-300 mt-1">{siteAreaHa} га</span>
              <span className="text-[10px] text-slate-400">Приволжский р-н</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-md">
              Схематический план земельного участка. Площадь участка ({siteAreaHa} га) используется в математическом ядре модели как основа для расчета ТЭП и градостроительных плотностей.
            </p>
          </div>
        )}

        {showBuffers && viewMode === 'map' && (
          <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/90 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
            Круги: условная зона визуализации, не сетевая нормативная доступность
          </div>
        )}
      </div>

      {/* Polygon Area & Adoption Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
          <span>Площадь контура на карте:</span>
          <strong className="font-mono text-white text-xs">{geometricAreaHa} га</strong>
          <span className="text-slate-500">|</span>
          <span>В проекте:</span>
          <strong className="font-mono text-amber-400 text-xs">{siteAreaHa} га</strong>
        </div>

        {onAdoptPolygonArea && Math.abs(geometricAreaHa - siteAreaHa) > 0.05 && (
          <button
            onClick={() => onAdoptPolygonArea(geometricAreaHa)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition-colors whitespace-nowrap"
            title="Применить геометрическую площадь контура в параметры проекта"
          >
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>Использовать эту площадь в проекте ({geometricAreaHa} га)</span>
          </button>
        )}
      </div>

      {/* Synthetic Data Disclaimer Footer */}
      <div className="px-3.5 py-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          {MODEL_METADATA.syntheticDataNotice} Без дорожного графа сетевые изохроны и пешеходные барьеры не рассчитываются.
        </span>
      </div>

    </div>
  );
};
