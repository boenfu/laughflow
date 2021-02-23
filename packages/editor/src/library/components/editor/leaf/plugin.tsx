import {CheckCircleSolid, TimesCircleSolid} from '@magicflow/icons';

import {ILeafPlugin} from '../../../plugin';

import {DoneLeaf} from './@done';
import {TerminateLeaf} from './@terminate';

export const doneLeaf: ILeafPlugin = {
  type: 'done',
  render: DoneLeaf,
  selector: {
    order: 0,
    multiple: false,
    render: CheckCircleSolid,
  },
};

export const terminateLeaf: ILeafPlugin = {
  type: 'terminate',
  render: TerminateLeaf,
  selector: {
    order: 1,
    multiple: false,
    render: TimesCircleSolid,
  },
};
