'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          <div className="font-bold">
            {message.role === 'user' ? 'User: ' : 'AI: '}
          </div>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-invocation':
                return (
                  <div key={`${message.id}-${i}`} className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tool: {part.toolInvocation.toolName}
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(part.toolInvocation, null, 2)}
                    </pre>
                  </div>
                );
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 dark:border-gray-700 rounded shadow-xl dark:bg-gray-900"
          value={input}
          placeholder="Ask about the weather or anything else..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
