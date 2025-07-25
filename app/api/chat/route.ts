import { deepseek } from "@ai-sdk/deepseek";
import { createDataStreamResponse, streamText, tool, formatDataStreamPart, Message } from 'ai';
import { z } from 'zod';

// 确认状态常量 - 参考官方文档
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const;

// 模拟 IP 转地理位置 API
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

// 模拟天气 API
const getWeather = async (location: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return Math.round(Math.random() * (90 - 32) + 32);
};

// 温度转换函数
const convertFahrenheitToCelsius = async (temperature: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return Math.round((temperature - 32) * (5 / 9));
};

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // 处理工具确认逻辑
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.parts) {
        lastMessage.parts = await Promise.all(
          lastMessage.parts.map(async part => {
            if (part.type !== 'tool-invocation') {
              return part;
            }

            const toolInvocation = part.toolInvocation;
            
            // 只处理结果状态的工具调用
            if (toolInvocation.state !== 'result') {
              return part;
            }

            let result;

            // 处理 IP 转地理位置工具
            if (toolInvocation.toolName === 'ipToLocation') {
              if (toolInvocation.result === APPROVAL.YES) {
                result = await ipToLocation(toolInvocation.args.ip);
                result = `IP 地址 ${toolInvocation.args.ip} 的地理位置是：${result}`;
              } else if (toolInvocation.result === APPROVAL.NO) {
                result = '用户取消了 IP 地理位置查询';
              } else {
                return part;
              }
            }
            
            // 处理天气查询工具
            else if (toolInvocation.toolName === 'weather') {
              if (toolInvocation.result === APPROVAL.YES) {
                const temperature = await getWeather(toolInvocation.args.location);
                result = `${toolInvocation.args.location} 的当前温度是 ${temperature}°F`;
              } else if (toolInvocation.result === APPROVAL.NO) {
                result = '用户取消了天气查询';
              } else {
                return part;
              }
            }
            
            // 处理温度转换工具
            else if (toolInvocation.toolName === 'convertFahrenheitToCelsius') {
              if (toolInvocation.result === APPROVAL.YES) {
                const celsius = await convertFahrenheitToCelsius(toolInvocation.args.temperature);
                result = `${toolInvocation.args.temperature}°F 转换为摄氏度是 ${celsius}°C`;
              } else if (toolInvocation.result === APPROVAL.NO) {
                result = '用户取消了温度转换';
              } else {
                return part;
              }
            }
            
            else {
              return part;
            }

            // 发送更新的工具结果到客户端
            dataStream.write(
              formatDataStreamPart('tool_result', {
                toolCallId: toolInvocation.toolCallId,
                result,
              }),
            );

            // 返回更新的工具调用
            return {
              ...part,
              toolInvocation: {
                ...toolInvocation,
                result,
              },
            };
          })
        );
      }

      const result = streamText({
        model: deepseek("deepseek-chat"),
        messages,
        tools: {
          ipToLocation: tool({
            description: "Convert an IP address to its geographical location. Use this when user asks about IP location or weather for an IP address.",
            parameters: z.object({
              ip: z.string().describe("The IP address to lookup (e.g., 192.168.1.1, 8.8.8.8)"),
            }),
            // 注意：没有 execute 函数，让前端处理确认
          }),
          
          weather: tool({
            description: "Get weather information for a specific location. Use this when user asks about weather conditions.",
            parameters: z.object({
              location: z.string().describe("The location to get weather for (e.g., Beijing, New York, London)"),
            }),
            // 注意：没有 execute 函数，让前端处理确认
          }),
          
          convertFahrenheitToCelsius: tool({
            description: "Convert temperature from Fahrenheit to Celsius. Use this when user wants temperature in Celsius or mentions 摄氏度.",
            parameters: z.object({
              temperature: z.number().describe("Temperature in Fahrenheit to convert"),
              location: z.string().optional().describe("Location context for the temperature"),
            }),
            // 注意：没有 execute 函数，让前端处理确认
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
