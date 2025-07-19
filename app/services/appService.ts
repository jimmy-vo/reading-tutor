import { ContentClient } from './clientSerivce';
import { ContentSet, GradeGroup, GradeItem, GradeState, ItemState } from '../models/view/interface';
import { HistoryStorage, GradeStorage } from './storageService';
import { Env } from './configService';

export class Progress {

    private history: ContentSet[] = [];
    private gradeId: number = -1;
    private gradeGroup: GradeGroup[];

    public constructor() {
    }

    public intitialize = async () => {
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (typeof localStorage !== 'undefined') {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100);
        }).then(() => {
            this.history = HistoryStorage.read();
            this.gradeId = GradeStorage.read();
            this.gradeGroup = Progress.getProgress(this.history, this.gradeId);
        });
    }
    public getOtherItems = (item: ContentSet): { prev: ContentSet | null, next: ContentSet | null } => {
        const availbleItems = this.gradeGroup.flatMap(x => x.items.filter(x => x.state !== ItemState.toDo && x.value)).map(x => x.value);
        const index = availbleItems.findIndex(x => x.topic === item.topic);
        return {
            prev: index <= 0 ? null : availbleItems[index - 1],
            next: index >= availbleItems.length - 1 ? null : availbleItems[index + 1]
        }
    }
    public getCurrentGrade = (): number => this.gradeId;

    public getGrades = (): GradeGroup[] => this.gradeGroup;

    private findCurrentGrade = (): GradeGroup | null => this.gradeGroup.find(x => x.id === this.gradeId) || null;

    public getCurrentActiveItem = (): ContentSet | null =>
        this.findCurrentGrade()?.items?.findLast(x => x.state === ItemState.active)?.value;

    public getLastItem = (): ContentSet | null =>
        this.findCurrentGrade()?.items?.findLast(x => x.state !== ItemState.toDo)?.value;

    public generateNewItem = async (): Promise<boolean> => {
        const currentTodo = this.getCurrentToDoCount();
        if (currentTodo === 0) {
            this.gradeId += 1;
            GradeStorage.write(this.gradeId);
            this.gradeGroup.find(x => x.id === this.gradeId).state = GradeState.active;
        }
        const preGrade = this.gradeGroup.find(x => x.id === this.gradeId - 1);
        if (preGrade) {
            preGrade.state = GradeState.completed;
        }
        const topics = this.history.map(x => x.topic);
        const topic = await ContentClient.getTopic(topics, this.gradeId);
        const content = await ContentClient.getContent(topic, this.gradeId);
        const item: ContentSet = {
            topic: topic,
            created: new Date(),
            gradeId: this.gradeId,
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
        this.history.push(item);
        HistoryStorage.write(this.history);
        console.log(item.gradeId)
        const grade: GradeGroup = this.gradeGroup.find(x => x.id === item.gradeId);
        const firstIdx: number = grade.items.findIndex(x => x.state === ItemState.toDo);
        grade.items[firstIdx] = {
            state: ItemState.active,
            value: item,
        }
        return currentTodo === 0;
    }

    public updateItem = (item: ContentSet) => {
        const grade: GradeGroup = this.gradeGroup.find(x => x.id === item.gradeId);
        const historyIdx: number = this.history.findIndex(x => x?.topic === item.topic);
        this.history[historyIdx] = item;
        HistoryStorage.write(this.history);
        const firstIdx: number = grade.items.findIndex(x => x?.value?.topic === item.topic);
        grade.items[firstIdx] = Progress.GetGradeItem(item, grade.state);
    }


    public getCurrentToDoCount = () => this.findCurrentGrade()
        ?.items
        ?.filter(x => x.state === ItemState.toDo)
        ?.length
        ?? -1

    private static GetGradeItem = (contentSet: ContentSet, gradeState: GradeState): GradeItem => {
        if (gradeState === GradeState.completed) {
            return {
                state: ItemState.validCorrect,
                value: contentSet,
            };
        }
        if (gradeState === GradeState.todo) {
            return {
                state: ItemState.toDo,
                value: contentSet,
            };
        }

        if (contentSet.challenges.some((c) => c.correct === false)) {
            return {
                state: ItemState.incorrect,
                value: contentSet,
            };
        }

        if (contentSet.challenges.every((c) => c.correct === true)) {
            return {
                state: ItemState.validCorrect,
                value: contentSet,
            };
        }
        if (contentSet.challenges.every((c) => c.correct === undefined)) {
            return {
                state: ItemState.active,
                value: contentSet,
            };
        }

        return {
            state: contentSet.challenges.some((c) => c.correct === false)
                ? ItemState.incorrect
                : contentSet.challenges.every((c) => c.correct === true)
                    ? ItemState.validCorrect
                    : ItemState.invalidCorrect,
            value: contentSet,
        };
    };

    private static getProgress = (history: ContentSet[], currentGradeId: number): GradeGroup[] => {
        return Env.grades.map((grade) => ({
            id: grade.id,
            count: grade.count,
            history: history
                .filter((c) => c.gradeId === grade.id)
                .sort(
                    (a, b) => (b.created?.getTime() ?? 0) -
                        (a.created?.getTime() ?? 0)
                ),
        }))
            .filter((x) => x.history.length !== 0 || x.id >= currentGradeId)
            .map((g) => {
                const gradeState: GradeState =
                    g.id < currentGradeId
                        ? GradeState.completed
                        : g.id === currentGradeId
                            ? GradeState.active
                            : GradeState.todo;
                let isValid: boolean = true;
                let validCount = g.count;
                const dots: GradeItem[] = g.history.map((contentSet) => {

                    const value = Progress.GetGradeItem(contentSet, gradeState);

                    if (value.state === ItemState.incorrect) {
                        isValid = false;
                        validCount = g.count;
                        return value;
                    }

                    if (value.state === ItemState.validCorrect || value.state === ItemState.active) {
                        isValid = isValid && true;
                        validCount -= isValid ? 1 : 0;

                        if (value.state === ItemState.active) return value;

                        value.state = isValid ? ItemState.validCorrect : ItemState.invalidCorrect
                        return value;
                    }
                    return value;
                });
                const allDots: GradeItem[] =
                    gradeState === GradeState.completed
                        ? [
                            ...Array(g.count - dots.length).fill({
                                state: ItemState.validCorrect,
                                isSelected: false,
                            }),
                            ...dots.reverse(),
                        ]
                        : [
                            ...dots.reverse(),
                            ...Array(validCount).fill({
                                state: ItemState.toDo,
                                isSelected: false,
                            }),
                        ];

                return {
                    state: gradeState,
                    items: allDots,
                    id: g.id,
                } as GradeGroup;
            });

    }
}

export namespace AppService {

    const validateContent = (cachedContentSet: ContentSet | null, grade: number) =>
        cachedContentSet &&
        cachedContentSet.gradeId === grade &&
        typeof cachedContentSet.topic === 'string' &&
        typeof cachedContentSet.text === 'string' &&
        Array.isArray(cachedContentSet.challenges) &&
        cachedContentSet.challenges.every(
            (qna: any) =>
                typeof qna.id === 'string' &&
                typeof qna.question === 'string' &&
                typeof qna.expected === 'string');

}
