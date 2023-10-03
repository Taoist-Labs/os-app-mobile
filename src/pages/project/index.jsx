import styled from "styled-components";
import Layout from "components/layout/layout";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { getMyProjects, getProjects } from "api/project";
import { useNavigate } from "react-router-dom";
import Tab from "components/common/tab";
import InfiniteScroll from "react-infinite-scroll-component";
import ProjectOrGuildItem from "components/projectOrGuild/projectOrGuildItem";
import store from "store";
import { saveLoading } from "store/reducer";

export default function Project() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [proList, setProList] = useState([]);
  const [pageCur, setPageCur] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(1);

  useEffect(() => {
    const _list = [
      {
        label: t("Project.AllProjects"),
        value: 0,
      },
      {
        label: t("Project.Closed"),
        value: 1,
      },
      {
        label: t("Project.Joined"),
        id: 2,
      },
    ];
    setList(_list);
  }, [t]);

  const handleTabChange = (v) => {
    setActiveTab(v);
    setPageCur(1);
    setTotal(0);
    setProList([]);
  };

  const hasMore = useMemo(() => {
    return proList.length < total;
  }, [total, proList]);

  const getList = async () => {
    if (activeTab > 2) return;
    const stt = activeTab === 1 ? "closed" : "";
    store.dispatch(saveLoading(true));
    const obj = {
      status: stt,
      page: pageCur,
      size: pageSize,
      sort_order: "desc",
      sort_field: "created_at",
    };
    const rt = await getProjects(obj);
    store.dispatch(saveLoading(false));
    const { rows, page, size, total } = rt.data;
    setProList([...proList, ...rows]);
    setPageSize(size);
    setTotal(total);
    setPageCur(page);
  };

  const getMyList = async () => {
    store.dispatch(saveLoading(true));
    const obj = {
      page: pageCur,
      size: pageSize,
      sort_order: "desc",
      sort_field: "created_at",
    };
    const rt = await getMyProjects(obj);
    store.dispatch(saveLoading(false));

    const { rows, page, size, total } = rt.data;
    setProList([...proList, ...rows]);
    setPageSize(size);
    setTotal(total);
    setPageCur(page);
  };

  const openDetail = (id) => {
    navigate(`/project/info/${id}`);
  };

  const getCurrentList = () => {
    if (activeTab < 2) {
      getList();
    } else {
      getMyList();
    }
  };

  useEffect(() => {
    getCurrentList();
  }, [activeTab]);

  return (
    <Layout title={t("menus.Project")} noTab>
      <Tab data={list} value={activeTab} onChangeTab={handleTabChange} />
      <InfiniteScroll
        dataLength={proList.length}
        next={getCurrentList}
        hasMore={hasMore}
        loader={<></>}
        style={{ height: "calc(100vh - 90px)" }}
      >
        <ProjectList>
          {proList.map((item) => (
            <ProjectOrGuildItem key={item.id} data={item} onClickItem={openDetail} />
          ))}
        </ProjectList>
      </InfiniteScroll>
    </Layout>
  );
}

const ProjectList = styled.div`
  & > div {
    margin-bottom: 15px;
  }
`;
