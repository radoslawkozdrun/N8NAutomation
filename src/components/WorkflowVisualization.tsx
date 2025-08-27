import React, { useState, useEffect } from 'react';
import {
  Play,
  Database,
  Clock,
  Code,
  MessageSquare,
  FileText,
  Mail,
  Globe,
  Filter,
  GitBranch,
  Search,
  Bot,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Workflow,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: any;
  credentials?: any;
  notes?: string;
}

interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

interface WorkflowData {
  name: string;
  nodes: WorkflowNode[];
  connections: { [key: string]: WorkflowConnection[] };
}

// Icons mapping for different node types
const getNodeIcon = (nodeType: string) => {
  if (nodeType.includes('postgres')) return Database;
  if (nodeType.includes('scheduleTrigger')) return Clock;
  if (nodeType.includes('code')) return Code;
  if (nodeType.includes('webhook')) return Globe;
  if (nodeType.includes('gmail')) return Mail;
  if (nodeType.includes('httpRequest')) return Globe;
  if (nodeType.includes('rssFeedRead')) return FileText;
  if (nodeType.includes('filter')) return Filter;
  if (nodeType.includes('if')) return GitBranch;
  if (nodeType.includes('openAi') || nodeType.includes('gemini')) return Bot;
  if (nodeType.includes('langchain')) return MessageSquare;
  if (nodeType.includes('agent')) return Search;
  if (nodeType.includes('stickyNote')) return Info;
  return Settings;
};

// Get color for different node types
const getNodeColor = (nodeType: string) => {
  if (nodeType.includes('scheduleTrigger')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200';
  if (nodeType.includes('postgres')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200';
  if (nodeType.includes('code')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200';
  if (nodeType.includes('openAi') || nodeType.includes('gemini') || nodeType.includes('langchain')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200';
  if (nodeType.includes('gmail') || nodeType.includes('httpRequest')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200';
  if (nodeType.includes('if') || nodeType.includes('filter')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200';
  if (nodeType.includes('stickyNote')) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
  return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200';
};

// Workflow phases descriptions
const workflowPhases = [
  {
    id: 'rss-collection',
    name: 'Zbieranie Treści RSS',
    description: 'Automatyczne pobieranie artykułów z kanałów RSS',
    nodes: ['Uruchom zasilanie RSS', 'Pobierz linki RSS', 'Waliduj URL', 'Pobierz dane RSS', 'Waliduj pobrane artykuły', 'Zapisz artykuły RSS do bazy'],
    color: 'green'
  },
  {
    id: 'content-processing',
    name: 'Przetwarzanie Treści',
    description: 'Analiza i przetwarzanie pobranych artykułów przez AI',
    nodes: ['Uruchom przetwarzanie artykułów RSS', 'Pobierz artykuly RSS', 'Oblicz HASH dla treści', 'Sprawdź czy artykuł nie był procesowany', '(AI) Napisz podsumowanie artykułu', 'Oblicz final score', 'Zapisz przetworzony artykuł do bazy'],
    color: 'blue'
  },
  {
    id: 'review-notification',
    name: 'Review i Powiadomienia',
    description: 'Przegląd treści i powiadomienie o nowych artykułach',
    nodes: ['Uruchom fazę powiadomienia o nowych tematach', 'Pobierz artykuły do review', 'Przygotuj treść maila o nowych artykułach', 'Send a message'],
    color: 'orange'
  },
  {
    id: 'decision-handling',
    name: 'Obsługa Decyzji',
    description: 'Webhook do obsługi decyzji użytkownika o treściach',
    nodes: ['Informacja o decyzji na temat treści', 'Wyodrębnij status i id artykułu', 'Jeśli decyzja pozytywna', 'Zaktualizuj dane artykułu', 'Loguj akcje', 'Poinformuj o treści do wygenerowania'],
    color: 'purple'
  },
  {
    id: 'research-phase',
    name: 'Faza Research',
    description: 'Dogłębny research tematów zaakceptowanych przez użytkownika',
    nodes: ['Uruchom fazę research dla zaakceptowanych tematów', 'Pobierz artykuły do researchu', 'Zrób research na temat z artykułu', 'Generuj identyfikator wyszukiwania', 'Zapisz wyniki wyszukiwania na temat zagadnienia z artykułu', 'Zaktualizuj status w bazie artykułów', 'Wyślij powiadomienie o gotowym researchu'],
    color: 'indigo'
  },
  {
    id: 'content-generation',
    name: 'Generowanie Treści',
    description: 'Tworzenie finalnych postów na podstawie researchu',
    nodes: ['Uruchom pisanie treści posta', 'Pobierz artykuł', 'Pobierz materiały dodatkowe dla artykułu', 'Scal artykuł z materiałami badawczymi'],
    color: 'red'
  }
];

export function WorkflowVisualization() {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/n8n_workflow/!!! PROJEKT !!!.json');
      if (!response.ok) {
        throw new Error('Failed to load workflow data');
      }
      const data = await response.json();
      setWorkflowData(data);
    } catch (err) {
      console.error('Error loading workflow:', err);
      setError('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodesByPhase = (phaseId: string) => {
    if (!workflowData) return [];
    const phase = workflowPhases.find(p => p.id === phaseId);
    if (!phase) return [];

    return workflowData.nodes.filter(node => 
      phase.nodes.some(phaseName => 
        node.name.includes(phaseName) || phaseName.includes(node.name)
      )
    );
  };

  const renderNodeCard = (node: WorkflowNode, index: number) => {
    const Icon = getNodeIcon(node.type);
    const isExpanded = expandedNodes.has(node.id);
    const nodeColor = getNodeColor(node.type);

    return (
      <div
        key={node.id}
        className={cn(
          'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg',
          nodeColor
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {node.name}
              </h4>
              <p className="text-xs opacity-75 mt-1">
                {node.type.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => toggleNodeExpansion(node.id)}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-black/10">
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Type:</span> {node.type}
              </div>
              <div>
                <span className="font-medium">ID:</span> {node.id}
              </div>
              {node.parameters && Object.keys(node.parameters).length > 0 && (
                <div>
                  <span className="font-medium">Parameters:</span>
                  <pre className="mt-1 p-2 bg-black/10 rounded text-xs overflow-x-auto">
                    {JSON.stringify(node.parameters, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPhase = (phase: typeof workflowPhases[0]) => {
    const nodes = getNodesByPhase(phase.id);
    const phaseColors = {
      green: 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800',
      blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800',
      orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800',
      purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800',
      indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800',
      red: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
    };

    return (
      <div 
        key={phase.id}
        className={cn(
          'rounded-lg border p-6 mb-6',
          phaseColors[phase.color as keyof typeof phaseColors]
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {phase.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {phase.description}
            </p>
            <Badge variant="outline" className="mt-2">
              {nodes.length} nodes
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedPhase === phase.id ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPhase(null)}
              >
                Show All
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPhase(phase.id)}
              >
                Focus
              </Button>
            )}
          </div>
        </div>

        {(selectedPhase === null || selectedPhase === phase.id) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node, index) => renderNodeCard(node, index))}
          </div>
        )}

        {selectedPhase === phase.id && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <h4 className="font-medium mb-2">Phase Flow:</h4>
            <div className="flex flex-wrap items-center gap-2">
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {node.name}
                  </span>
                  {index < nodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center space-x-3">
          <Workflow className="w-8 h-8 animate-pulse text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading workflow...</span>
        </div>
      </div>
    );
  }

  if (error || !workflowData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to Load Workflow
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'Could not load the N8N workflow data'}
        </p>
        <Button onClick={loadWorkflowData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            N8N Workflow Visualization
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {workflowData.name} • {workflowData.nodes.length} nodes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </Button>
          
          <Button variant="outline" onClick={loadWorkflowData}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Workflow Overview
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This N8N workflow automates the entire process of RSS content collection, AI-powered analysis, 
          content research, and final content generation. It includes {workflowPhases.length} main phases 
          with comprehensive error handling and notification systems.
        </p>
      </div>

      {/* Phases */}
      <div className="flex-1 overflow-y-auto">
        {workflowPhases.map(renderPhase)}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{workflowData.nodes.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{workflowPhases.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Workflow Phases</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {workflowData.nodes.filter(n => n.type.includes('scheduleTrigger')).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Triggers</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {workflowData.nodes.filter(n => n.type.includes('langchain') || n.type.includes('openAi') || n.type.includes('gemini')).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">AI Nodes</div>
        </div>
      </div>
    </div>
  );
}