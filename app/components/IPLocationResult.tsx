'use client';

import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
import { AI } from '../ai';

interface IPLocationResultProps {
  ip: string;
  location: string;
}

export function IPLocationResult({ ip, location }: IPLocationResultProps) {
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();

  const handleQueryWeather = async () => {
    const message = await continueConversation(`查询 ${location} 的天气情况`);
    
    setConversation((currentConversation) => [
      ...currentConversation,
      {
        ...message,
        display: (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🤖 AI 助手
            </div>
            <div>{message.display}</div>
          </div>
        ),
      },
    ]);
  };

  return (
    <div className="border border-purple-200 dark:border-purple-700 p-4 rounded-lg max-w-fit bg-purple-50 dark:bg-purple-900/20">
      <div className="mb-3">
        <h3 className="font-semibold text-lg">🌍 IP 地理位置查询结果</h3>
        <p className="text-gray-600 dark:text-gray-300">
          IP 地址 <span className="font-bold text-purple-600">{ip}</span> 的地理位置：
        </p>
        <div className="mt-2">
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">📍 {location}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleQueryWeather}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          🌤️ 查询天气
        </button>
      </div>
      
      <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">
        💡 点击按钮查询该地区的天气信息
      </div>
    </div>
  );
}
