import { ContentClient } from './clientSerivce';
import { Grade } from '../models/backend';
import { ContentSet } from '../models/view';
import { Config } from './configService';
import { HistoryStorage, GradeStorage, ContentStorage } from './storageService';

export const appendHistory = (contentSet: ContentSet): ContentSet[] => {
    const history = HistoryStorage.read();
    history.unshift(contentSet);
    if (history.length > 10) {
        history.pop();
    }
    HistoryStorage.write(history);
    ContentStorage.reset();
    return history;
};

export const updateHistory = (contentSet: ContentSet): ContentSet[] => {
    const history = HistoryStorage.read();
    const index = history.findIndex((x) => x.topic == contentSet.topic);
    history[index] = contentSet;
    HistoryStorage.write(history);
    return history;
}

export const resetHistory = (): void => {
    HistoryStorage.write([]);
};

export const countAllCorrectInArrow = (history: ContentSet[], grade: number) => {
    let currentCount = 0;
    const allAnswerCorrectList = history.filter(x => x.grade === grade).map(
        (x) =>
            x.challenges.filter((a) => a.correct === true).length ===
            x.challenges.length,
    );
    for (let i = 0; i < allAnswerCorrectList.length; i++) {
        if (allAnswerCorrectList[i] === true) {
            currentCount++;
        } else {
            break;
        }
    }
    return currentCount;
};

export const updateFromHistory = (history: ContentSet[]): boolean => {
    const gradeId = GradeStorage.read();
    var grade = Config.getGrade(gradeId);
    if (!grade) return false;
    var allCorrect = countAllCorrectInArrow(history, gradeId);
    const res = allCorrect >= grade.count;
    if (res) {
        GradeStorage.write(gradeId + 1);
        ContentStorage.reset();
    }
    return res;
}



export const generateNewContent = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
    const topics = history.map(x => x.topic);
    const topic = await ContentClient.getTopic(topics, grade);
    const content = await ContentClient.getContent(topic, grade);
    const contentSet: ContentSet = {
        topic: topic,
        grade: grade,
        text: content.text,
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


export const getActiveContentStorage = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
    const cachedContentSet: ContentSet | null = ContentStorage.read();

    if (validateContent(cachedContentSet, grade)) return cachedContentSet!;
    return await generateNewContent(history, grade);
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
