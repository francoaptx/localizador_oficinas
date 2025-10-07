import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Office } from '@/data/offices';
import { UserLocation, formatDistance, getDirectionsUrl } from '@/utils/location';
import { useToast } from '@/hooks/use-toast';

interface OfficeListProps {
  offices: (Office & { distance: number | null })[];
  userLocation?: UserLocation;
  onOfficeSelect: (office: Office) => void;
  selectedOffice?: Office;
}

export const OfficeList: React.FC<OfficeListProps> = ({ offices, userLocation, onOfficeSelect, selectedOffice }) => {
  const { toast } = useToast();

  const handleGetDirections = (e: React.MouseEvent, office: Office) => {
    e.stopPropagation();
    if (userLocation) {
      const url = getDirectionsUrl(userLocation.latitude, userLocation.longitude, office.latitude, office.longitude, office.name);
      window.open(url, '_blank');
    } else {
      toast({
        title: "Ubicación no disponible",
        description: "Necesitamos tu ubicación para proporcionar Indicaciones",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
      {offices.length > 0 ? (
        <ScrollArea className="h-full w-full">
          <div className="space-y-2 pr-4 pb-4">
            {offices.map((office, index) => (
              <React.Fragment key={office.id}>
                <div
                  onClick={() => onOfficeSelect(office)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedOffice?.id === office.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-sm text-gray-800">{office.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{office.address}</p>
                    </div>
                    {office.distance !== null && (
                      <Badge variant="outline" className="ml-4 flex-shrink-0">{formatDistance(office.distance)}</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">{office.city}, {office.department}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-1 text-blue-600 hover:text-blue-700"
                      onClick={(e) => handleGetDirections(e, office)}
                    >
                      <Navigation className="h-4 w-4 mr-1.5" />
                      <span className="text-xs">Indicaciones</span>
                    </Button>
                  </div>
                </div>
                {index < offices.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8">
          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            No se encontraron oficinas. Intenta ampliar tu búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};