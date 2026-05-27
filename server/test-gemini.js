import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyAquFC5dcpb1YFnDzZNuxWBIQfwMPXANU4');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
  try {
    const result = await model.generateContent('Say hello world');
    console.log('SUCCESS:', result.response.text());
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}
run();
