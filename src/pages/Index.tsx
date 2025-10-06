import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SearchBar } from '@/components/SearchBar';
import { OfficePanel } from '@/components/OfficePanel';
import { LocationPermission } from '@/components/LocationPermission';
import { Office, bolivianOffices } from '@/data/offices';
import { UserLocation, calculateDistance } from '@/utils/location';

const MapView = lazy(() => import('@/components/MapView').then(module => ({ default: module.MapView })));

const IndexPageContent = ({ userLocation }: { userLocation?: UserLocation }) => {
  const [selectedOffice, setSelectedOffice] = useState<Office | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Todos');
  const [selectedType, setSelectedType] = useState('all');
  const [isPanelOpen, setIsPanelOpen] = useState(true); // Iniciar abierto y minimizado
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  // Opciones para los filtros
  const departments = useMemo(() => ['Todos', ...Array.from(new Set(bolivianOffices.map(o => o.department))).sort()], []);
  const officeTypes = [
    { value: 'all', label: 'Todos los Tipos' },
    { value: 'oficina_central', label: 'Oficina Central' },
    { value: 'Dependencia', label: 'Dependencia' },
    { value: 'agencia', label: 'Agencia' },
    { value: 'punto_atencion', label: 'Punto de Atención' },
  ];

  // Simula el fin de la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Pequeño delay para asegurar que el mapa cargue
    return () => clearTimeout(timer);
  }, []);

  const handleOfficeSelect = (office: Office) => {
    setSelectedOffice(office);
    setIsPanelOpen(true); // Abre el panel al seleccionar una oficina
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('Todos');
    setSelectedType('all');
    toast({
      title: "Filtros limpiados",
      description: "Mostrando todas las oficinas.",
    });
  };

  const filteredOffices = useMemo(() => {
    let offices = bolivianOffices;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      offices = offices.filter(office =>
        office.name.toLowerCase().includes(lowercasedTerm) ||
        office.address.toLowerCase().includes(lowercasedTerm) ||
        office.city.toLowerCase().includes(lowercasedTerm) ||
        office.department.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      offices = offices.filter(office => office.type === selectedType);
    }

    // Filtrar por departamento
    if (selectedDepartment !== 'Todos') {
      offices = offices.filter(office => office.department === selectedDepartment);
    }

    // Calcular distancia y ordenar
    const officesWithDistance = offices.map(office => ({
      ...office,
      distance: userLocation
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            office.latitude,
            office.longitude
          )
        : null,
    }));

    if (userLocation) {
      officesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      officesWithDistance.sort((a, b) => a.name.localeCompare(b.name));
    }
    return officesWithDistance;
  }, [searchTerm, userLocation, selectedDepartment, selectedType]);

  // Calcula el padding para el mapa basado en la altura del panel.
  // 40vh es el primer snap point del panel. Añadimos un poco más para el header del panel.
  const mapPaddingBottom = useMemo(() => {
    return isPanelOpen ? window.innerHeight * 0.4 + 50 : 0;
  }, [isPanelOpen]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Mapa de fondo */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }>
        <MapView
          offices={filteredOffices}
          userLocation={userLocation}
          selectedOffice={selectedOffice}
          onOfficeSelect={handleOfficeSelect}
          bottomPadding={mapPaddingBottom}
        />
      </Suspense>

      {/* Barra de búsqueda superpuesta */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000]">
        <SearchBar
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment}
          selectedType={selectedType} setSelectedType={setSelectedType}
          departments={departments}
          officeTypes={officeTypes}
          clearFilters={clearFilters}
        />
      </div>

      {/* Panel inferior con la lista de oficinas */}
      <OfficePanel
        open={isPanelOpen}
        onDismiss={() => setIsPanelOpen(false)}
        offices={filteredOffices}
        userLocation={userLocation}
        onOfficeSelect={handleOfficeSelect}
        selectedOffice={selectedOffice}
        isLoading={isLoading}
      />
    </div>
  );
};

const Index = () => {
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [initialLocation, setInitialLocation] = useState<UserLocation | undefined>();
  const { toast } = useToast();

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LocationPermission onLocationGranted={handleLocationGranted} onLocationDenied={handleLocationDenied} />
      </div>
    );
  }

  return <IndexPageContent userLocation={initialLocation} />;
};

export default Index;