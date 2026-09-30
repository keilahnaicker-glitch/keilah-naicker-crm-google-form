import React from 'react';
import { FileText, Table, Code2, PlayCircle, Check, ArrowRight } from 'lucide-react';
import { PipelineStepId } from '../types';

interface PipelineStepperProps {
  currentStep: PipelineStepId;
  onSelectStep: (step: PipelineStepId) => void;
  formConfigured: boolean;
  sheetConfigured: boolean;
  scriptConfigured: boolean;
  testPassed: boolean;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStep,
  onSelectStep,
  formConfigured,
  sheetConfigured,
  scriptConfigured,
  testPassed,
}) => {
  const steps = [
    {
      id: 'form' as PipelineStepId,
      number: 1,
      title: 'Google Form',
      subtitle: 'Client details intake',
      icon: FileText,
      isCompleted: formConfigured,
      activeColor: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'sheet' as PipelineStepId,
      number: 2,
      title: 'Google Sheets',
      subtitle: 'Auto-saved database rows',
      icon: Table,
      isCompleted: sheetConfigured,
      activeColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'script' as PipelineStepId,
      number: 3,
      title: 'Google Apps Script',
      subtitle: 'Auto-welcome email trigger',
      icon: Code2,
      isCompleted: scriptConfigured,
      activeColor: 'from-amber-500 to-orange-600',
    },
    {
      id: 'test' as PipelineStepId,
      number: 4,
      title: 'End-to-End Test',
      subtitle: 'Live validation & verification',
      icon: PlayCircle,
      isCompleted: testPassed,
      activeColor: 'from-blue-600 to-cyan-600',
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>CRM Setup Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
              Form → Sheet → Script → Test
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential automation flow. Each stage connects directly with the previous one.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-900">Automation Target:</span>
          <span className="text-indigo-600 font-mono font-medium">keilahnaicker@gmail.com</span>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.id;
          const isDone = step.isCompleted;

          return (
            <button
              key={step.id}
              id={`stepper-btn-${step.id}`}
              onClick={() => onSelectStep(step.id)}
              className={`relative flex items-start p-3.5 rounded-xl border text-left transition-all group ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-500/80 shadow-xs ring-2 ring-indigo-500/20'
                  : isDone
                  ? 'bg-slate-50/80 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Step indicator circle */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mr-3 transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {isDone && !isCurrent ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-bold truncate ${
                      isCurrent ? 'text-indigo-950' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </p>
                  {idx < 3 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block ml-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{step.subtitle}</p>
                
                {/* Status pill */}
                <div className="mt-2">
                  {isCurrent ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                      Active Step
                    </span>
                  ) : isDone ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Configured ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      Ready to Setup
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
