import { ContentClient } from './clientSerivce';
import { InactiveTrackerService } from './inactiveTrackerService';
import { ContentSet } from '../models/view';
import { HistoryStorage, GradeStorage, ContentStorage } from './storageService';
import { Env } from './configService';

export namespace AppService {
    export const getAll = async (generate: boolean): Promise<ContentSet[]> => {
        let history = HistoryStorage.read();
        let gradeId = GradeStorage.read();
        let current: ContentSet | undefined = history.find(x => !x.challenges.every(c => c.correct !== undefined));
        if (current) {
            if (current.grade !== gradeId && generate) {
                history = history.filter(x => x !== current);
                HistoryStorage.write(history);
            } else {
                console.debug("AppService.getAll: found", history)
                InactiveTrackerService.start();
                return history;
            }
        }

        const grade = Env.grades.find(x => x.id === gradeId);
        if (countAllCorrectInArrow(history, gradeId) >= grade.count) {
            console.debug("AppService.getAll: all correct in a row!")
            gradeId += 1;
            GradeStorage.write(gradeId)
        }
        if (!generate) {
            InactiveTrackerService.start();
            return history;
        }
        console.debug("AppService.getAll: Add new item")
        current = await generateNewContent(history, gradeId);

        InactiveTrackerService.start();
        return Add(current)
    }

    const Add = (contentSet: ContentSet): ContentSet[] => {
        const history = HistoryStorage.read();
        history.unshift(contentSet);
        if (history.length > 10) {
            history.pop();
        }
        HistoryStorage.write(history);
        ContentStorage.reset();
        return history;
    };

    export const update = (contentSet: ContentSet): ContentSet => {
        const history = HistoryStorage.read();
        const index = history.findIndex((x) => x.topic == contentSet.topic);
        history[index] = JSON.parse(JSON.stringify(contentSet)) as ContentSet;
        HistoryStorage.write(history);
        return history[index];
    }

    export const reset = (): void => {
        HistoryStorage.write([]);
    };


    export const getActiveContentStorage = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
        const cachedContentSet: ContentSet | null = ContentStorage.read();

        if (validateContent(cachedContentSet, grade)) return cachedContentSet!;
        return await generateNewContent(history, grade);
    }

    export const countAllCorrectInArrow = (history: ContentSet[], grade: number) => {
        let currentCount = 0;

        const oldItems = history
            .filter(x => x.challenges.every((x) => x.correct !== undefined));

        for (const entry of oldItems) {
            const allCorrect = entry.challenges.every(c => c.correct === true);
            if (entry.grade < grade || !allCorrect) return currentCount;
            currentCount++;
        }
        return currentCount;
    };

    const generateNewContent = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
        const topics = history.map(x => x.topic);
        const topic = await ContentClient.getTopic(topics, grade);
        const content = await ContentClient.getContent(topic, grade);
        const contentSet: ContentSet = {
            topic: topic,
            grade: grade,
            text: content.passage,
            image: undefined,
            challenges: content.qna.map(x => ({
                id: x.id,
                explaination: "",
                question: x.question,
                answer: "",
                expected: x.answer,
                correct: undefined,
            }))
        };

        ContentStorage.write(contentSet);
        return contentSet;
    }

    const validateContent = (cachedContentSet: ContentSet | null, grade: number) =>
        cachedContentSet &&
        cachedContentSet.grade === grade &&
        typeof cachedContentSet.topic === 'string' &&
        typeof cachedContentSet.text === 'string' &&
        Array.isArray(cachedContentSet.challenges) &&
        cachedContentSet.challenges.every(
            (qna: any) =>
                typeof qna.id === 'string' &&
                typeof qna.question === 'string' &&
                typeof qna.expected === 'string');

}
