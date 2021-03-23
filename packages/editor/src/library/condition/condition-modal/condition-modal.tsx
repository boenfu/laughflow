import 'rc-dialog/assets/index.css';

import Dialog from 'rc-dialog';
import React, {FC, useState} from 'react';
import styled from 'styled-components';

import {ConditionOrGroup} from '../@custom-condition';
import {ConditionEditor} from '../condition-editor';

const Footer = styled.div`
  display: flex;
  padding: 12px 40px;
  justify-content: flex-end;
  background: #f7f8fa;
  box-shadow: 0px -1px 1px rgba(0, 0, 0, 0.07);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
`;

const Button = styled.div`
  border-radius: 2px;
  padding: 7px 16px;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  color: #666666;
  border: 1px solid #e6e7eb;
  box-sizing: border-box;
`;

const OkButton = styled(Button)`
  color: #ffffff;
  background-color: #296dff;
  margin-left: 12px;
`;

interface ConditionModalProps {
  initialConditions?: ConditionOrGroup;
  onSave?(conditions: ConditionOrGroup | undefined): void;
  onCancel?(): void;
}

export const ConditionModal: FC<ConditionModalProps> = ({
  initialConditions,
  onSave,
  onCancel,
}) => {
  let [conditions, onChange] = useState<ConditionOrGroup | undefined>(
    initialConditions,
  );

  return (
    <Dialog
      title="条件配置"
      onClose={onCancel}
      visible
      style={{
        width: 800,
      }}
      bodyStyle={{
        padding: 0,
        paddingTop: 20,
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
      <Footer>
        <CancelButton onClick={onCancel}>取消</CancelButton>
        <OkButton
          onClick={() => {
            onSave?.(conditions);
          }}
        >
          确认
        </OkButton>
      </Footer>
    </Dialog>
  );
};
