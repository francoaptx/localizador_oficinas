import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon, LatLngBounds } from 'leaflet';
import { MapPin, Navigation, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Office } from '@/data/offices';
import { UserLocation, getDirectionsUrl, shareOfficeLocation } from '@/utils/location';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/favorites';
import logotipo from '/logotipo.jpg'; // Importar la imagen
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente React para el icono SVG del marcador
const MarkerIconSvg: React.FC<{ color: string }> = ({ color }) => (
  <svg width="12" height="25" viewBox="0 0 12 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0C2.7 0 0 2.7 0 6c0 6 6 13.7 6 13.7S12 12 12 6C12 2.7 9.3 0 6 0z" fill={color} />
    <circle cx="6" cy="6" r="2.9" fill="white" />
  </svg>
);

// Iconos personalizados para diferentes tipos de oficinas
const createCustomIcon = (type: string, isSelected: boolean = false) => {
  if (isSelected) {
    const iconMarkup = renderToStaticMarkup(<MarkerIconSvg color="#ff0000ff" />); // Un color oscuro y neutro para resaltar
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(iconMarkup)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }

  const colors = {
    oficina_central: '#3b82f6',
    Dependencia: '#10b981',
    agencia: '#f59e0b',
    punto_atencion: '#8b5cf6'
  };

  const color = colors[type as keyof typeof colors] || '#6b7280'; // Color por defecto
  
  const iconMarkup = renderToStaticMarkup(<MarkerIconSvg color={color} />);
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(iconMarkup)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const userLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `)}`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapViewProps {
  offices: Office[];
  userLocation?: UserLocation;
  selectedOffice?: Office;
  onOfficeSelect?: (office: Office) => void;
  bottomPadding?: number;
}

// Componente para ajustar la vista del mapa
const MapController: React.FC<{
  offices: Office[];
  userLocation?: UserLocation;
  selectedOffice?: Office;
  bottomPadding?: number;
}> = ({ offices, userLocation, selectedOffice, bottomPadding = 0 }) => {
  const map = useMap();

  useEffect(() => {
    // Centro por defecto en Bolivia
    const defaultCenter: [number, number] = [-16.5, -65.5];

    if (selectedOffice) {
      map.flyTo([selectedOffice.latitude, selectedOffice.longitude], 15, {
        paddingBottomRight: [0, bottomPadding]
      });
  
    } else if (offices.length > 0) {
      const bounds = new LatLngBounds([]);
      
      offices.forEach(office => {
        bounds.extend([office.latitude, office.longitude]);
      });
      
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], paddingBottomRight: [0, bottomPadding], maxZoom: 15 });
      } else {
        map.setView(defaultCenter, 5); // Vista por defecto si los bounds no son válidos
      }
    } else {
      map.setView(defaultCenter, 5); // Vista por defecto si no hay oficinas
    }
  }, [map, offices, userLocation, selectedOffice, bottomPadding]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  offices,
  userLocation,
  selectedOffice,
  onOfficeSelect,
  bottomPadding = 0
}) => {
  const { toast } = useToast();
  const [favoriteStates, setFavoriteStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const states: { [key: string]: boolean } = {};
    offices.forEach(office => {
      states[office.id] = isFavorite(office.id);
    });
    setFavoriteStates(states);
  }, [offices]);

  const handleToggleFavorite = (office: Office) => {
    const currentlyFavorite = favoriteStates[office.id];
    
    if (currentlyFavorite) {
      removeFromFavorites(office.id);
      setFavoriteStates(prev => ({ ...prev, [office.id]: false }));
      toast({
        title: "Removido de favoritos",
        description: `${office.name} ha sido removido de tus favoritos`,
      });
    } else {
      addToFavorites(office.id);
      setFavoriteStates(prev => ({ ...prev, [office.id]: true }));
      toast({
        title: "Agregado a favoritos",
        description: `${office.name} ha sido agregado a tus favoritos`,
      });
    }
  };

  const handleGetDirections = (office: Office) => {
    if (userLocation) {
      const url = getDirectionsUrl(
        userLocation.latitude,
        userLocation.longitude,
        office.latitude,
        office.longitude,
        office.name
      );
      window.open(url, '_blank');
    } else {
      toast({
        title: "Ubicación no disponible",
        description: "Necesitamos tu ubicación para proporcionar Indicaciones",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (office: Office) => {
    try {
      await shareOfficeLocation(
        office.name,
        office.address,
        office.latitude,
        office.longitude
      );
      toast({
        title: "Ubicación compartida",
        description: "La información de la oficina ha sido compartida",
      });
    } catch (error) {
      toast({
        title: "Error al compartir",
        description: "No se pudo compartir la ubicación",
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'oficina_central':
        return 'Oficina Central';
      case 'Dependencia':
        return 'Dependencia';
      case 'agencia':
        return 'Agencia';
      case 'punto_atencion':
        return 'Punto de Atención';
      default:
        return type;
    }
  };

  // const isOpen = (office: Office) => {
  //   const now = new Date();
  //   const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  //   const currentTime = now.getHours() * 100 + now.getMinutes();
    
  //   const dayMap: { [key: string]: keyof Office['hours'] } = {
  //     'sunday': 'sunday',
  //     'monday': 'monday',
  //     'tuesday': 'tuesday',
  //     'wednesday': 'wednesday',
  //     'thursday': 'thursday',
  //     'friday': 'friday',
  //     'saturday': 'saturday'
  //   };

  //   const todayHours = office.hours[dayMap[currentDay]];
  //   if (todayHours === 'Cerrado') return false;

  //   const [start, end] = todayHours.split(' - ');
  //   const startTime = parseInt(start.replace(':', ''));
  //   const endTime = parseInt(end.replace(':', ''));

  //   return currentTime >= startTime && currentTime <= endTime;
  // };

  // Centro por defecto en Bolivia
  const defaultCenter: [number, number] = [-16.5000, -68.1193]; // La Paz

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      {/* Logo de la Institución (movido fuera del MapContainer) */}
      <div className="absolute top-16 right-2 z-[1001] lg:top-8 lg:right-2 bg-white p-1 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
        <a>
          <img 
            src={logotipo} 
            alt="Logo Institución" 
            className="w-16 h-16 md:w-24 md:h-24 object-contain"
          />
        </a>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Estándar">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Relieve">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            />
            </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController
          offices={offices}
          userLocation={userLocation}
          selectedOffice={selectedOffice}
          bottomPadding={bottomPadding} // Pasamos el padding aquí
        />

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">Tu ubicación</h3>
                <p className="text-xs text-gray-600">
                  Precisión: {userLocation.accuracy ? `${Math.round(userLocation.accuracy)}m` : 'Desconocida'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de oficinas */}
        {offices.map(office => (
          <Marker
            key={office.id}
            position={[office.latitude, office.longitude]}
            icon={createCustomIcon(office.type, selectedOffice?.id === office.id)}
            zIndexOffset={selectedOffice?.id === office.id ? 1000 : 0}
            eventHandlers={{
              click: () => onOfficeSelect?.(office)
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-3 min-w-[280px]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-base mb-1">{office.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(office.type)}
                      </Badge>
                      {/* <Badge 
                        variant={isOpen(office) ? "default" : "secondary"}
                        className={`text-xs ${isOpen(office) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isOpen(office) ? "Abierto" : "Cerrado"}
                      </Badge> */}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(office)}
                    className="p-1"
                  >
                    <Star 
                      className={`h-4 w-4 ${favoriteStates[office.id] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                    />
                  </Button>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p>{office.address}</p>
                      <p className="text-gray-500">{office.city}, {office.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <a 
                      href={`tel:${office.phone}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {office.phone}
                    </a>
                  </div>

                  {/* <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p>Hoy: {office.hours[Object.keys(office.hours)[new Date().getDay()]]}</p>
                    </div>
                  </div> */}
                </div>

                {office.services.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Servicios:</p>
                    <div className="flex flex-wrap gap-1">
                      {office.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {office.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{office.services.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleGetDirections(office)}
                    disabled={!userLocation}
                    className="flex-1 text-xs h-8"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Indicaciones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(office)}
                    className="flex-1 text-xs h-8"
                  >
                    Compartir
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};