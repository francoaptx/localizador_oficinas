import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Office } from '@/data/offices';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  departments: string[];
  suggestions: Office[];
  onSuggestionSelect: (office: Office) => void;
  clearFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm, setSearchTerm,
  selectedDepartment, setSelectedDepartment,
  departments, suggestions,
  onSuggestionSelect, clearFilters
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Card className="shadow-lg my-4 mx-9 md:mx-4 lg:mx-0 z-[1000]">
      <CardContent className="p-1">
        <div className="flex items-center space-x-2">
          <div className="flex-grow">
            <Command>
              <div className="relative">
                {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
                <CommandInput
                  placeholder="Buscar oficinas..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  onFocus={() => setIsPopoverOpen(true)}
                  onBlur={() => setTimeout(() => setIsPopoverOpen(false), 150)} // Delay to allow click on item
                  className="pl-2 h-10 text-base"
                />
                {searchTerm && (
                  <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setSearchTerm('')}>
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
              {isPopoverOpen && suggestions.length > 0 && (
                <CommandList>
                  <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  {suggestions.map((office) => (
                    <CommandItem key={office.id} onSelect={() => {
                      onSuggestionSelect(office);
                      setIsPopoverOpen(false);
                    }}>{office.name}</CommandItem>
                  ))}
                </CommandList>
              )}
            </Command>
          </div>

          {/* Filtro por Departamento */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="p-1 w-[70px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
            </SelectContent>
          </Select>

        </div>
      </CardContent>
    </Card>
  );
};