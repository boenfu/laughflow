import React, {FC} from 'react';
import styled from 'styled-components';

export interface TextSeparatorProps {
  className?: string;
}

const Wrapper = styled.div`
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background: #102a64;
  opacity: 0.06;
`;

const Text = styled.span`
  flex: none;
  font-size: 0.8em;
  padding: 0 3px;
  color: #999999;
`;

export const TextSeparator: FC<TextSeparatorProps> = ({
  className,
  children,
}) => {
  return (
    <Wrapper className={className}>
      <Line />
      <Text>{children}</Text>
      <Line />
    </Wrapper>
  );
};
