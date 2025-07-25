'use client';

import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
import { AI } from '../ai';

interface WeatherResultProps {
  location: string;
  temperature: number;
}

export function WeatherResult({ location, temperature }: WeatherResultProps) {
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();

  const handleConvertTemperature = async () => {
    const message = await continueConversation(
      `请将 ${temperature} 华氏度转换为摄氏度，位置是 ${location}`
    );

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
    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg max-w-fit bg-white dark:bg-gray-800">
      <div className="mb-3">
        <h3 className="font-semibold text-lg">🌤️ 天气信息</h3>
        <p className="text-gray-600 dark:text-gray-300">
          {location} 的当前温度是 <span className="font-bold text-orange-600">{temperature}°F</span>
        </p>
      </div>
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleConvertTemperature}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          🌡️ 转换为摄氏度
        </button>
      </div>
      <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
        💡 点击按钮可以进行温度转换
      </div>
    </div>
  );
}
