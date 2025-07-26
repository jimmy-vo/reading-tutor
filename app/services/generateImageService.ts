import { imageComplettion, llmCompletion } from '../services/openaiService';
import fs from 'fs';
import { Env } from '../services/configService';
import path from 'path';
import { ContentSet } from '../models/view/interface';
import { retry } from '../helper/retry';

const mockedImageId = true ? "mocked-id" : undefined;

export const generateImage = async (historyId: string, item: ContentSet): Promise<ContentSet> => {

    const imageDir = path.join(Env.storagePath, historyId, "images");
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    const imagePath = path.join(imageDir, `${item.id}.png`);
    if (Env.Disfusion.mockedApi !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 500));
        item.image = mockedImageId
        return item;
    }
    const previousAttempts: string[] = [];

    return await retry(async () => {
        const prompt = await getImagePrompt(item, previousAttempts);
        previousAttempts.push(prompt);
        const base64Image = await imageComplettion(prompt);
        const buffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(imagePath, buffer);
        return { ...item, image: item.id }
    })
};


const getImagePrompt = async (item: ContentSet, previousAttempts: string[]): Promise<string | null> => {
    const previousAttemptString: string = previousAttempts.length === 0
        ? ""
        : `PREVIOUS ATTEMPTS failed due to content filter. Try to rephrase or come up with a safer description.
PREVIOUS ATTEMPTS: ${JSON.stringify(previousAttempts, null, 0)}
`;

    const prompt = `${Date.now()}
Your task is to generate an IMAGE DESCRIPTION in plain text for an PASSAGE inllustration within 4 sentences. 
Look at the qna to describe the main subject of the image, then analyze the passage to describe background.
The image must illustrate the passage and focus on what being asked.
The IMAGE DESCRIPTION doesn't mention the instruction above or this task's requirement. And must be understandable without PASSAGE or QNA.
PASSAGE: ${item.passage}
QNA: ${JSON.stringify(item.challenges.map(x => ({ question: x.question, answer: x.answer })), null, 0)}
${previousAttemptString}
IMAGE DESCRIPTION:
`;
    const response = await llmCompletion(prompt);
    return response.choices[0]?.message?.content?.trim() ?? null;
}
