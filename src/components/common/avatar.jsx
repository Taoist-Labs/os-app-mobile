import styled from "styled-components";
import { useEffect, useState } from "react";
import DefaultAvatarIcon from "assets/Imgs/avatar.svg";

export default function Avatar({ src, size, ...rest }) {
  const [imgSrc, setImgSrc] = useState(DefaultAvatarIcon);

  useEffect(() => {
    src && setImgSrc(src);
  }, [src]);

  return (
    <AvatarStyle size={size} {...rest}>
      <img src={imgSrc} alt="" onError={() => setImgSrc(DefaultAvatarIcon)} />
    </AvatarStyle>
  );
}

const AvatarStyle = styled.div`
  width: ${(props) => props.size || "58px"};
  height: ${(props) => props.size || "58px"};
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;
