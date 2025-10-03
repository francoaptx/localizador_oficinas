import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { OfficeCard } from '@/components/OfficeCard';
import { Office, bolivianOffices } from '@/data/offices';
import { UserLocation, calculateDistance } from '@/utils/location';

interface OfficeListProps {
  userLocation?: UserLocation;
  onViewOnMap: (office: Office) => void;
}

const officeTypes = [
  { value: 'all', label: 'Todos los Tipos' },
  { value: 'oficina_central', label: 'Oficina Central' },
  { value: 'Dependencia', label: 'Dependencia' },
  { value: 'agencia', label: 'Agencia' },
  { value: 'punto_atencion', label: 'Punto de Atención' },
];

const departments = [
  'Todos', 'La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 
  'Chuquisaca', 'Tarija', 'Beni', 'Pando'
];

export const OfficeList: React.FC<OfficeListProps> = ({ userLocation, onViewOnMap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('Todos');

  const filteredAndSortedOffices = useMemo(() => {
    let offices = bolivianOffices;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      offices = offices.filter(office =>
        office.name.toLowerCase().includes(lowercasedTerm) ||
        office.address.toLowerCase().includes(lowercasedTerm) ||
        office.city.toLowerCase().includes(lowercasedTerm)
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

    // Ordenar por distancia si la ubicación está disponible, si no, alfabéticamente
    if (userLocation) {
      officesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      officesWithDistance.sort((a, b) => a.name.localeCompare(b.name));
    }

    return officesWithDistance;
  }, [searchTerm, selectedType, selectedDepartment, userLocation]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDepartment('Todos');
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedDepartment !== 'Todos';

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 bg-white rounded-lg shadow-sm border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, ciudad o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Tipo */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              {officeTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Departamento */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botón de Limpiar Filtros */}
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            disabled={!hasActiveFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Oficinas */}
      {filteredAndSortedOffices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedOffices.map(office => (
            <OfficeCard
              key={office.id}
              office={office}
              userLocation={userLocation}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No se encontraron oficinas
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Intenta ajustar tus filtros de búsqueda o revisa si hay errores de escritura.
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="mt-6"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar todos los filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};