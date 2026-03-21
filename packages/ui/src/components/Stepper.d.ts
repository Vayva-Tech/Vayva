import React from "react";
interface Step {
    id: string | number;
    label?: string;
}
interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}
export declare function Stepper({ steps, currentStep, className, }: StepperProps): React.JSX.Element;
export {};
