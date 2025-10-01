import React, { useState, useEffect, useMemo } from 'react';
import { Map, List, MapPin, Navigation, Building2, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LocationPermission } from '@/components/LocationPermission';
import { MapView } from '@/components/MapView';
import { OfficeList } from '@/components/OfficeList';
import { Office, bolivianOffices } from '@/data/offices';
import { UserLocation, calculateDistance, formatDistance } from '@/utils/location';
import { getFavoriteOffices } from '@/utils/favorites';

const Index = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>();
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | undefined>();
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  // Estadísticas de oficinas
  const officeStats = useMemo(() => {
    const stats = {
      total: bolivianOffices.length,
      departments: new Set(bolivianOffices.map(o => o.department)).size,
      favorites: getFavoriteOffices(bolivianOffices).length,
      nearby: 0
    };

    if (userLocation) {
      stats.nearby = bolivianOffices.filter(office => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          office.latitude,
          office.longitude
        );
        return distance <= 10; // Dentro de 10km
      }).length;
    }

    return stats;
  }, [userLocation]);

  // Oficinas más cercanas
  const nearbyOffices = useMemo(() => {
    if (!userLocation) return [];

    return bolivianOffices
      .map(office => ({
        ...office,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          office.latitude,
          office.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [userLocation]);

  const handleLocationGranted = (location: UserLocation) => {
    setUserLocation(location);
    setLocationPermissionAsked(true);
    toast({
      title: "Ubicación obtenida",
      description: "Ahora puedes ver las oficinas más cercanas a ti",
    });
  };

  const handleLocationDenied = () => {
    setLocationPermissionAsked(true);
    toast({
      title: "Ubicación no disponible",
      description: "Puedes buscar oficinas manualmente",
      variant: "destructive"
    });
  };

  const handleOfficeSelect = (office: Office) => {
    setSelectedOffice(office);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  const handleViewOnMap = (office: Office) => {
    setSelectedOffice(office);
    setActiveTab('map');
  };

  // Si no se ha preguntado por la ubicación, mostrar el componente de permisos
  if (!locationPermissionAsked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LocationPermission
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Oficinas Bolivia
                </h1>
                <p className="text-sm text-gray-500">
                  Encuentra oficinas cerca de ti
                </p>
              </div>
            </div>
            
            {userLocation && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Ubicación activa</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{officeStats.total}</p>
                  <p className="text-sm text-gray-500">Oficinas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{officeStats.departments}</p>
                  <p className="text-sm text-gray-500">Departamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{officeStats.favorites}</p>
                  <p className="text-sm text-gray-500">Favoritos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{officeStats.nearby}</p>
                  <p className="text-sm text-gray-500">Cercanas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Oficinas cercanas (solo si hay ubicación) */}
        {userLocation && nearbyOffices.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span>Oficinas más cercanas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {nearbyOffices.map(office => (
                  <div
                    key={office.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOfficeSelect(office)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{office.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {formatDistance(office.distance)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{office.address}</p>
                    <p className="text-xs text-gray-500">{office.city}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenido principal con tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] w-full">
                  <MapView
                    offices={bolivianOffices}
                    userLocation={userLocation}
                    selectedOffice={selectedOffice}
                    onOfficeSelect={handleOfficeSelect}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <OfficeList
              userLocation={userLocation}
              onViewOnMap={handleViewOnMap}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;