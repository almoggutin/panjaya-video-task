import { Children, Fragment } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { StepperStep } from './stepper-step/stepper-step.component';
import type { StepperStepProps } from './stepper-step/stepper-step.component';

import './stepper.component.css';

type StepperProps = {
	children: ReactNode;
	currentStep: number;
};

function StepperRoot({ children, currentStep }: StepperProps) {
	const steps = Children.toArray(children) as ReactElement<StepperStepProps>[];

	return (
		<>
			<div className="stepper">
				{steps.map((stepEl, i) => {
					const stepNumber: number = i + 1;
					const isActive: boolean = currentStep >= stepNumber;
					const lineClass: string = `stepper__line${isActive ? ' stepper__line--done' : ''}`;
					const stepClass: string = `stepper__step${isActive ? ' stepper__step--active' : ''}`;

					return (
						<Fragment key={stepNumber}>
							{i > 0 && <div className={lineClass} />}

							<div className={stepClass}>
								<div className="stepper__num">{stepNumber}</div>
								<span className="stepper__label">{stepEl.props.label}</span>
							</div>
						</Fragment>
					);
				})}
			</div>

			{steps[currentStep - 1]}
		</>
	);
}

export const Stepper = Object.assign(StepperRoot, { Step: StepperStep });
