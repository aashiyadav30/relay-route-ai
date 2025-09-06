import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Map, Settings, Bug, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChatPanel } from './ChatPanel';
import { MapPanel } from './MapPanel';
import { DeveloperMode } from './DeveloperMode';
import { AgentReasoning } from './AgentReasoning';
import { useAgentCoordinator } from '../hooks/useAgentCoordinator';

export const CoordinatorInterface = () => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const { 
    messages, 
    drivers, 
    agentLogs, 
    isProcessing, 
    sendMessage, 
    processDriverDelay 
  } = useAgentCoordinator();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header 
        className="border-b border-border bg-card/50 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Grab Synapse AI</h1>
                <p className="text-sm text-muted-foreground">Last-Mile Coordinator</p>
              </div>
            </div>
            <Badge variant="secondary" className="status-online">
              {drivers.filter(d => d.status === 'active').length} Active Drivers
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4 text-muted-foreground" />
              <Switch 
                checked={isDeveloperMode} 
                onCheckedChange={setIsDeveloperMode}
                className="data-[state=checked]:bg-accent"
              />
              <span className="text-sm text-muted-foreground">Dev Mode</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="flex items-center space-x-2"
            >
              {isMapExpanded ? (
                <><Minimize2 className="w-4 h-4" /> <span>Contract Map</span></>
              ) : (
                <><Maximize2 className="w-4 h-4" /> <span>Expand Map</span></>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Interface */}
      <div className="container mx-auto h-[calc(100vh-80px)] p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          {/* Chat Panel */}
          <motion.div 
            className={`${isMapExpanded ? 'lg:col-span-4' : 'lg:col-span-6'} flex flex-col`}
            layout
            transition={{ duration: 0.3 }}
          >
            <Card className="flex-1 gradient-card shadow-elevated overflow-hidden">
              <ChatPanel 
                messages={messages}
                isProcessing={isProcessing}
                onSendMessage={sendMessage}
                onDriverDelayInquiry={processDriverDelay}
              />
            </Card>

            {/* Agent Reasoning Panel */}
            {showReasoning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card className="gradient-card shadow-elevated">
                  <AgentReasoning 
                    isProcessing={isProcessing}
                    lastAction={agentLogs[agentLogs.length - 1]}
                    onClose={() => setShowReasoning(false)}
                  />
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Map Panel */}
          <motion.div 
            className={`${isMapExpanded ? 'lg:col-span-8' : 'lg:col-span-6'} flex flex-col`}
            layout
            transition={{ duration: 0.3 }}
          >
            <Card className="flex-1 gradient-card shadow-elevated overflow-hidden">
              <MapPanel 
                drivers={drivers}
                isExpanded={isMapExpanded}
                onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
              />
            </Card>
          </motion.div>
        </div>

        {/* Developer Mode Panel */}
        <AnimatePresence>
          {isDeveloperMode && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-4 left-4 right-4 z-50"
            >
              <Card className="bg-card/95 backdrop-blur-sm shadow-floating max-h-80">
                <DeveloperMode 
                  logs={agentLogs}
                  drivers={drivers}
                  onClose={() => setIsDeveloperMode(false)}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};