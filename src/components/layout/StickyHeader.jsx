import styled from "styled-components";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "components/common/avatar";

const TopBox = styled.div`
  background: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  left: 0;
  width: 100vw;
  box-sizing: border-box;
  height: 70px;
  z-index: 999;
  .lft {
    font-size: 30px;
    font-family: Poppins-SemiBold;
    font-weight: 600;
    color: #1a1323;
    line-height: 1.2em;
  }
  &.act {
    justify-content: center;
    height: 50px;
    .lft {
      font-size: 17px;
    }
    .AvatarBox {
      display: none;
    }
  }
`;

export default function StickyHeader({ title, bgColor, scrollRef }) {
  const userToken = useSelector((state) => state.userToken);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    scrollRef?.current && scrollRef.current.addEventListener("scroll", ScrollHeight);
    return () => {
      scrollRef?.current?.removeEventListener("scroll", ScrollHeight);
    };
  }, [scrollRef?.current]);

  const ScrollHeight = () => {
    setShow(scrollRef.current.scrollTop > 80);
  };

  const toGo = () => {
    navigate("/user/profile");
  };

  return (
    <TopBox bgColor={bgColor} className={show ? "act" : ""}>
      <div className="lft">{title}</div>
      <div className="AvatarBox" onClick={() => toGo()}>
        <Avatar src={userToken?.user?.avatar} size="36px" />
      </div>
    </TopBox>
  );
}
