import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Map, List, MapPin, Navigation, Building2, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationPermission } from '@/components/LocationPermission';
import { OfficeList } from '@/components/OfficeList';
import { Office, bolivianOffices } from '@/data/offices';
import { UserLocation, calculateDistance, formatDistance, getDirectionsUrl } from '@/utils/location';
import { getFavoriteOffices } from '@/utils/favorites';

const MapView = lazy(() => import('@/components/MapView').then(module => ({ default: module.MapView })));

const IndexPageContent = ({ userLocation }: { userLocation?: UserLocation }) => {
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

  const handleGetDirections = (e: React.MouseEvent, office: Office) => {
    e.stopPropagation(); // Evita que se active el onClick del div padre
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
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex flex-col justify-between"
                    onClick={() => handleOfficeSelect(office)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm pr-2">{office.name}</h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {formatDistance(office.distance)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{office.address}</p>
                      <p className="text-xs text-gray-500">{office.city}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start p-1 h-auto mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => handleGetDirections(e, office)}
                    >
                      <Navigation className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">Obtener direcciones</span>
                    </Button>
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
              <span>Lista de Oficinas/Juzgados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] w-full relative">
                  <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  }>
                    <MapView
                      offices={bolivianOffices}
                      userLocation={userLocation}
                      selectedOffice={selectedOffice}
                      onOfficeSelect={handleOfficeSelect}
                    />
                  </Suspense>
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

const Index = () => {
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [initialLocation, setInitialLocation] = useState<UserLocation | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    // Intenta obtener la ubicación al cargar la página
    // El componente LocationPermission se encargará de la UI si es necesario
  }, []);

  const handleLocationGranted = (location: UserLocation) => {
    setInitialLocation(location);
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
      description: "Puedes buscar oficinas manualmente.",
      variant: "destructive"
    });
  };

  if (!locationPermissionAsked) {
    return <LocationPermission onLocationGranted={handleLocationGranted} onLocationDenied={handleLocationDenied} />;
  }

  return <IndexPageContent userLocation={initialLocation} />;
};

export default Index;