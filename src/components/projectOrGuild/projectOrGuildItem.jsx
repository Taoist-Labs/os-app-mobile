import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { RectangularSkeleton } from "components/common/skeleton";
import DefaultLogo from "assets/Imgs/defaultLogo.png";

export default function ProjectOrGuildItem({ data, onClickItem }) {
  const { t } = useTranslation();

    const formatContent = (html) => {
        html = html.replace(/<!--[\s\S]*?-->/g, '');
        html = html.replace(/<[^>]*>/g, '');
        return html;
    };

  return (
    <Item onClick={() => onClickItem(data.id)}>
      <ImageBox>
        <img src={data.logo || DefaultLogo} alt="" />
      </ImageBox>
      <RightBox className="_right">
        <div>
          <Title>{data.name}</Title>
          <DescBox>{formatContent(data.desc)}</DescBox>
        </div>
        <div>
          <LookButton>{t("Buttons.Check")}</LookButton>
        </div>
      </RightBox>
    </Item>
  );
}

export const ProjectOrGuildItemSkeleton = () => {
  return (
    <Item>
      <RectangularSkeleton width="62px" height="62px" radius="15px" />
      <RightBox>
        <div>
          <RectangularSkeleton width="100px" height="22px" />
          <RectangularSkeleton width="200px" height="34px" style={{ marginTop: "6px" }} />
        </div>
      </RightBox>
    </Item>
  );
};

const Item = styled.div`
  display: flex;
  gap: 10px;
  align-items: start;
  background-color: #fff;
`;

const RightBox = styled.div`
  height: 70px;
  flex: 1;
  display: flex;
  border-bottom: 1px solid var(--border-color-1);
  gap: 24px;
  justify-content: space-between;
`;

const DescBox = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 12px;
  font-weight: 400;
  color: var(--font-light-color);
  line-height: 18px;
  margin-top: 3px;
  word-break: break-all;
`;

const Title = styled.div`
  font-size: 16px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  color: var(--font-color);
    word-break: break-all;
    line-height: 1.5em;

    overflow:hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp:2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
`;

const LookButton = styled.span`
  display: inline-block;
  min-width: 72px;
  line-height: 29px;
  background-color: var(--background-color);
  font-size: 13px;
  color: var(--primary-color);
  font-family: Poppins-SemiBold, Poppins;
  border-radius: 22px;
  cursor: pointer;
  text-align: center;
  margin-top: 18px;
`;

const ImageBox = styled.div`
  border-radius: 15px;
  overflow: hidden;
    flex-shrink: 0;
  width: 62px;
  height: 62px;
  img {
    width: 100%;
    height: 100%;
  }
`;
