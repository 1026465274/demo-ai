'use client';

import { useChat, Message } from 'ai/react';

// 确认状态常量 - 与后端保持一致
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const;

// 需要确认的工具列表
const toolsRequiringConfirmation = ['ipToLocation', 'weather', 'convertFahrenheitToCelsius'];

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    maxSteps: 5,
  });

  // 检查是否有待确认的工具调用
  const pendingToolCallConfirmation = messages.some((m: Message) =>
    m.parts?.some(
      part =>
        part.type === 'tool-invocation' &&
        part.toolInvocation.state === 'call' &&
        toolsRequiringConfirmation.includes(part.toolInvocation.toolName),
    ),
  );

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch">
      <div className="space-y-4 mb-4">
        {messages?.map((m: Message) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div className={`p-3 rounded-lg mb-4 ${
              m.role === 'user' 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className={`font-semibold mb-2 ${
                m.role === 'user'
                  ? 'text-blue-800 dark:text-blue-200'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {m.role === 'user' ? '👤 用户' : '🤖 AI 助手'}
              </div>
              
              {m.parts?.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={i} className={
                        m.role === 'user'
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }>
                        {part.text}
                      </div>
                    );
                    
                  case 'tool-invocation':
                    const toolInvocation = part.toolInvocation;
                    const toolCallId = toolInvocation.toolCallId;

                    // 渲染工具确认界面
                    if (
                      toolsRequiringConfirmation.includes(toolInvocation.toolName) &&
                      toolInvocation.state === 'call'
                    ) {
                      return (
                        <div key={toolCallId} className="border border-orange-200 dark:border-orange-700 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg flex items-center">
                              🔧 准备调用工具：{getToolDescription(toolInvocation.toolName)}
                            </h3>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="font-medium mb-1">工具名称：</div>
                              <div className="ml-2 font-mono text-purple-600 dark:text-purple-400">
                                {toolInvocation.toolName}
                              </div>
                              
                              <div className="font-medium mb-1 mt-2">参数：</div>
                              {Object.entries(toolInvocation.args).map(([key, value]) => (
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
                              onClick={() => addToolResult({
                                toolCallId,
                                result: APPROVAL.YES,
                              })}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center space-x-1"
                            >
                              <span>✅</span>
                              <span>确认执行</span>
                            </button>
                            <button
                              onClick={() => addToolResult({
                                toolCallId,
                                result: APPROVAL.NO,
                              })}
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

                    // 显示工具执行结果
                    if (toolInvocation.state === 'result') {
                      return (
                        <div key={toolCallId} className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="text-sm text-green-700 dark:text-green-300">
                            <strong>🔧 {getToolDescription(toolInvocation.toolName)} 结果：</strong>
                          </div>
                          <div className="mt-1 text-green-800 dark:text-green-200">
                            {toolInvocation.result}
                          </div>
                        </div>
                      );
                    }

                    return null;
                    
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-2xl p-4 bg-white dark:bg-gray-900 border-t">
        <div className="flex space-x-2">
          <input
            disabled={pendingToolCallConfirmation}
            value={input}
            onChange={handleInputChange}
            placeholder={pendingToolCallConfirmation ? "请先确认工具调用..." : "输入消息..."}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pendingToolCallConfirmation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}

// 工具描述映射
function getToolDescription(toolName: string): string {
  const descriptions = {
    ipToLocation: 'IP地址转地理位置',
    weather: '获取天气信息',
    convertFahrenheitToCelsius: '温度转换',
  };
  return descriptions[toolName as keyof typeof descriptions] || toolName;
}
