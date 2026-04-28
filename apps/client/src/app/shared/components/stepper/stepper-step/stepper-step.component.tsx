import type { ReactNode } from 'react';

import './stepper-step.component.css';

export type StepperStepProps = {
	label: ReactNode;
	children: ReactNode;
};

export function StepperStep({ children }: StepperStepProps) {
	return <div className="stepper-step">{children}</div>;
}
