import { GradeItemClient } from './gradeClientService';
import { ContentSet, GradeGroup, GradeItem, GradeState, ItemState, ProgressGrade } from '../models/view/interface';
import { HistoryIdStorage } from './storageService';
import { ConfigClient } from './configClientService';

export class ProgressService {
    private _historyId: string
    private history: ContentSet[] = [];
    private gradeId: number = -1;
    private gradeGroups: GradeGroup[];

    public constructor() { }


    public intitialize = async () => {
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (typeof localStorage !== 'undefined') {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100);
        }).then(async () => {
            this._historyId = HistoryIdStorage.read();
            const [config, history] = await Promise.all([
                ConfigClient.get(),
                GradeItemClient.getAll(this._historyId)
            ]);
            this.history = history;
            console.log(this.history)
            this.gradeId = Math.max(...this.history.map(x => x.gradeId));
            this.gradeGroups = config.grades.map((grade) => ({
                id: grade.id,
                count: grade.count,
                history: this.history
                    .filter((c) => c.gradeId === grade.id),
            } as ProgressGrade))
                .filter((x) => x.history.length !== 0 || x.id >= this.gradeId)
                .map((gradeProgress) => ProgressService.getGradeProgress(gradeProgress, this.gradeId));
        }).then(async () => {
            if (!this.getCurrentActiveItem()) {
                await this.generateNewItem();
                this.gradeId = Math.max(...this.history.map(x => x.gradeId));

            }
        })
    }
    public getHistoryId = (): string => this._historyId;
    public getCurrentGrade = (): number => this.gradeId;
    public getGrades = (): GradeGroup[] => this.gradeGroups;
    public getItems = (): ContentSet[] => this.gradeGroups.flatMap(x => x.items).filter(x => x.value).map(x => x.value);
    private findCurrentGrade = (): GradeGroup | null => this.gradeGroups.find(x => x.id === this.gradeId) || null;

    public getCurrentActiveItem = (): ContentSet | null =>
        this.findCurrentGrade()?.items?.findLast(x => x.state === ItemState.active)?.value;

    public getLastItem = (): ContentSet | null =>
        this.findCurrentGrade()?.items?.findLast(x => x.state !== ItemState.toDo)?.value;

    public generateNewItem = async (): Promise<void> => {
        if (this.getCurrentActiveItem()) {
            console.warn("There is currently an active item");
            return;
        }
        const content: ContentSet | null = await GradeItemClient.createOne(this._historyId);
        if (!content) return;
        this.history.push(content);
        const grade: GradeGroup = this.gradeGroups.find(x => x.id === content.gradeId);
        const firstIdx: number = grade.items.findIndex(x => x.state === ItemState.toDo);
        grade.items[firstIdx] = {
            state: ItemState.active,
            value: content,
        }
        this.onItemsChanged(content.gradeId)
    }

    public updateItem = (item: ContentSet) => {
        const grade: GradeGroup = this.gradeGroups.find(x => x.id === item.gradeId);
        const historyIdx: number = this.history.findIndex(x => x?.id === item.id);
        this.history[historyIdx] = item;
        const firstIdx: number = grade.items.findIndex(x => x?.value?.id === item.id);
        const prevState: ItemState = grade.items[firstIdx].state;
        grade.items[firstIdx] = ProgressService.GetGradeItem(item, grade.state);
        if (prevState === ItemState.active) {
            this.onItemsChanged(item.gradeId)
        }

    }

    private onItemsChanged = (gradeId: number) => {
        const idx = this.gradeGroups.findIndex(x => x.id === gradeId);
        if (idx === -1) return;
        this.gradeGroups[idx] = ProgressService.getGradeProgress(
            {
                history: this.gradeGroups[idx].items.filter(x => x.value).flatMap(x => x.value),
                id: gradeId,
                count: this.gradeGroups[idx].count
            }
            , gradeId
        );

        const remainingCount = this.findCurrentGrade()
            ?.items
            ?.filter(x => x.state === ItemState.toDo || x.state === ItemState.active)
            ?.length
            ?? -1
        if (remainingCount !== 0) return;

        this.gradeId += 1;
        this.gradeGroups[idx].state = GradeState.completed;
    }


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

    private static getGradeProgress = (gradeProgress: ProgressGrade, currentGradeId: number): GradeGroup => {

        const gradeState: GradeState =
            gradeProgress.id < currentGradeId
                ? GradeState.completed
                : gradeProgress.id === currentGradeId
                    ? GradeState.active
                    : GradeState.todo;
        let lastIdxInArow: number[] = [];
        const updateFastIdxInArow = (idx: number, state: ItemState): boolean => {
            const notEmpty = lastIdxInArow.length !== 0;
            const canUpdate = notEmpty && lastIdxInArow[lastIdxInArow.length - 1] === idx - 1;
            if (!canUpdate && notEmpty) return false;
            if (state !== ItemState.active && state !== ItemState.validCorrect) return false;
            lastIdxInArow.push(idx);
            return true
        }

        const dots: GradeItem[] = gradeProgress.history
            .sort(
                (a, b) => (b.created?.getTime() ?? 0) -
                    (a.created?.getTime() ?? 0)
            ).map((contentSet, idx) => {
                const value = ProgressService.GetGradeItem(contentSet, gradeState);

                if (value.state === ItemState.incorrect) {
                    updateFastIdxInArow(idx, value.state)
                    return value;
                }

                if (value.state === ItemState.validCorrect || value.state === ItemState.active) {
                    const valid: boolean = updateFastIdxInArow(idx, value.state)
                    if (value.state === ItemState.active) return value;
                    value.state = valid ? ItemState.validCorrect : ItemState.invalidCorrect
                    return value;
                }
                return value;
            });
        const allDots: GradeItem[] =
            gradeState === GradeState.completed
                ? [
                    ...Array(Math.max(gradeProgress.count - dots.length, 0)).fill({
                        state: ItemState.validCorrect,
                        isSelected: false,
                    }),
                    ...dots.reverse(),
                ]
                : [
                    ...dots.reverse(),
                    ...Array(Math.max(gradeProgress.count - lastIdxInArow.length, 0)).fill({
                        state: ItemState.toDo,
                        isSelected: false,
                    }),
                ];

        return {
            state: gradeState,
            items: allDots,
            id: gradeProgress.id,
            count: gradeProgress.count
        } as GradeGroup;
    }
}
