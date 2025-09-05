import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, MoreHorizontal, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Driver } from '../types/coordinator';

interface MapPanelProps {
  drivers: Driver[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MapPanel = ({ drivers, isExpanded, onToggleExpand }: MapPanelProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverPositions, setDriverPositions] = useState<{[key: string]: {x: number, y: number}}>({});

  // Initialize scattered positions for drivers
  useEffect(() => {
    const positions: {[key: string]: {x: number, y: number}} = {};
    const areas = [
      {minX: 50, maxX: 200, minY: 60, maxY: 140},   // Northwest
      {minX: 200, maxX: 400, minY: 80, maxY: 180},  // North
      {minX: 400, maxX: 600, minY: 90, maxY: 170},  // Northeast
      {minX: 80, maxX: 280, minY: 180, maxY: 280},  // West
      {minX: 280, maxX: 520, minY: 160, maxY: 260}, // Center
      {minX: 520, maxX: 750, minY: 140, maxY: 240}, // East
      {minX: 120, maxX: 320, minY: 280, maxY: 350}, // Southwest
      {minX: 320, maxX: 580, minY: 270, maxY: 340}, // South
      {minX: 580, maxX: 780, minY: 260, maxY: 330}, // Southeast
      {minX: 650, maxX: 820, minY: 100, maxY: 200}  // Far East
    ];
    
    drivers.forEach((driver, index) => {
      const area = areas[index % areas.length];
      positions[driver.id] = {
        x: area.minX + Math.random() * (area.maxX - area.minX),
        y: area.minY + Math.random() * (area.maxY - area.minY)
      };
    });
    
    setDriverPositions(positions);
  }, [drivers]);

  // Animate driver movement over time
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPositions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(driverId => {
          const driver = drivers.find(d => d.id === driverId);
          if (driver?.status === 'active' || driver?.status === 'busy') {
            // Small random movement for active/busy drivers
            updated[driverId] = {
              x: Math.max(20, Math.min(800, updated[driverId].x + (Math.random() - 0.5) * 15)),
              y: Math.max(40, Math.min(360, updated[driverId].y + (Math.random() - 0.5) * 10))
            };
          }
        });
        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [drivers]);

  // Mock map implementation - in real app would use Mapbox/Google Maps
  const MapComponent = () => {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg overflow-hidden">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-primary">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Roads and Routes */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Extended Main routes */}
          <path 
            d="M 20 80 Q 120 60 220 90 Q 320 120 420 100 Q 520 80 620 110 Q 720 140 800 120" 
            stroke="hsl(var(--route-primary))" 
            strokeWidth="4" 
            fill="none"
            className="opacity-70"
          />
          <path 
            d="M 30 180 Q 130 200 230 170 Q 330 140 430 160 Q 530 180 630 150 Q 730 120 820 140" 
            stroke="hsl(var(--route-primary))" 
            strokeWidth="4" 
            fill="none"
            className="opacity-70"
          />
          <path 
            d="M 80 300 Q 180 280 280 300 Q 380 320 480 300 Q 580 280 680 300 Q 780 320 850 300" 
            stroke="hsl(var(--route-primary))" 
            strokeWidth="4" 
            fill="none"
            className="opacity-70"
          />
          {/* Extended Alternative routes */}
          <path 
            d="M 20 80 L 90 95 L 160 85 L 230 100 L 300 90 L 370 105 L 440 95 L 510 110 L 580 100 L 650 115 L 720 105 L 800 120" 
            stroke="hsl(var(--route-alternative))" 
            strokeWidth="3" 
            fill="none"
            strokeDasharray="8,4"
            className="opacity-80"
          />
          <path 
            d="M 50 250 L 140 240 L 220 255 L 310 245 L 400 260 L 490 250 L 580 265 L 670 255 L 750 270 L 830 260" 
            stroke="hsl(var(--route-alternative))" 
            strokeWidth="3" 
            fill="none"
            strokeDasharray="6,3"
            className="opacity-70"
          />
        </svg>

        {/* Driver Markers */}
        {drivers.map((driver, index) => {
          const position = driverPositions[driver.id] || { x: 100, y: 100 };
          return (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: position.x,
                y: position.y
              }}
              transition={{ 
                delay: index * 0.1,
                x: { duration: 2, ease: "easeInOut" },
                y: { duration: 2, ease: "easeInOut" }
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              onClick={() => setSelectedDriver(driver)}
            >
              <div className={`relative driver-marker ${driver.status} hover-scale`}>
                <motion.div
                  animate={{ 
                    scale: driver.status === 'active' ? [1, 1.2, 1] : 1 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: driver.status === 'active' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                    driver.status === 'active' 
                      ? 'bg-driver-active' 
                      : driver.status === 'busy'
                      ? 'bg-status-busy'
                      : 'bg-driver-inactive'
                  }`}
                />
                {/* Direction indicator */}
                <div className="absolute -top-1 -right-1">
                  <Navigation className="w-2 h-2 text-primary rotate-45" />
                </div>
              </div>
              {/* Driver label */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {driver.name}
                </Badge>
              </div>
            </motion.div>
          );
        })}

        {/* Delivery Points */}
        {[
          { x: 180, y: 95, status: 'completed' },
          { x: 320, y: 140, status: 'active' },
          { x: 480, y: 190, status: 'pending' },
          { x: 620, y: 130, status: 'pending' },
          { x: 750, y: 170, status: 'completed' },
          { x: 220, y: 250, status: 'active' },
          { x: 410, y: 290, status: 'pending' },
          { x: 680, y: 280, status: 'completed' }
        ].map((point, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}px`, top: `${point.y}px` }}
          >
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
              point.status === 'completed' ? 'bg-success' :
              point.status === 'active' ? 'bg-warning animate-pulse-soft' :
              'bg-muted-foreground'
            }`} />
          </div>
        ))}

        {/* Lane Indicators */}
        <div className="absolute bottom-4 left-4 space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-1 bg-route-primary rounded"></div>
            <span className="text-muted-foreground">Main Routes</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-1 bg-route-alternative rounded border-dashed border border-route-alternative"></div>
            <span className="text-muted-foreground">Alternative Routes</span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 shadow-smooth" onClick={onToggleExpand}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Live Driver Tracking</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {drivers.filter(d => d.status === 'active').length} active, {drivers.filter(d => d.status === 'busy').length} busy
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft mt-1"></div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <div className={`${isExpanded ? 'h-full' : 'h-64 lg:h-full'} transition-all duration-300`}>
          <MapComponent />
        </div>

        {/* Selected Driver Info */}
        {selectedDriver && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-4 left-4 max-w-xs"
          >
            <Card className="p-3 shadow-floating bg-card/95 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedDriver.name}</h4>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedDriver(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant={selectedDriver.status === 'active' ? 'default' : 'secondary'}
                      className={selectedDriver.status === 'active' ? 'status-online' : 'status-busy'}
                    >
                      {selectedDriver.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ETA:</span>
                    <span>{selectedDriver.eta}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{selectedDriver.currentLocation}</span>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    <Navigation className="w-3 h-3 mr-1" />
                    Route
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Driver List (when not expanded) */}
      {!isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <ScrollArea className="h-32">
            <div className="p-3 space-y-2">
              {drivers.slice(0, 4).map((driver) => (
                <motion.div
                  key={driver.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-card hover:shadow-smooth transition-all cursor-pointer"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      driver.status === 'active' ? 'bg-driver-active animate-pulse-soft' :
                      driver.status === 'busy' ? 'bg-status-busy' : 'bg-driver-inactive'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.currentLocation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{driver.eta}</p>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{driver.lastUpdate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};