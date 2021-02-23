import styled from 'styled-components';

export const MenuPopup = styled.div`
  flex: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  background-color: #fff;
  overflow: hidden;
`;
