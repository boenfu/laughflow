import {createContext} from 'react';

import {
  CustomConditionCandidate,
  CustomConditionRenderDefinition,
} from '../@custom-condition';

export const ConditionContext = createContext<{
  renderDefinition?: CustomConditionRenderDefinition;
  leftCandidates?: CustomConditionCandidate[];
  rightCandidates?: CustomConditionCandidate[];
}>({
  leftCandidates: [],
  rightCandidates: [],
  renderDefinition: {},
});
