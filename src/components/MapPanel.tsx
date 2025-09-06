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

  // Define detailed route paths for realistic navigation-like movement
  const routes = [
    // Main highway route with realistic waypoints
    [{x: 20, y: 80}, {x: 45, y: 75}, {x: 75, y: 70}, {x: 120, y: 60}, {x: 160, y: 65}, {x: 200, y: 80}, {x: 220, y: 90}, {x: 260, y: 105}, {x: 300, y: 115}, {x: 320, y: 120}, {x: 360, y: 110}, {x: 400, y: 105}, {x: 420, y: 100}, {x: 460, y: 90}, {x: 500, y: 85}, {x: 520, y: 80}, {x: 560, y: 90}, {x: 600, y: 105}, {x: 620, y: 110}, {x: 660, y: 125}, {x: 700, y: 135}, {x: 720, y: 140}, {x: 760, y: 130}, {x: 800, y: 120}],
    
    // Urban street route with turns
    [{x: 30, y: 180}, {x: 70, y: 190}, {x: 110, y: 195}, {x: 130, y: 200}, {x: 170, y: 190}, {x: 210, y: 180}, {x: 230, y: 170}, {x: 270, y: 155}, {x: 310, y: 145}, {x: 330, y: 140}, {x: 370, y: 150}, {x: 410, y: 155}, {x: 430, y: 160}, {x: 470, y: 170}, {x: 510, y: 175}, {x: 530, y: 180}, {x: 570, y: 170}, {x: 610, y: 160}, {x: 630, y: 150}, {x: 670, y: 140}, {x: 710, y: 130}, {x: 730, y: 120}, {x: 780, y: 130}, {x: 820, y: 140}],
    
    // Arterial road with traffic signals
    [{x: 80, y: 300}, {x: 120, y: 290}, {x: 160, y: 285}, {x: 180, y: 280}, {x: 220, y: 290}, {x: 260, y: 295}, {x: 280, y: 300}, {x: 320, y: 310}, {x: 360, y: 315}, {x: 380, y: 320}, {x: 420, y: 310}, {x: 460, y: 305}, {x: 480, y: 300}, {x: 520, y: 290}, {x: 560, y: 285}, {x: 580, y: 280}, {x: 620, y: 290}, {x: 660, y: 295}, {x: 680, y: 300}, {x: 720, y: 310}, {x: 760, y: 315}, {x: 780, y: 320}, {x: 820, y: 310}, {x: 850, y: 300}],
    
    // Cross-town express route  
    [{x: 20, y: 80}, {x: 50, y: 85}, {x: 80, y: 88}, {x: 90, y: 95}, {x: 120, y: 92}, {x: 150, y: 88}, {x: 160, y: 85}, {x: 190, y: 90}, {x: 220, y: 95}, {x: 230, y: 100}, {x: 260, y: 95}, {x: 290, y: 92}, {x: 300, y: 90}, {x: 330, y: 95}, {x: 360, y: 100}, {x: 370, y: 105}, {x: 400, y: 100}, {x: 430, y: 98}, {x: 440, y: 95}, {x: 470, y: 100}, {x: 500, y: 105}, {x: 510, y: 110}, {x: 540, y: 105}, {x: 570, y: 102}, {x: 580, y: 100}, {x: 610, y: 108}, {x: 640, y: 112}, {x: 650, y: 115}, {x: 680, y: 110}, {x: 710, y: 107}, {x: 720, y: 105}, {x: 760, y: 115}, {x: 800, y: 120}],
    
    // Suburban collector road
    [{x: 50, y: 250}, {x: 90, y: 245}, {x: 120, y: 242}, {x: 140, y: 240}, {x: 180, y: 248}, {x: 210, y: 252}, {x: 220, y: 255}, {x: 260, y: 250}, {x: 290, y: 247}, {x: 310, y: 245}, {x: 350, y: 252}, {x: 380, y: 258}, {x: 400, y: 260}, {x: 440, y: 255}, {x: 470, y: 252}, {x: 490, y: 250}, {x: 530, y: 258}, {x: 560, y: 262}, {x: 580, y: 265}, {x: 620, y: 260}, {x: 650, y: 257}, {x: 670, y: 255}, {x: 710, y: 265}, {x: 740, y: 268}, {x: 750, y: 270}, {x: 790, y: 265}, {x: 830, y: 260}]
  ];

  const [driverRoutes, setDriverRoutes] = useState<{[key: string]: {routeIndex: number, progress: number, direction: number, speed: number, heading: number}}>({});

  // Initialize driver positions and routes
  useEffect(() => {
    const positions: {[key: string]: {x: number, y: number}} = {};
    const routeAssignments: {[key: string]: {routeIndex: number, progress: number, direction: number, speed: number, heading: number}} = {};
    
    drivers.forEach((driver, index) => {
      const routeIndex = index % routes.length;
      const route = routes[routeIndex];
      const progress = Math.random(); // Random starting position along route
      const direction = Math.random() > 0.5 ? 1 : -1; // Random direction
      const baseSpeed = driver.status === 'active' ? 0.018 : driver.status === 'busy' ? 0.012 : 0.005; // Variable speeds
      const speed = baseSpeed + (Math.random() - 0.5) * 0.008; // Add some variation
      
      // Calculate position based on progress along route
      const segmentIndex = Math.floor(progress * (route.length - 1));
      const segmentProgress = (progress * (route.length - 1)) % 1;
      const startPoint = route[segmentIndex];
      const endPoint = route[Math.min(segmentIndex + 1, route.length - 1)];
      
      // Calculate heading (direction of movement)
      const heading = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI);
      
      positions[driver.id] = {
        x: startPoint.x + (endPoint.x - startPoint.x) * segmentProgress,
        y: startPoint.y + (endPoint.y - startPoint.y) * segmentProgress
      };
      
      routeAssignments[driver.id] = {
        routeIndex,
        progress,
        direction,
        speed,
        heading
      };
    });
    
    setDriverPositions(positions);
    setDriverRoutes(routeAssignments);
  }, [drivers]);

  // Animate realistic navigation-style driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPositions(prev => {
        const updated = { ...prev };
        
        setDriverRoutes(prevRoutes => {
          const updatedRoutes = { ...prevRoutes };
          
          Object.keys(updated).forEach(driverId => {
            const driver = drivers.find(d => d.id === driverId);
            const routeInfo = updatedRoutes[driverId];
            
            if ((driver?.status === 'active' || driver?.status === 'busy') && routeInfo) {
              const route = routes[routeInfo.routeIndex];
              
              // Dynamic speed based on traffic and road conditions
              let currentSpeed = routeInfo.speed;
              
              // Simulate traffic conditions (random slowdowns)
              if (Math.random() < 0.1) { // 10% chance of traffic
                currentSpeed *= 0.3; // Slow down for traffic
              } else if (Math.random() < 0.05) { // 5% chance of highway speeds
                currentSpeed *= 1.8; // Speed up on highways
              }
              
              // Apply acceleration/deceleration near intersections
              const currentSegment = Math.floor(routeInfo.progress * (route.length - 1));
              const nextSegment = currentSegment + 1;
              
              if (nextSegment < route.length) {
                const distanceToNextPoint = 1 - ((routeInfo.progress * (route.length - 1)) % 1);
                if (distanceToNextPoint < 0.1) { // Near intersection
                  currentSpeed *= 0.6; // Slow down for turns
                }
              }
              
              // Update progress with realistic movement
              let newProgress = routeInfo.progress + (currentSpeed * routeInfo.direction);
              let newDirection = routeInfo.direction;
              let newHeading = routeInfo.heading;
              
              // Handle route boundaries with realistic behavior
              if (newProgress >= 1) {
                newProgress = 0.98; // Don't quite reach the end
                newDirection = -1; // Turn around
              } else if (newProgress <= 0) {
                newProgress = 0.02; // Don't quite reach the start
                newDirection = 1; // Turn around
              }
              
              // Calculate new position with smooth interpolation
              const segmentIndex = Math.floor(newProgress * (route.length - 1));
              const segmentProgress = (newProgress * (route.length - 1)) % 1;
              const startPoint = route[segmentIndex];
              const endPoint = route[Math.min(segmentIndex + 1, route.length - 1)];
              
              // Update heading based on actual direction of travel
              if (segmentIndex + 1 < route.length) {
                newHeading = Math.atan2(
                  endPoint.y - startPoint.y, 
                  endPoint.x - startPoint.x
                ) * (180 / Math.PI);
                if (newDirection === -1) {
                  newHeading += 180; // Reverse direction
                }
              }
              
              // Smooth position interpolation with slight realistic wobble
              const wobbleX = (Math.random() - 0.5) * 1.5; // Slight lane changes
              const wobbleY = (Math.random() - 0.5) * 1.5;
              
              updated[driverId] = {
                x: startPoint.x + (endPoint.x - startPoint.x) * segmentProgress + wobbleX,
                y: startPoint.y + (endPoint.y - startPoint.y) * segmentProgress + wobbleY
              };
              
              // Update route info
              updatedRoutes[driverId] = {
                ...routeInfo,
                progress: newProgress,
                direction: newDirection,
                heading: newHeading,
                speed: currentSpeed
              };
            }
          });
          
          return updatedRoutes;
        });
        
        return updated;
      });
    }, 1500); // Update every 1.5 seconds for smoother navigation feel

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
                {/* Realistic direction indicator based on heading */}
                <div 
                  className="absolute -top-1 -right-1"
                  style={{ 
                    transform: `rotate(${(driverRoutes[driver.id]?.heading || 0) + 45}deg)` 
                  }}
                >
                  <Navigation className="w-2 h-2 text-primary transition-transform duration-1000" />
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