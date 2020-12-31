import {CheckCircleSolid, TimesCircleSolid} from '@magicflow/icons';

import {ILeafPlugin} from '../../plugin';

import {DoneLeaf} from './@done';
import {TerminateLeaf} from './@terminate';

export const doneLeaf: ILeafPlugin<'done'> = {
  type: 'done',
  render: DoneLeaf,
  selectorRender: CheckCircleSolid,
  selectorOrder: 0,
  multiple: false,
};

export const terminateLeaf: ILeafPlugin<'terminate'> = {
  type: 'terminate',
  render: TerminateLeaf,
  selectorRender: TimesCircleSolid,
  selectorOrder: 1,
  multiple: false,
};
