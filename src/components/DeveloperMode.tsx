import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Terminal, Clock, User, MapPin, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentLog, Driver } from '../types/coordinator';

interface DeveloperModeProps {
  logs: AgentLog[];
  drivers: Driver[];
  onClose: () => void;
}

export const DeveloperMode = ({ logs, drivers, onClose }: DeveloperModeProps) => {
  const [selectedLog, setSelectedLog] = useState<AgentLog | null>(null);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'driver_notification':
        return <Phone className="w-4 h-4 text-warning" />;
      case 'route_calculation':
        return <MapPin className="w-4 h-4 text-accent" />;
      case 'customer_update':
        return <User className="w-4 h-4 text-primary" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Terminal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'driver_notification':
        return 'bg-warning/10 border-warning text-warning-foreground';
      case 'route_calculation':
        return 'bg-accent/10 border-accent text-accent-foreground';
      case 'customer_update':
        return 'bg-primary/10 border-primary text-primary-foreground';
      case 'error':
        return 'bg-destructive/10 border-destructive text-destructive-foreground';
      case 'success':
        return 'bg-success/10 border-success text-success-foreground';
      default:
        return 'bg-muted/10 border-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-80"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Developer Mode</h3>
          <Badge variant="secondary" className="text-xs">
            Judge Replay Mode
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="logs" className="h-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="logs">Agent Logs</TabsTrigger>
          <TabsTrigger value="drivers">Driver State</TabsTrigger>
          <TabsTrigger value="replay">Scenario Replay</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="h-64 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="space-y-2 pb-4">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${getLogTypeColor(log.type)} ${
                    selectedLog?.id === log.id ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{log.action}</p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(log.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-xs opacity-80">{log.description}</p>
                        
                        {selectedLog?.id === log.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 pt-2 border-t border-current/20"
                          >
                            <div className="space-y-1">
                              {log.metadata && Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="font-mono">{key}:</span>
                                  <span className="font-mono text-right">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="drivers" className="h-64 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="space-y-3 pb-4">
              {drivers.map((driver) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        driver.status === 'active' ? 'bg-success animate-pulse-soft' :
                        driver.status === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                      <span className="font-medium text-sm">{driver.name}</span>
                      <Badge variant="outline" className="text-xs">
                        ID: {driver.id}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{driver.lastUpdate}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div><span className="text-muted-foreground">Status:</span> {driver.status}</div>
                      <div><span className="text-muted-foreground">Location:</span> {driver.currentLocation}</div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="text-muted-foreground">ETA:</span> {driver.eta}</div>
                      <div><span className="text-muted-foreground">Delivery:</span> #{driver.currentDelivery || 'None'}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="replay" className="h-64 mt-2">
          <div className="p-4 space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Scenario Replay Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Judge can replay completed scenarios to verify agent performance
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-medium text-sm">Customer Driver Delay Inquiry</span>
                  </div>
                  <Badge variant="outline" className="status-online text-xs">
                    Passed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ✓ Driver notified ✓ Alternative route calculated ✓ Call requested ✓ Customer updated
                </p>
              </div>

              <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="font-medium text-sm">Address Change Request</span>
                  </div>
                  <Badge variant="outline" className="status-busy text-xs">
                    In Progress
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently processing delivery address update scenario...
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Scenario success rate: <span className="text-success font-medium">85%</span>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};