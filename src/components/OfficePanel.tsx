import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { OfficeList } from './OfficeList';
import { Office } from '@/data/offices';
import { UserLocation } from '@/utils/location';
import 'react-spring-bottom-sheet/dist/style.css';

interface OfficePanelProps {
  offices: (Office & { distance: number | null })[];
  userLocation?: UserLocation;
  onOfficeSelect: (office: Office) => void;
  selectedOffice?: Office;
  isLoading: boolean;
  open: boolean;

}

export const OfficePanel: React.FC<OfficePanelProps> = ({
  offices,
  userLocation,
  onOfficeSelect,
  selectedOffice,
  isLoading,
  open,
}) => {
  return (
    <BottomSheet
      open={open}
      blocking={false}

      // Define las alturas a las que el panel puede ajustarse.
      snapPoints={({ minHeight, maxHeight }) => [
        minHeight *0.1,// Altura mínima (solo el encabezado)
        maxHeight * 0.3, // 40% de la altura de la pantalla
        maxHeight * 0.5, // 90% de la altura de la pantalla
      ]}
      defaultSnap={({ snapPoints }) => snapPoints[1]}
      header={
        <div className="p-3 w-full">
          <div className="w-8 h-1.5 bg-gray-300 rounded-full mx-auto mb-2" />
          <h3 className="text-sm font-medium text-center text-gray-600">
            {isLoading ? 'Buscando...' : `${offices.length} oficinas cercanas`}
          </h3>
        </div>
      }
      className="z-[1000]" // Asegura que esté sobre el mapa
      style={{ '--rsbs-content-height': '75%' } as React.CSSProperties} // Permite que el contenido ocupe toda la altura
    >
      <div className="px-2">
        <OfficeList offices={offices} userLocation={userLocation} onOfficeSelect={onOfficeSelect} selectedOffice={selectedOffice} />
      </div>
    </BottomSheet>
  );
};