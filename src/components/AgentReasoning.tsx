import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, X, Lightbulb, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AgentLog } from '../types/coordinator';

interface AgentReasoningProps {
  isProcessing: boolean;
  lastAction?: AgentLog;
  onClose: () => void;
}

export const AgentReasoning = ({ isProcessing, lastAction, onClose }: AgentReasoningProps) => {
  const reasoningSteps = [
    { 
      step: "Analyze Customer Input", 
      status: "completed", 
      description: "Parse message for delivery issue indicators" 
    },
    { 
      step: "Identify Issue Type", 
      status: isProcessing ? "active" : "completed", 
      description: "Classify as driver delay inquiry" 
    },
    { 
      step: "Execute Response Protocol", 
      status: isProcessing ? "pending" : "completed", 
      description: "Trigger multi-step coordination workflow" 
    },
    { 
      step: "Monitor Resolution", 
      status: "pending", 
      description: "Track driver response and customer satisfaction" 
    }
  ];

  // Dynamic confidence that changes over time
  const [confidence, setConfidence] = useState(92);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isProcessing) {
        // During processing, confidence fluctuates more
        setConfidence(prev => {
          const variation = (Math.random() - 0.5) * 8; // ±4%
          const newValue = 85 + variation;
          return Math.max(75, Math.min(95, newValue));
        });
      } else {
        // When idle, more stable but still some variation
        setConfidence(prev => {
          const variation = (Math.random() - 0.5) * 4; // ±2%
          const newValue = 92 + variation;
          return Math.max(88, Math.min(96, newValue));
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Agent Reasoning</h3>
          <Badge variant="outline" className="text-xs">
            Confidence: {confidence}%
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Action */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Current Action</span>
          </div>
          <p className="text-sm">{lastAction.action}</p>
          <p className="text-xs text-muted-foreground mt-1">{lastAction.description}</p>
        </motion.div>
      )}

      {/* Reasoning Process */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Decision Process</span>
        </div>

        {reasoningSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              step.status === 'completed' ? 'bg-success' :
              step.status === 'active' ? 'bg-warning animate-pulse-soft' :
              'bg-muted-foreground'
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{step.step}</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    step.status === 'completed' ? 'text-success border-success' :
                    step.status === 'active' ? 'text-warning border-warning' :
                    'text-muted-foreground'
                  }`}
                >
                  {step.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confidence Meter */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Decision Confidence</span>
          </div>
          <span className="text-sm font-medium">{confidence}%</span>
        </div>
        <Progress 
          value={confidence} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {confidence >= 90 ? 'High confidence - proceeding autonomously' :
           confidence >= 70 ? 'Medium confidence - monitoring closely' :
           'Low confidence - may escalate to human operator'}
        </p>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-2 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
            <span className="text-xs text-primary">Processing coordination workflow...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};