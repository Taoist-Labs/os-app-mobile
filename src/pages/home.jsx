import Layout from "components/layout/layout";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import Adv from "../components/home/Adv";
import HomeCalendar from "../components/home/HomeCalendar";
import AppList from "../components/home/appList";
import Event from "../components/home/event";
import Pub from "../components/home/pub";

const BoxInner = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-sizing: border-box;
  background: var(--background-color);
`;

export default function Home() {
  const { t } = useTranslation();

  return (
    <Layout sticky title={t("Menus.Square")} bgColor="var(--background-color)">
      <BoxInner>
        <Adv />
        <HomeCalendar />
        <AppList />
        <Event />
        <Pub />
      </BoxInner>
    </Layout>
  );
}
