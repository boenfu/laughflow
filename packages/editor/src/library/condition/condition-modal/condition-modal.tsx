import 'rc-dialog/assets/index.css';

import Dialog from 'rc-dialog';
import React, {FC, useState} from 'react';

import {ConditionEditor} from '../condition-editor';

interface ConditionModalProps {}

export const ConditionModal: FC<ConditionModalProps> = ({}) => {
  let [conditions, onChange] = useState<any>();

  return (
    <Dialog
      title="条件配置"
      onClose={() => {}}
      visible
      style={{
        width: 800,
      }}
    >
      <ConditionEditor
        leftCandidates={[
          {
            name: 'username',
            displayName: '用户名',
            operant: {
              type: 'object',
              value: '啊哈',
            },
          },
        ]}
        conditions={conditions}
        onChange={onChange}
      />
    </Dialog>
  );
};
