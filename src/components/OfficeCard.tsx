import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Share2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Office } from '@/data/offices';
import { UserLocation, calculateDistance, formatDistance, getDirectionsUrl, shareOfficeLocation } from '@/utils/location';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/favorites';

interface OfficeCardProps {
  office: Office;
  userLocation?: UserLocation;
  onViewOnMap?: (office: Office) => void;
}

export const OfficeCard: React.FC<OfficeCardProps> = ({ 
  office, 
  userLocation, 
  onViewOnMap 
}) => {
  const [favorite, setFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFavorite(isFavorite(office.id));
  }, [office.id]);

  const distance = userLocation 
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        office.latitude,
        office.longitude
      )
    : null;

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(office.id);
      setFavorite(false);
      toast({
        title: "Removido de favoritos",
        description: `${office.name} ha sido removido de tus favoritos`,
      });
    } else {
      addToFavorites(office.id);
      setFavorite(true);
      toast({
        title: "Agregado a favoritos",
        description: `${office.name} ha sido agregado a tus favoritos`,
      });
    }
  };

  const handleGetDirections = () => {
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
        description: "Necesitamos tu ubicación para proporcionar direcciones",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'oficina_central':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sucursal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'agencia':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'punto_atencion':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'oficina_central':
        return 'Oficina Central';
      case 'sucursal':
        return 'Sucursal';
      case 'agencia':
        return 'Agencia';
      case 'punto_atencion':
        return 'Punto de Atención';
      default:
        return type;
    }
  };

  // const isOpen = () => {
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

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {office.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getTypeColor(office.type)}>
                {getTypeLabel(office.type)}
              </Badge>
              {distance && (
                <Badge variant="outline" className="text-blue-600">
                  {formatDistance(distance)}
                </Badge>
              )}
              {/* <Badge 
                variant={isOpen() ? "default" : "secondary"}
                className={isOpen() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {isOpen() ? "Abierto" : "Cerrado"}
              </Badge> */}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="ml-2"
          >
            <Star 
              className={`h-4 w-4 ${favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p>{office.address}</p>
            <p className="text-gray-500">{office.city}, {office.department}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <a 
            href={`tel:${office.phone}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {office.phone}
          </a>
        </div>

        {/* <div className="flex items-start space-x-2">
          <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p>Hoy: {office.hours[Object.keys(office.hours)[new Date().getDay()]]}</p>
          </div>
        </div> */}

        {office.services.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Servicios:</p>
            <div className="flex flex-wrap gap-1">
              {office.services.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {office.description && (
          <p className="text-sm text-gray-600">{office.description}</p>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          {onViewOnMap && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOnMap(office)}
              className="flex-1 min-w-0"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Ver en Mapa
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetDirections}
            disabled={!userLocation}
            className="flex-1 min-w-0"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Direcciones
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 min-w-0"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};