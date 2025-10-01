import React, { useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserLocation, getCurrentLocation } from '@/utils/location';

interface LocationPermissionProps {
  onLocationGranted: (location: UserLocation) => void;
  onLocationDenied: () => void;
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationGranted,
  onLocationDenied
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      onLocationGranted(location);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      onLocationDenied();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onLocationDenied();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Permitir Ubicación</CardTitle>
          <CardDescription className="text-center">
            Para mostrarte las oficinas más cercanas y calcular distancias, necesitamos acceso a tu ubicación.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Permitir Ubicación
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full"
            >
              Continuar sin ubicación
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p className="font-medium">¿Por qué necesitamos tu ubicación?</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Mostrar oficinas cercanas a ti</li>
              <li>• Calcular distancias y tiempos</li>
              <li>• Proporcionar direcciones precisas</li>
              <li>• Ordenar resultados por proximidad</li>
            </ul>
            <p className="text-gray-400">
              Tu ubicación no se almacena ni se comparte con terceros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};