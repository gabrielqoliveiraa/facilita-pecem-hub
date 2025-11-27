import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapDisplayProps {
  origin: [number, number] | null;
  destination: [number, number] | null;
  mapboxToken: string;
  onRouteCalculated?: (distance: number, duration: number, steps: string[]) => void;
}

const MapDisplay = ({ origin, destination, mapboxToken, onRouteCalculated }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<{ origin?: mapboxgl.Marker; destination?: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Centro do Complexo do Pecém
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-38.8987, -3.5469],
      zoom: 12,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !origin || !destination) return;

    // Remover marcadores antigos
    markers.origin?.remove();
    markers.destination?.remove();

    // Adicionar novos marcadores
    const originMarker = new mapboxgl.Marker({ color: "#10b981" })
      .setLngLat(origin)
      .addTo(map.current);

    const destinationMarker = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat(destination)
      .addTo(map.current);

    setMarkers({ origin: originMarker, destination: destinationMarker });

    // Calcular rota
    fetchRoute(origin, destination);

    // Ajustar visualização
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.current.fitBounds(bounds, { padding: 80 });
  }, [origin, destination]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?` +
        `geometries=geojson&` +
        `steps=true&` +
        `language=pt&` +
        `access_token=${mapboxToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Desenhar rota no mapa
        if (map.current?.getSource("route")) {
          (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          });
        } else {
          map.current?.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route.geometry,
              },
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 5,
              "line-opacity": 0.75,
            },
          });
        }

        // Extrair instruções
        const steps = route.legs[0].steps.map((step: any) => step.maneuver.instruction);
        
        onRouteCalculated?.(
          route.distance / 1000, // metros para km
          route.duration / 60, // segundos para minutos
          steps
        );
      }
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    }
  };

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg" />
  );
};

export default MapDisplay;
