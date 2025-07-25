import { createAI } from 'ai/rsc';
import {
  ServerMessage,
  ClientMessage,
  continueConversation
} from './actions';

// 创建 AI Context，管理 AI State 和 UI State
export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

// 导出类型以供其他组件使用
export type AIState = typeof AI;
