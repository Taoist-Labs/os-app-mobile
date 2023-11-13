import styled from "styled-components";
import ExploreSection from "components/exploreSection";
import { useTranslation } from "react-i18next";
import ProjectOrGuildItem, { ProjectOrGuildItemSkeleton } from "components/projectOrGuild/projectOrGuildItem";
import { useEffect, useState } from "react";
import { getMyProjects, getProjects } from "api/project";

export default function ExploreProjectSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    const getList = async () => {
      setLoading(true);
      try {
        const res = await getProjects({ page: 1, size: 3 });
        setList(res.data.rows);
        setLoading(false);
      } catch (error) {
        //  TODO toast
        console.error(error);
      }
    };
    getList();
  }, []);
  return (
    <ExploreSection title={t("Explore.ProjectTitle")} desc={t("Explore.ProjectDescription")} moreLink="/projects">
      <List>
        {loading ? (
          <>
            <ProjectOrGuildItemSkeleton />
            <ProjectOrGuildItemSkeleton />
            <ProjectOrGuildItemSkeleton />
          </>
        ) : (
          list.map((item) => <ProjectOrGuildItem data={item} key={item.id} />)
        )}
      </List>
    </ExploreSection>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;
