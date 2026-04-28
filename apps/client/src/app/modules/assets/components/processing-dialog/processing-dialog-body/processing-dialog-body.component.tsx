import { Fragment } from 'react';

import { AssetStatus } from '../../../models/asset.models';
import { PROCESSING_STEPS } from '../../../constants/asset-processing.constants';

import './processing-dialog-body.component.css';

type ProcessingDialogBodyProps = {
	status: AssetStatus;
	currentIdx: number;
	progress: number;
};

export function ProcessingDialogBody({ status, currentIdx, progress }: ProcessingDialogBodyProps) {
	return (
		<section className="dialog__body">
			<div className="proc-stepper">
				{PROCESSING_STEPS.map((state, i) => {
					const done = i < currentIdx;
					const active = i === currentIdx;
					return (
						<Fragment key={state}>
							{i > 0 && (
								<div className={`proc-stepper__line${done ? ' proc-stepper__line--done' : ''}`} />
							)}
							<div
								className={`proc-stepper__step${done ? ' proc-stepper__step--done' : active ? ' proc-stepper__step--active' : ''}`}
							>
								<div className="proc-stepper__circle">
									{done ? '✓' : active ? <span className="proc-stepper__pulse" /> : null}
								</div>
								<span className="proc-stepper__label">{state}</span>
							</div>
						</Fragment>
					);
				})}
			</div>

			{progress > 0 && status !== AssetStatus.READY && (
				<>
					<div className="proc-progress__track">
						<div className="proc-progress__fill" style={{ width: `${progress * 100}%` }} />
					</div>
					<p className="proc-progress__pct">{Math.round(progress * 100)}%</p>
				</>
			)}
		</section>
	);
}
