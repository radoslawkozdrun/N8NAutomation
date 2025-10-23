import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ScoreDistributionChartProps {
  data?: ChartData[];
  type?: 'bar' | 'pie';
  title?: string;
  className?: string;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ 
  data = [], 
  type = 'bar',
  title = 'AI Score Distribution',
  className = '' 
}) => {
  const colors = [
    'hsl(var(--color-primary))',
    'hsl(var(--color-accent))', 
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-error))',
    'hsl(var(--color-secondary))'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="text-sm font-medium text-popover-foreground">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--color-muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--color-muted-foreground))"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--color-primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">
          {title}
        </h3>
      </div>
      <div className="p-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <p>No data to display</p>
            </div>
          </div>
        ) : (
          <>
            {type === 'bar' ? renderBarChart() : renderPieChart()}
            {type === 'pie' && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {data.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreDistributionChart;