'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
import { AI } from './ai';

export default function Chat() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // 添加用户消息到对话
    setConversation((currentConversation) => [
      ...currentConversation,
      {
        id: generateId(),
        role: 'user' as const,
        display: (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              👤 用户
            </div>
            <div className="text-gray-800 dark:text-gray-200">{userMessage}</div>
          </div>
        ),
      },
    ]);

    // 调用 AI 并添加响应
    try {
      const message = await continueConversation(userMessage);
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
    } catch (error) {
      console.error('Error:', error);
      setConversation((currentConversation) => [
        ...currentConversation,
        {
          id: generateId(),
          role: 'assistant' as const,
          display: (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              <div className="font-semibold text-red-800 dark:text-red-200 mb-1">
                ❌ 错误
              </div>
              <div className="text-red-700 dark:text-red-300">
                抱歉，处理您的请求时出现了错误。请稍后再试。
              </div>
            </div>
          ),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* 标题栏 */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          🤖 AI 智能助手
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          支持天气查询、温度转换等多步骤交互功能
        </p>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-lg mb-2">欢迎使用 AI 智能助手！</p>
            <p className="text-sm">
              试试问我："北京的天气如何，用摄氏度告诉我"
            </p>
          </div>
        )}

        {conversation.map((message) => (
          <div key={message.id}>
            {message.display}
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入您的问题..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
            disabled={false}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            发送
          </button>
        </form>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          💡 提示：可以询问天气、温度转换等问题
        </div>
      </div>
    </div>
  );
}
