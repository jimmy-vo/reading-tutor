import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { ContentSet, GradeGroup } from '../models/view/interface';
import { useState } from 'react';
import { Progress } from '../services/appService';
import { ContentClient } from '../services/clientSerivce';

interface ProgressType {
  grades: GradeGroup[];
  progressManager: Progress;
  selectedItem: ContentSet | undefined;
  setSelectedItem: React.Dispatch<React.SetStateAction<ContentSet>>;
  submit: (ContentSet) => Promise<void>;
}

const ProgressContext = createContext<ProgressType | undefined>(undefined);

export const ProgressProvider = ({
  children,
  onSucceeded,
  onFailed,
}: {
  children?: ReactNode;
  onSucceeded: (gradeId: number) => void;
  onFailed: (gradeId: number) => void;
}) => {
  const [progressManager] = useState<Progress>(new Progress());
  const [grades, setGrades] = useState<GradeGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentSet | undefined>();

  useEffect(() => {
    const fetchProgress = async () => {
      await progressManager.intitialize();
      setGrades(progressManager.getGrades());
      const item = await progressManager.getCurrentActiveItem();
      if (!item) {
        progressManager.generateNewItem();
        setGrades(progressManager.getGrades());
      }
      setSelectedItem(progressManager.getLastItem());
    };

    fetchProgress();
  }, []);

  const submit = async (updatedContentSet) => {
    const evaluatedChallenges = await ContentClient.getEvaluation(
      updatedContentSet,
    );
    const updatedSet: ContentSet = {
      ...updatedContentSet,
      challenges: evaluatedChallenges,
    };
    if (updatedSet.challenges.every((x) => x.correct === true)) {
      await progressManager.generateNewItem();
      onSucceeded(progressManager.getCurrentGrade());
      setGrades(progressManager.getGrades());
    } else {
      onFailed(progressManager.getCurrentGrade());
    }

    //getting image
    updatedSet.image = null;
    progressManager.updateItem(updatedSet);
    setSelectedItem(updatedSet);
    return ContentClient.getImage(updatedSet)
      .then((imageId) => {
        console.info('Get the image...');
        updatedSet.image = imageId;
        setSelectedItem(updatedSet);
      })
      .catch((e) => {
        console.error(e);
        console.info('Reset image id');
        updatedSet.image = undefined;
        setSelectedItem(updatedSet);
      });
  };

  return (
    <ProgressContext.Provider
      value={{ grades, selectedItem, progressManager, setSelectedItem, submit }}
    >
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
