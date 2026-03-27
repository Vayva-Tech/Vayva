"use client";

import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { CheckCircle, CircleDashed } from "@phosphor-icons/react/ssr";
import { getStepsForBusinessType } from "./stepBuilder";

interface OnboardingProgressIndicatorProps {
  currentStepKey: string;
}

export function OnboardingProgressIndicator({ currentStepKey }: OnboardingProgressIndicatorProps) {
  const { state } = useOnboarding();
  
  // Get all steps based on business type
  const allSteps = getStepsForBusinessType(state.business?.businessType);
  const currentIndex = allSteps.findIndex(step => step.id === currentStepKey);
  const progressPercentage = Math.round(((currentIndex + 1) / allSteps.length) * 100);
  
  // Define milestones (key steps that represent major achievements)
  const milestones = [
    { stepId: "welcome", label: "Started", icon: "🎯" },
    { stepId: "identity", label: "Identity Verified", icon: "✓" },
    { stepId: "industry", label: "Industry Set", icon: "🏢" },
    { stepId: "finance", label: "Payment Ready", icon: "💳" },
    { stepId: "kyc", label: "KYC Complete", icon: "🛡️" },
    { stepId: "first_item", label: "First Product", icon: "📦" },
    { stepId: "publish", label: "Store Live", icon: "🚀" },
  ];
  
  const completedSteps = state.completedSteps || [];
  
  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Setup Progress
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentIndex + 1} of {allSteps.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {progressPercentage}%
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Milestone Indicators */}
        <div className="mt-4 flex items-center justify-between">
          {milestones.map((milestone, idx) => {
            const isCompleted = completedSteps.includes(milestone.stepId) || 
                               (idx > 0 && completedSteps.includes(milestones[idx - 1].stepId));
            const isCurrent = milestone.stepId === currentStepKey;
            const isUpcoming = !isCompleted && !isCurrent;
            
            return (
              <div key={milestone.stepId} className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${isCompleted 
                      ? "bg-green-500 text-white scale-110" 
                      : isCurrent 
                      ? "bg-green-500/10 text-green-600 ring-2 ring-green-500 scale-110" 
                      : "bg-gray-100 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle size={16} weight="fill" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                <span className={`
                  text-[9px] font-medium mt-1 text-center hidden lg:block
                  ${isCompleted ? "text-green-600" : isCurrent ? "text-green-700" : "text-gray-400"}
                `}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Motivational Messages Based on Progress */}
      {progressPercentage === 25 && (
        <div className="px-6 py-2 bg-green-50 border-t border-green-100">
          <p className="text-xs text-green-800 font-medium">
            🎉 Great start! You're 25% done. Keep going!
          </p>
        </div>
      )}
      
      {progressPercentage === 50 && (
        <div className="px-6 py-2 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-800 font-medium">
            💪 Halfway there! Your store is taking shape.
          </p>
        </div>
      )}
      
      {progressPercentage === 75 && (
        <div className="px-6 py-2 bg-purple-50 border-t border-purple-100">
          <p className="text-xs text-purple-800 font-medium">
            🚀 Almost done! Just a few more steps to launch.
          </p>
        </div>
      )}
      
      {progressPercentage === 100 && (
        <div className="px-6 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
          <p className="text-xs text-green-800 font-bold">
            ✨ Congratulations! Setup complete! Your store is ready to launch!
          </p>
        </div>
      )}
    </div>
  );
}
