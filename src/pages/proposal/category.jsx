import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "components/layout/layout";
import ProposalCard from "components/poposal/proposalCard";
import { getProposalsBySubCategory } from "api/proposal";
import { PROPOSAL_CATEGORIES } from "utils/constant";
import InfiniteScroll from "react-infinite-scroll-component";
import store from "store";
import { saveLoading } from "store/reducer";

export default function ProposalCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [proposals, setProposals] = useState([]);
  const [orderType, setOrderType] = useState("new");
  const [hasMore, setHasMore] = useState(false);

  const getProposals = async () => {
    const _id = Number(id);
    if (!_id) {
      return;
    }
    store.dispatch(saveLoading(true));
    try {
      const res = await getProposalsBySubCategory({
        page,
        per_page: pageSize,
        category_index_id: _id,
        sort: orderType,
      });
      console.log("res:", res);
      setProposals([...proposals, ...res.data.threads]);
      setHasMore(res.data.threads.length >= pageSize);
      setPage(page + 1);
    } catch (error) {
      console.error(error);
    } finally {
      store.dispatch(saveLoading(false));
    }
  };

  const category = useMemo(() => {
    return PROPOSAL_CATEGORIES[0].children.find((item) => item.category_id === Number(id));
  }, [id]);

  useEffect(() => {
    if (!category) {
      navigate("/proposal");
    }
    id && getProposals();
  }, [category, id, orderType]);
  return (
    <Layout title={category?.name} noTab={true}>
      <InfiniteScroll
        dataLength={proposals.length}
        next={getProposals}
        hasMore={hasMore}
        loader={<></>}
        height={400}
        style={{ height: "calc(100vh - 50px)" }}
      >
        <ProposalBox>
          {proposals.map((p) => (
            <ProposalCard key={p.id} data={p} />
          ))}
        </ProposalBox>
      </InfiniteScroll>
    </Layout>
  );
}

const ProposalBox = styled.div`
  padding: 15px;
  & > div {
    //margin-inline: 20px;
    /* margin: 20px; */
  }
`;
