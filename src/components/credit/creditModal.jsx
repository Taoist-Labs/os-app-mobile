import styled from "styled-components";

export default function CreditModal({ children }) {
  return (
    <CreditModalModal>
      <CreditModalMask />
      <CreditModalModalContent>{children}</CreditModalModalContent>
    </CreditModalModal>
  );
}

const CreditModalModal = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 9999;
`;

const CreditModalMask = styled.div`
  position: absolute;
  background: rgba(244, 244, 248, 0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(10px);
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
`;

const CreditModalModalContent = styled.div`
  background-color: var(--background-color-1);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-top: 20px;
  text-align: center;
  padding-inline: 24px;
  padding-bottom: 29px;
  box-sizing: border-box;
`;
