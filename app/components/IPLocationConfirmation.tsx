'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
import { AI } from '../ai';
import { ToolConfirmation } from './ToolConfirmation';
import { IPLocationResult } from './IPLocationResult';

interface IPLocationConfirmationProps {
  ip: string;
}

export function IPLocationConfirmation({ ip }: IPLocationConfirmationProps) {
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();
  const [isExecuting, setIsExecuting] = useState(false);

  // 模拟 IP 转地理位置 API（复制自 actions.tsx）
  const ipToLocation = async (ip: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "西安", "武汉"];
    const publicIPs = ["8.8.8.8", "1.1.1.1", "208.67.222.222"];
    const internationalCities = ["纽约", "伦敦", "东京", "悉尼", "巴黎", "柏林"];
    
    if (publicIPs.includes(ip)) {
      return internationalCities[Math.floor(Math.random() * internationalCities.length)];
    }
    
    return cities[Math.floor(Math.random() * cities.length)];
  };

  const handleConfirm = async () => {
    setIsExecuting(true);
    
    try {
      // 执行 IP 转地理位置
      const location = await ipToLocation(ip);
      
      // 替换当前确认组件为结果组件
      setConversation((currentConversation) => {
        const newConversation = [...currentConversation];
        const lastIndex = newConversation.length - 1;
        
        if (lastIndex >= 0) {
          newConversation[lastIndex] = {
            ...newConversation[lastIndex],
            display: (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🤖 AI 助手
                </div>
                <IPLocationResult ip={ip} location={location} />
              </div>
            ),
          };
        }
        
        return newConversation;
      });
    } catch (error) {
      console.error('IP location lookup failed:', error);
      setConversation((currentConversation) => {
        const newConversation = [...currentConversation];
        const lastIndex = newConversation.length - 1;
        
        if (lastIndex >= 0) {
          newConversation[lastIndex] = {
            ...newConversation[lastIndex],
            display: (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🤖 AI 助手
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-red-700 dark:text-red-300">
                    IP 地理位置查询失败，请稍后重试。
                  </div>
                </div>
              </div>
            ),
          };
        }
        
        return newConversation;
      });
    }
  };

  const handleCancel = () => {
    // 替换当前确认组件为取消消息
    setConversation((currentConversation) => {
      const newConversation = [...currentConversation];
      const lastIndex = newConversation.length - 1;
      
      if (lastIndex >= 0) {
        newConversation[lastIndex] = {
          ...newConversation[lastIndex],
          display: (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                🤖 AI 助手
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-600 dark:text-gray-300">
                  ❌ 已取消 IP 地理位置查询。有什么其他我可以帮助您的吗？
                </div>
              </div>
            </div>
          ),
        };
      }
      
      return newConversation;
    });
  };

  return (
    <ToolConfirmation
      toolName="ipToLocation"
      description="IP地址转地理位置"
      parameters={{ ip }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
