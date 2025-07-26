import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { ContentSet, GradeGroup } from '../models/view/interface';
import { useState } from 'react';
import { ProgressService } from '../services/progressService';
import { GradeItemClient } from '../services/gradeClientService';

interface ProgressType {
  progressService: ProgressService;
  submit: (content: ContentSet) => Promise<void>;
}

const ProgressContext = createContext<ProgressType | undefined>(undefined);

export const ProgressProvider = ({
  children,
  onGradesChanged,
  onActiveItemChanged,
  onReady,
  onSucceeded,
  onFailed,
}: {
  children?: ReactNode;
  onGradesChanged: (grades: GradeGroup[]) => void;
  onActiveItemChanged: (item: ContentSet) => void;
  onReady: (gradeId: number, itemId: string) => void;
  onSucceeded: (gradeId: number) => void;
  onFailed: (gradeId: number) => void;
}) => {
  const [progressService] = useState<ProgressService>(new ProgressService());

  useEffect(() => {
    const fetchProgress = async () => {
      await progressService.intitialize();
      console.log(progressService);
      let item = await progressService.getCurrentActiveItem();
      onReady(item.gradeId, item.id);
      onGradesChanged(progressService.getGrades());
    };

    fetchProgress();
  }, []);

  const handleActiveItemChanged = (item: ContentSet) => {
    progressService.updateItem(item);
    onActiveItemChanged(item);
  };

  const submit = async (item: ContentSet) => {
    let patchedItem: ContentSet = await GradeItemClient.patchOne(
      progressService.getHistoryId(),
      item,
    );
    handleActiveItemChanged(patchedItem);
    const succeeded = patchedItem.challenges.every((x) => x.correct === true);
    if (succeeded) {
      onSucceeded(progressService.getCurrentGrade());
    } else {
      onFailed(progressService.getCurrentGrade());
    }
    await Promise.all([
      progressService
        .generateNewItem()
        .then(() => onGradesChanged(progressService.getGrades())),
      (async () => {
        if (!succeeded) return;

        console.info('Getting the image...');
        handleActiveItemChanged({ ...patchedItem, image: null });

        patchedItem = await GradeItemClient.patchOne(
          progressService.getHistoryId(),
          patchedItem,
        );
        handleActiveItemChanged({ ...patchedItem });
      })(),
    ]);
    handleActiveItemChanged({ ...patchedItem });
  };

  console.debug('ProgressProvider');
  return (
    <ProgressContext.Provider value={{ progressService, submit }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
