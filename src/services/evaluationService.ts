import { storageService } from './storageService';
import { ClassificationEvaluationItem } from '../types';

export interface EvaluationSummary {
  totalSamples: number;
  correctCount: number;
  incorrectCount: number;
  overallAccuracyPercent: number;
  averageConfidence: number;
  perClassAccuracy: Array<{
    categoryId: string;
    categoryName: string;
    totalSamples: number;
    correctSamples: number;
    accuracyPercent: number;
  }>;
  confusionBreakdown: Array<{
    groundTruth: string;
    predicted: string;
    count: number;
  }>;
}

export const evaluationService = {
  getSummary(): EvaluationSummary {
    const data = storageService.getEvaluationData();
    const totalSamples = data.length;
    if (totalSamples === 0) {
      return {
        totalSamples: 0,
        correctCount: 0,
        incorrectCount: 0,
        overallAccuracyPercent: 0,
        averageConfidence: 0,
        perClassAccuracy: [],
        confusionBreakdown: [],
      };
    }

    const correctCount = data.filter((d) => d.isCorrect).length;
    const incorrectCount = totalSamples - correctCount;
    const overallAccuracyPercent = Math.round((correctCount / totalSamples) * 1000) / 10;
    const avgConf =
      data.reduce((acc, curr) => acc + curr.confidence, 0) / totalSamples;

    // Per-class metrics
    const classMap = new Map<string, { total: number; correct: number }>();
    const confusionMap = new Map<string, number>();

    data.forEach((item: ClassificationEvaluationItem) => {
      const current = classMap.get(item.groundTruthCategory) || { total: 0, correct: 0 };
      current.total += 1;
      if (item.isCorrect) current.correct += 1;
      classMap.set(item.groundTruthCategory, current);

      const confKey = `${item.groundTruthCategory} -> ${item.predictedCategory}`;
      confusionMap.set(confKey, (confusionMap.get(confKey) || 0) + 1);
    });

    const materials = storageService.getMaterials();
    const matNameMap = new Map(materials.map((m) => [m.id, m.name]));

    const perClassAccuracy = Array.from(classMap.entries()).map(([catId, counts]) => ({
      categoryId: catId,
      categoryName: matNameMap.get(catId) || catId,
      totalSamples: counts.total,
      correctSamples: counts.correct,
      accuracyPercent: Math.round((counts.correct / counts.total) * 1000) / 10,
    }));

    const confusionBreakdown = Array.from(confusionMap.entries()).map(([key, count]) => {
      const [gt, pred] = key.split(' -> ');
      return { groundTruth: gt, predicted: pred, count };
    });

    return {
      totalSamples,
      correctCount,
      incorrectCount,
      overallAccuracyPercent,
      averageConfidence: Math.round(avgConf * 100) / 100,
      perClassAccuracy,
      confusionBreakdown,
    };
  },
};
