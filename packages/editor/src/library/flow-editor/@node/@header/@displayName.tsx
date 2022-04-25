import {SingleNode} from '@laughflow/procedure';
import {useDebounceFn} from 'ahooks';
import React, {ChangeEvent, FC, MouseEvent, useEffect, useRef} from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: break-spaces;

  &:not(.readOnly) {
    cursor: text;
  }

  &:not(:first-child) {
    justify-content: flex-end;
  }

  &:not(:last-child) {
    justify-content: flex-start;
  }

  &:first-child:last-child,
  &:not(:first-child):not(:last-child) {
    justify-content: center;
  }
`;

const DisplayNameInput = styled.div`
  max-width: 82%;
  outline: none;
  background: transparent;
  font-size: 14px;

  &:before {
    font-size: 14px;
  }

  &:empty:before {
    content: '节点名称';
    opacity: 1;
  }

  &:focus:before {
    opacity: 0.5;
  }

  &:not(:empty):before {
    content: none;
  }
`;

export interface DisplayNameProps {
  node: SingleNode;
  readOnly?: boolean;
  onChange?(node: SingleNode): void;
}

export const DisplayName: FC<DisplayNameProps> = ({
  node,
  readOnly,
  onChange,
}) => {
  // eslint-disable-next-line no-null/no-null
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let displayName = node.displayName || '';
    let input = inputRef.current!;

    if (input.textContent !== displayName) {
      input.textContent = displayName;
    }
  }, [node.displayName]);

  const {run: onInputChange} = useDebounceFn(
    ({nativeEvent: {target}}: ChangeEvent<HTMLInputElement>): void => {
      onChange?.({
        ...node,
        displayName: (target as HTMLElement)?.textContent || '',
      });
    },
    {
      wait: 500,
    },
  );

  const onWrapperClick = ({
    currentTarget,
    target,
    nativeEvent: {offsetX},
  }: MouseEvent<HTMLElement>): void => {
    if (readOnly || currentTarget !== target) {
      return;
    }

    let input = currentTarget.firstChild as HTMLInputElement;

    input.focus();

    if (currentTarget.offsetWidth / 2 > offsetX) {
      return;
    }

    let range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);

    let selection = window.getSelection();

    if (!selection) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <Wrapper className={readOnly ? 'readOnly' : ''} onClick={onWrapperClick}>
      <DisplayNameInput
        ref={inputRef}
        contentEditable={!readOnly}
        onInput={onInputChange}
        suppressContentEditableWarning
      >
        {readOnly ? node.displayName : ''}
      </DisplayNameInput>
    </Wrapper>
  );
};
