"use server";

import { streamUI, getMutableAIState } from "ai/rsc";
import { deepseek } from "@ai-sdk/deepseek";
import { ReactNode } from "react";
import { generateId } from "ai";
import { z } from "zod";
import { WeatherResult } from "./components/WeatherResult";
import { IPLocationConfirmation } from "./components/IPLocationConfirmation";
import { WeatherConfirmation } from "./components/WeatherConfirmation";
import { TemperatureConfirmation } from "./components/TemperatureConfirmation";



// 定义消息类型
export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

// 加载组件
const LoadingComponent = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    <span className="text-blue-700 dark:text-blue-300">{message}</span>
  </div>
);







// 温度转换结果组件
const TemperatureResultComponent = ({
  originalTemp,
  convertedTemp,
  location,
}: {
  originalTemp: number;
  convertedTemp: number;
  location: string;
}) => (
  <div className="border border-green-200 dark:border-green-700 p-4 rounded-lg max-w-fit bg-green-50 dark:bg-green-900/20">
    <div className="mb-3">
      <h3 className="font-semibold text-lg">✅ 温度转换完成</h3>
      <p className="text-gray-600 dark:text-gray-300">{location} 的温度：</p>
      <div className="mt-2 space-y-1">
        <p>
          华氏度:{" "}
          <span className="font-bold text-orange-600">{originalTemp}°F</span>
        </p>
        <p>
          摄氏度:{" "}
          <span className="font-bold text-green-600">{convertedTemp}°C</span>
        </p>
      </div>
    </div>
    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
      🎉 任务完成！
    </div>
  </div>
);

// 模拟 IP 转地理位置 API
const ipToLocation = async (ip: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 模拟不同IP返回不同城市
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



// 主要的对话处理函数
// AI 驱动的对话处理函数
export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: deepseek("deepseek-chat"),
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "user", content: input },
          { role: "assistant", content },
        ]);
      }
      return <div className="text-gray-800 dark:text-gray-200">{content}</div>;
    },
    tools: {
      ipToLocation: {
        description: "Convert an IP address to its geographical location. Use this when user asks about IP location or weather for an IP address.",
        parameters: z.object({
          ip: z.string().describe("The IP address to lookup (e.g., 192.168.1.1, 8.8.8.8)"),
        }),
        generate: async function* ({ ip }) {
          // 返回确认组件，让用户决定是否执行
          return <IPLocationConfirmation ip={ip} />;
        },
      },
      weather: {
        description: "Get weather information for a specific location. Use this when user asks about weather conditions.",
        parameters: z.object({
          location: z.string().describe("The location to get weather for (e.g., Beijing, New York, London)"),
        }),
        generate: async function* ({ location }) {
          // 返回确认组件，让用户决定是否执行
          return <WeatherConfirmation location={location} />;
        },
      },
      convertFahrenheitToCelsius: {
        description: "Convert temperature from Fahrenheit to Celsius. Use this when user wants temperature in Celsius or mentions 摄氏度.",
        parameters: z.object({
          temperature: z.number().describe("Temperature in Fahrenheit to convert"),
          location: z.string().optional().describe("Location context for the temperature"),
        }),
        generate: async function* ({ temperature, location = "Unknown" }) {
          // 返回确认组件，让用户决定是否执行
          return <TemperatureConfirmation temperature={temperature} location={location} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}


