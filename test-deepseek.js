// 简单测试 DeepSeek API 配置
const { deepseek } = require('@ai-sdk/deepseek');
const { generateText } = require('ai');

async function testDeepSeek() {
  try {
    console.log('Testing DeepSeek API configuration...');
    console.log('API Key:', process.env.DEEPSEEK_API_KEY ? 'Set' : 'Not set');
    console.log('Base URL:', process.env.DEEPSEEK_BASE_URL);
    
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: 'Hello, please respond with "API working!"',
    });
    
    console.log('Success! Response:', result.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDeepSeek();
