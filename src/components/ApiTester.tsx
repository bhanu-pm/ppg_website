import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Play, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { parseApiResponse } from '@/utils/apiParser';
import { toast } from '@/hooks/use-toast';

const ApiTester: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    data?: any;
  }[]>([]);

  const testCases = [
    {
      name: "No New Messages",
      description: "Test string response",
      data: { statusCode: 200, body: "No new comments!" }
    },
    {
      name: "Single Message",
      description: "Test single object response",
      data: { statusCode: 200, body: { code: "BOBA25", location: "Phoenix", price: "15" } }
    },
    {
      name: "Multiple Messages",
      description: "Test array response",
      data: { 
        statusCode: 200, 
        body: [
          { code: "BOBA25", location: "Phoenix", price: "15" },
          { code: "MABOST20", location: "Boston", price: "15" }
        ]
      }
    },
    {
      name: "Mixed Quotes - Single",
      description: "Test single quotes in object",
      data: { statusCode: 200, body: { code: 'BOBA25', location: 'Phoenix', price: '15' } }
    },
    {
      name: "Mixed Quotes - Array",
      description: "Test mixed quotes in array",
      data: { 
        statusCode: 200, 
        body: [
          { code: 'BOBA25', location: "Phoenix", price: '15' },
          { code: "MABOST20", location: 'Boston', price: "15" }
        ]
      }
    },
    {
      name: "String with Mixed Quotes",
      description: "Test JSON string with mixed quotes",
      data: { 
        statusCode: 200, 
        body: '[{"code": "BOBA25", "location": \'Phoenix\', "price": "15"}]'
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setIsTesting(true);
    
    try {
      // Simulate API call
      const response = testCase.data;
      const parsed = parseApiResponse(response);
      
      const result = {
        success: parsed.hasNewMessages || parsed.message.includes('No new'),
        message: parsed.message,
        data: parsed.messages
      };
      
      setTestResults(prev => [...prev, result]);
      
      toast({
        title: `Test: ${testCase.name}`,
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
    } catch (error) {
      const result = {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      };
      
      setTestResults(prev => [...prev, result]);
      
      toast({
        title: `Test Failed: ${testCase.name}`,
        description: result.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTest(testCase);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="cyber-border bg-cyber-dark-alt/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-green font-pixel">
          <TestTube className="w-5 h-5" />
          API TESTER
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isTesting}
            className="bg-cyber-green hover:bg-cyber-green-dark text-cyber-dark font-pixel text-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isTesting ? 'TESTING...' : 'RUN ALL TESTS'}
          </Button>
          <Button
            onClick={clearResults}
            variant="outline"
            className="border-cyber-green/30 text-cyber-green font-pixel text-sm"
          >
            CLEAR
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testCases.map((testCase, index) => (
            <Card key={index} className="bg-cyber-dark border-cyber-green/20">
              <CardContent className="p-3">
                <div className="text-sm font-pixel text-cyber-green mb-1">
                  {testCase.name}
                </div>
                <div className="text-xs text-cyber-green/70 mb-2">
                  {testCase.description}
                </div>
                <Button
                  onClick={() => runTest(testCase)}
                  disabled={isTesting}
                  size="sm"
                  className="w-full bg-cyber-blue hover:bg-cyber-blue-dark text-white font-pixel text-xs"
                >
                  TEST
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-pixel text-cyber-green">TEST RESULTS:</div>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-cyber-dark rounded border border-cyber-green/20">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs font-mono text-cyber-green/80">
                  {result.message}
                </span>
                {result.data && result.data.length > 0 && (
                  <Badge className="text-xs bg-cyber-green/20 text-cyber-green">
                    {result.data.length} msg(s)
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTester; 