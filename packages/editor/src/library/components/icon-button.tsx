import classNames from 'classnames';
import {castArray} from 'lodash-es';
import Tooltip from 'rc-tooltip';
import React, {FC, ReactElement} from 'react';
import styled from 'styled-components';

export interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltip?: string | string[];
  disable?: boolean | boolean[];
}

const Button = styled.div`
  opacity: 0.8;
  height: 26px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  cursor: pointer;

  &:hover {
    color: #296dff;
  }

  &.disable {
    color: #999999;
    cursor: default;
    pointer-events: none;
  }
`;

const SplitLine = styled.div`
  width: 1px;
  height: 18px;
  margin: 0 1.5px;
  background-color: #c2c5cd;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  background: #d8dade;
  box-shadow: 0px 2px 4px rgba(185, 188, 196, 0.77);

  & + & {
    margin-left: 8px;
  }
`;

const TextOverlay = styled.div`
  position: relative;
  text-align: center;
  top: 8px;
  line-height: 28px;
  font-size: 12px;
  color: #fff;
  background: #3f424a;
  border-radius: 2px;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 7px;
    height: 7px;
    transform: translateX(-50%) rotate(45deg);
    background: inherit;
  }

  filter: drop-shadow(0px 2px 10px rgba(0, 0, 0, 0.6));
`;

const TextTooltip: FC<{text?: string}> = ({text, children}) => {
  if (!text) {
    return children as ReactElement;
  }

  return (
    <Tooltip
      overlayStyle={{width: 64}}
      placement="bottom"
      trigger={['hover']}
      destroyTooltipOnHide={true}
      overlay={<TextOverlay>{text}</TextOverlay>}
    >
      {children as ReactElement}
    </Tooltip>
  );
};

export const IconButton: FC<IconButtonProps> = React.memo(
  ({children, tooltip, disable, ...props}) => {
    let tooltips = castArray(tooltip);
    let disables = castArray(disable);

    return (
      <ButtonWrapper {...props}>
        {React.Children.toArray(children)
          .flatMap((child: React.ReactElement, index) => {
            let {onClick, ...restProps} = child.props;

            return [
              <TextTooltip key={`button:${index}`} text={tooltips[index]}>
                <Button
                  className={classNames({disable: disables[index] ?? disable})}
                  onClick={onClick}
                >
                  {{...child, props: restProps}}
                </Button>
              </TextTooltip>,
              <SplitLine key={`line:${index}`} />,
            ];
          })
          .slice(0, -1)}
      </ButtonWrapper>
    );
  },
);
