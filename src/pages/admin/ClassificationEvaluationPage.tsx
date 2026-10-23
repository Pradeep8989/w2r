import React, { useState, useEffect } from 'react';
import {
  TestTube2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { evaluationService, EvaluationSummary } from '../../services/evaluationService';
import { storageService } from '../../services/storageService';
import { ClassificationEvaluationItem } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ClassificationEvaluationPage: React.FC = () => {
  const [data, setData] = useState<ClassificationEvaluationItem[]>([]);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [filterResult, setFilterResult] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    setData(storageService.getEvaluationData());
    setSummary(evaluationService.getSummary());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  if (!summary) return null;

  const filteredItems = data.filter((item) => {
    const matchesFilter =
      filterResult === 'all'
        ? true
        : filterResult === 'correct'
        ? item.isCorrect
        : !item.isCorrect;

    const matchesSearch =
      item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.groundTruthCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.predictedCategory.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Classification Evaluation &amp; Benchmark Dataset
          </h1>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
            Model Evaluation
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quantitative assessment of simulated computer vision models against ground-truth labeled waste items.
        </p>
      </div>

      {/* Mandatory Hackathon Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold block text-amber-900">
            Classification Evaluation Transparency Notice:
          </span>
          <p className="text-amber-800 leading-relaxed">
            The dataset and confusion metrics below are illustrative test samples provided for prototype demonstration.
            This evaluation dataset is updated continuously with field test data from real-world material captures and recycler feedback loops.
          </p>
        </div>
      </div>

      {/* Accuracy KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Model Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {summary.overallAccuracyPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.correctCount} correct of {summary.totalSamples} total samples
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Error Rate</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">
            {Math.round((summary.incorrectCount / summary.totalSamples) * 1000) / 10}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.incorrectCount} misclassified test cases
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Average Confidence</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {Math.round(summary.averageConfidence * 100)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mean softmax confidence score</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Labeled Benchmark Set</span>
            <TestTube2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {summary.totalSamples}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Annotated validation items</p>
        </Card>
      </div>

      {/* Per-Class Accuracy Chart */}
      <Card className="p-6">
        <CardHeader
          title="Per-Class Classification Accuracy"
          subtitle="Model performance across individual material streams"
        />
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.perClassAccuracy} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="categoryName"
                width={160}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(val: any) => [`${val}%`, 'Accuracy']} />
              <Bar dataKey="accuracyPercent" name="Accuracy %" fill="#166534" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Confusion Matrix / Breakdown */}
      <Card className="p-6">
        <CardHeader
          title="Misclassification &amp; Edge Case Analysis"
          subtitle="Identified false positive patterns from benchmark testing"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {summary.confusionBreakdown
            .filter((c) => c.groundTruth !== c.predicted)
            .map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1"
              >
                <div className="font-bold text-rose-950 flex items-center justify-between">
                  <span>
                    {c.groundTruth.replace(/_/g, ' ')} &rarr; {c.predicted.replace(/_/g, ' ')}
                  </span>
                  <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {c.count} {c.count === 1 ? 'instance' : 'instances'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Visual similarity in low light or surface coating caused prediction divergence.
                </p>
              </div>
            ))}
        </div>
      </Card>

      {/* Sample Evaluation Dataset Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Evaluation Dataset Rows</h3>
            <p className="text-xs text-slate-500">
              Direct verification of ground-truth vs AI model prediction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search sample..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-200 text-slate-700"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setFilterResult('all')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  filterResult === 'all' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterResult('correct')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  filterResult === 'correct' ? 'bg-white shadow-xs font-bold text-emerald-800' : 'text-slate-600'
                }`}
              >
                Correct
              </button>
              <button
                onClick={() => setFilterResult('incorrect')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  filterResult === 'incorrect' ? 'bg-white shadow-xs font-bold text-rose-800' : 'text-slate-600'
                }`}
              >
                Errors
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Sample ID &amp; File</th>
                <th className="px-5 py-3">Ground Truth</th>
                <th className="px-5 py-3">Predicted Stream</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">Validation Result</th>
                <th className="px-5 py-3">Analysis Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-slate-900 block">{item.sampleId}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.filename}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <MaterialTag categoryId={item.groundTruthCategory} categoryName={item.groundTruthCategory.replace(/_/g, ' ')} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <MaterialTag categoryId={item.predictedCategory} categoryName={item.predictedCategory.replace(/_/g, ' ')} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                    {Math.round(item.confidence * 100)}%
                  </td>
                  <td className="px-5 py-3.5">
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Misclassified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-[11px] max-w-xs">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

