'use client';

import { useState } from 'react';

interface ToolConfirmationProps {
  toolName: string;
  description: string;
  parameters: Record<string, any>;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ToolConfirmation({ 
  toolName, 
  description, 
  parameters, 
  onConfirm, 
  onCancel 
}: ToolConfirmationProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleConfirm = async () => {
    setIsExecuting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Tool execution error:', error);
      setIsExecuting(false);
    }
  };

  if (isExecuting) {
    return (
      <div className="border border-blue-200 dark:border-blue-700 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 dark:text-blue-300">
            正在执行工具：{description}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-orange-200 dark:border-orange-700 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
      <div className="mb-3">
        <h3 className="font-semibold text-lg flex items-center">
          🔧 准备调用工具：{description}
        </h3>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="font-medium mb-1">工具名称：</div>
          <div className="ml-2 font-mono text-purple-600 dark:text-purple-400">{toolName}</div>
          
          <div className="font-medium mb-1 mt-2">参数：</div>
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} className="ml-2">
              <span className="font-medium">{key}:</span>{' '}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {typeof value === 'string' ? `"${value}"` : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleConfirm}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center space-x-1"
        >
          <span>✅</span>
          <span>确认执行</span>
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center space-x-1"
        >
          <span>❌</span>
          <span>取消</span>
        </button>
      </div>
      
      <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
        💡 请确认是否要执行此工具调用
      </div>
    </div>
  );
}
