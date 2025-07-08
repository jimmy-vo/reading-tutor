import { Content, EvaluationOutput, GenerateContentInput, GenerateImageOutput, GenerateTopicInput, ImagePromptInput } from "../models/dto";
import { Challenge, ContentSet } from "../models/view";
import axios from "axios"

export namespace ContentClient {
    export const getContent = async (topic: string, grade: number): Promise<Content> => {
        let attempts = 0;
        let contentResponse;

        while (attempts < 3) {
            try {

                const dto: GenerateContentInput = {
                    topic: topic,
                    level: grade
                }
                contentResponse = await axios.post('/api/generateContent', dto);
                return contentResponse.data as Content;
            } catch (error) {
                console.error(error)
                attempts++;
            }
        }

        throw new Error('Failed to fetch content after 3 attempts');
    };

    const getImagePrompt = async (dto: ImagePromptInput): Promise<string> => {
        let attempts = 0;
        let promptResponse;

        while (attempts < 3) {
            try {
                promptResponse = await axios.post('/api/generateImagePrompt', dto);
                const prompt = (promptResponse.data as { prompt: string }).prompt;
                return prompt;
            } catch (error) {
                console.error(error)
                attempts++;
            }
        }

        throw new Error('Failed to fetch image prompt after 3 attempts');
    };

    export const getImage = async (contentSet: ContentSet): Promise<string> => {
        let attempts = 0;
        let imageResponse;

        const dto: ImagePromptInput = {
            passage: contentSet.text,
            qna: contentSet.challenges.map(x => ({ question: x.question, answer: x.expected, id: x.id })),
            previousAttempts: []
        }
        while (attempts < 3) {
            try {
                const prompt = await getImagePrompt(dto);
                dto.previousAttempts.push(prompt)
                imageResponse = await axios.post('/api/generateImage', {
                    text: dto.passage,
                    qna: dto.qna,
                    prompt: prompt
                });
                const data = imageResponse.data as GenerateImageOutput;
                return data.id;
            } catch (error) {
                console.error(error)
                attempts++;
            }
        }

        throw new Error('Failed to fetch image after 3 attempts');
    };

    export const getTopic = async (topics: string[], grade: number): Promise<string> => {
        let attempts = 0;
        let topicResponse;

        while (attempts < 3) {
            try {
                const dto: GenerateTopicInput = {
                    topics: topics,
                    level: grade
                }
                topicResponse = await axios.post('/api/generateTopic', dto);

                const newTopic = (topicResponse.data as { topic: string }).topic;
                return newTopic;

            } catch (error) {
                console.error(error)
                attempts++;
            }
        }

        throw new Error('Failed to fetch topic after 3 attempts');
    };

    export const getEvaluation = async (contentSet: ContentSet): Promise<Challenge[]> => {
        let attempt = 0;

        while (attempt < 3) {
            try {
                const response = await axios.post('/api/verifyAnswers', {
                    text: contentSet.text,
                    qna: contentSet.challenges.map(x => ({
                        id: x.id,
                        question: x.question,
                        obtainedAnswer: x.answer,
                        expectedAnswer: x.explaination,
                    }))
                });
                return contentSet.challenges.map(x => {
                    const entry = (response.data as EvaluationOutput[]).find(e => e.id === x.id)!
                    x.correct = entry.correct;
                    x.explaination = entry.suggestion;
                    return x;
                })
            } catch (error) {
                console.error(error)
                console.error(error)
                attempt++;
            }
        }
        throw new Error('Failed to verify Answers after 3 attempts');
    }

}
