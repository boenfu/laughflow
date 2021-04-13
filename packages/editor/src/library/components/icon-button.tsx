import classNames from 'classnames';
import {castArray} from 'lodash-es';
import React, {FC} from 'react';
import styled from 'styled-components';

export interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltip?: string | string[];
  disable?: boolean | boolean[];
}

const Button = styled.div`
  position: relative;
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

  &:hover {
    &::before {
      content: attr(title);
      position: absolute;
      text-align: center;
      white-space: nowrap;
      box-sizing: border-box;
      padding: 0 8px;
      top: calc(100% + 10px);
      height: 28px;
      line-height: 28px;
      font-size: 12px;
      color: #fff;
      background: #3f424a;
      border-radius: 2px;
      filter: drop-shadow(0px 2px 10px rgba(0, 0, 0, 0.6));
    }

    &::after {
      content: '';
      position: absolute;
      top: calc(100% + 7px);
      left: 50%;
      width: 6.4px;
      height: 6.4px;
      transform: translateX(-50%) rotate(45deg);
      background: #3f424a;
    }
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
              <Button
                key={`button:${index}`}
                title={tooltips[index]}
                className={classNames({disable: disables[index] ?? disable})}
                onClick={onClick}
              >
                {{...child, props: restProps}}
              </Button>,
              <SplitLine key={`line:${index}`} />,
            ];
          })
          .slice(0, -1)}
      </ButtonWrapper>
    );
  },
);
