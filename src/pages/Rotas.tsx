import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MapDisplay from "@/components/routes/MapDisplay";
import AddressSearch from "@/components/routes/AddressSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Clock, Route, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Rotas = () => {
  const { toast } = useToast();
  const [mapboxToken, setMapboxToken] = useState("");
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    steps: string[];
  } | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setOrigin(coords);
        setOriginAddress("Sua localização atual");
        toast({
          title: "Localização obtida!",
          description: "Agora escolha seu destino",
        });
      },
      (error) => {
        toast({
          title: "Erro ao obter localização",
          description: "Verifique se você permitiu o acesso à localização",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Rotas" />
      
      <div className="px-4 py-6 space-y-4">
        {/* Token do Mapbox */}
        {!mapboxToken && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Configure o Token do Mapbox
              </CardTitle>
              <CardDescription className="text-xs">
                Cole seu token público do Mapbox abaixo. Você pode obtê-lo em{" "}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  mapbox.com
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoiZXhhbXBsZS..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  if (mapboxToken.startsWith('pk.')) {
                    toast({
                      title: "Token configurado!",
                      description: "Agora você pode usar o mapa de rotas",
                    });
                  } else {
                    toast({
                      title: "Token inválido",
                      description: "O token deve começar com 'pk.'",
                      variant: "destructive",
                    });
                    setMapboxToken("");
                  }
                }}
                className="w-full"
                disabled={!mapboxToken}
              >
                Salvar Token
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Origem */}
        {mapboxToken && (
          <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              De onde você está?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
              <Button
                onClick={handleGetCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Usar minha localização atual
              </Button>
              <div className="text-center text-xs text-muted-foreground">ou</div>
              <AddressSearch
                mapboxToken={mapboxToken}
                placeholder="Digite o endereço de origem..."
                onSelectAddress={(coords, address) => {
                  setOrigin(coords);
                  setOriginAddress(address);
                }}
              />
              {originAddress && (
                <p className="text-sm text-muted-foreground">📍 {originAddress}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Destino */}
        {mapboxToken && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4 text-destructive" />
                Para onde você quer ir?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressSearch
                mapboxToken={mapboxToken}
                placeholder="Digite o endereço de destino..."
                onSelectAddress={(coords, address) => {
                  setDestination(coords);
                  setDestinationAddress(address);
                }}
              />
              {destinationAddress && (
                <p className="text-sm text-muted-foreground mt-3">🎯 {destinationAddress}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mapa */}
        {mapboxToken && (
          <div className="h-[400px] rounded-lg overflow-hidden border border-border">
            <MapDisplay
              mapboxToken={mapboxToken}
              origin={origin}
              destination={destination}
              onRouteCalculated={(distance, duration, steps) => {
                setRouteInfo({ distance, duration, steps });
              }}
            />
          </div>
        )}

        {/* Informações da Rota */}
        {mapboxToken && routeInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Rota</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Route className="h-4 w-4" />
                  {routeInfo.distance.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(routeInfo.duration)} min
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Instruções:</h4>
                <ol className="space-y-2">
                  {routeInfo.steps.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="font-semibold text-foreground">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Rotas;
