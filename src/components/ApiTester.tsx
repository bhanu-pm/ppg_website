import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Play, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { parseApiResponse } from '@/utils/apiParser';
import { toast } from '@/hooks/use-toast';

const ApiTester: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    try {
      console.log('Testing API...');
      const response = await apiService.getLatestMessages();
      console.log('Test response:', response);
      setTestResult({
        success: true,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="cyber-border bg-cyber-dark-alt/30">
      <CardHeader>
        <CardTitle className="text-cyber-green font-pixel">API TESTER</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testApi} 
          disabled={isLoading}
          className="bg-cyber-green hover:bg-cyber-green-dark text-cyber-dark font-pixel"
        >
          {isLoading ? 'TESTING...' : 'TEST API'}
        </Button>
        
        {testResult && (
          <div className="space-y-2">
            <div className="text-sm font-pixel text-cyber-green">
              {testResult.success ? 'SUCCESS' : 'ERROR'}
            </div>
            <pre className="text-xs font-mono text-cyber-green/70 bg-cyber-dark p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTester; 