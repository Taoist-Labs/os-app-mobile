import styled from "styled-components";
import Layout from "components/layout/layout";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatTime } from "utils/time";
import ProposalStateTag from "components/proposalCom/stateTag";
import CategoryTag from "components/proposalCom/categoryTag";
import TemplateTag from "components/proposalCom/templateTag";
import Avatar from "components/common/avatar";
import store from "store";
import { saveLoading } from "store/reducer";
import {getProposalDetail, getComponents, checkCanVote} from "api/proposalV2";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import publicJs from "utils/publicJs";
import useQuerySNS from "hooks/useQuerySNS";
import { PreviewMobie } from "@taoist-labs/components";
import { MdPreview } from "md-editor-rt";
import ProposalVote, { getPollStatus, VoteType } from "components/proposalCom/vote";
import { ProposalState } from "constant/proposal";
import ThreadTabbar from "components/proposalCom/threadTabbar";
import LinkImg from "assets/Imgs/proposal/link.png";
import useMetaforoLogin from "hooks/useMetaforoLogin";
import { useSelector } from "react-redux";
import useProposalCategories from "hooks/useProposalCategories";
import { formatDeltaDate } from "utils/time";
import { getProposalSIPSlug } from "utils";
import { Link } from "react-router-dom";
import getConfig from "../../constant/envCofnig";
import useToast from "../../hooks/useToast";

export default function ProposalThread() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const metaforoToken = useSelector((state) => state.metaforoToken);
  const proposalCategories = useProposalCategories();
  const userToken = useSelector((state) => state.userToken);

  const { t, i18n } = useTranslation();
  const [data, setData] = useState();
  const [applicantAvatar, setApplicantAvatar] = useState();
  const [applicant, setApplicant] = useState("");

  const [applicantSNS, setApplicantSNS] = useState("");

  const [components, setComponents] = useState([]);
  const [commentsArray, setCommentsArray] = useState([]);
  const [currentCommentArrayIdx, setCurrentCommentArrayIdx] = useState(0);
  const [dataSource, setDatasource] = useState();

  const [componentName, setComponentName] = useState("");
  const [beforeList, setBeforeList] = useState([]);
  const [preview, setPreview] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [errorTips,setErrorTips] = useState("");
  const [contentBlocks, setContentBlocks] = useState([]);
  const { Toast, toast } = useToast();
  const { getMultiSNS } = useQuerySNS();
  const { checkMetaforoLogin, LoginMetafoModal } = useMetaforoLogin();

  const [hasPermission, setHasPermission] = useState(false);

  const getProposal = async (refreshIdx) => {
    store.dispatch(saveLoading(true));

    try {
      let res;
      if (refreshIdx !== void 0) {
        // refresh the pointed group array
        let start_post_id;
        if (refreshIdx === 0) {
          start_post_id = undefined;
        } else {
          const _arr = commentsArray[refreshIdx - 1];
          start_post_id = _arr[_arr.length - 1].metaforo_post_id;
        }
        res = await getProposalDetail(Number(id), start_post_id);
      } else {
        const _arr = commentsArray[currentCommentArrayIdx];
        res = await getProposalDetail(Number(id), _arr ? _arr[_arr.length - 1]?.metaforo_post_id : undefined);
      }
      setData(res.data);

      const arr = res.data.content_blocks;
      const componentsIndex = arr.findIndex((i) => i.type === "components");

      const beforeComponents = arr.filter(
        (item) => item.type !== "components" && item.type !== "preview" && arr.indexOf(item) < componentsIndex,
      );
      let componentsList = arr.filter((item) => item.type === "components") || [];
      const afterComponents = arr.filter(
        (item) => item.type !== "components" && item.type !== "preview" && arr.indexOf(item) > componentsIndex,
      );

      const preview = arr.filter((i) => i.type === "preview");

      if (preview.length) {
        const preArr = JSON.parse(preview[0].content);
        setPreview(preArr);
        setPreviewTitle(preview[0].title);
      }

      setComponentName(componentsList[0]?.title);
      setBeforeList(beforeComponents ?? []);

      setContentBlocks(afterComponents);

      // setContentBlocks(res.data.content_blocks);
      const comStr = res.data.components || [];
      comStr.map((item) => {
        if (typeof item.data === "string") {
          item.data = JSON.parse(item.data);
        }
        return item;
      });
      setDatasource(comStr ?? []);
      // comment

      if (refreshIdx !== void 0) {
        const _new_arr = [...commentsArray];
        _new_arr[currentCommentArrayIdx] = res.data.comments?.map((c) => ({
          ...c,
          bindIdx: currentCommentArrayIdx,
          children: c.children?.map((c) => ({ ...c, bindIdx: currentCommentArrayIdx })),
        }));
        setCommentsArray(_new_arr);
      } else if (res.data.comments?.length) {
        const new_idx = commentsArray.length;
        setCurrentCommentArrayIdx(new_idx);

        const new_arr = [
          ...commentsArray,
          res.data.comments?.map((c) => ({
            ...c,
            bindIdx: new_idx,
            children: c.children?.map((c) => ({ ...c, bindIdx: currentCommentArrayIdx })),
          })) || [],
        ];
        setCommentsArray(new_arr);
        // check if has more
        const all_comments = new_arr.length ? new_arr.reduce((a, b) => [...a, ...b], []) : [];
        let now_count = all_comments.length;
        all_comments.forEach((item) => (now_count += item.children?.length || 0));
        getMultiSNS(Array.from(new Set(all_comments.map((item) => item.wallet))));
      }

      const applicant = res.data.applicant;
      setApplicantSNS(publicJs.AddressToShow(applicant));
      setApplicant(applicant);
      setApplicantAvatar(res.data.applicant_avatar);
      if (applicant) {
        try {
          const snsMap = await getMultiSNS([applicant]);
          const name = snsMap[applicant.toLocaleLowerCase()] || applicant;
          setApplicantSNS(name?.endsWith(".seedao") ? name : publicJs.AddressToShow(name, 4));
        } catch (error) {}
      }
    } catch (error) {
      logError("get proposal detail error:", error);
      toast.danger(`${error?.data?.code || error?.response?.data?.code}:${error.response?.data?.msg||error?.data?.msg || error?.code || error}`);
      setErrorTips(error.response?.data?.msg|| error?.data?.msg || error?.code || error)
      //   showToast(error?.data?.msg || error?.code || error, ToastType.Danger, { autoClose: false });
    } finally {
      store.dispatch(saveLoading(false));
    }
  };

  useEffect(() => {
    if (state) {
      setData(state);
    }
    getProposal();
    getComponentsList();
  }, [id, state, metaforoToken]);

  const getComponentsList = async () => {
    // NOTE: getProposalDetail may use more time, so not show loading here
    // dispatch({ type: AppActionType.SET_LOADING, payload: true });
    try {
      const resp = await getComponents();
      let components = resp.data;

      components?.map((item) => {
        if (typeof item.schema === "string") {
          item.schema = JSON.parse(item.schema);
        }
        return item;
      });

      setComponents(resp.data);
    } catch (error) {
      logError("getAllProposals failed", error);
    } finally {
      store.dispatch(saveLoading(false));
    }
  };

  const showVote = () => {
    if (!data?.votes?.[0]) {
      return false;
    }
    if (
      [ProposalState.Rejected, ProposalState.Withdrawn, ProposalState.PendingSubmit, ProposalState.Draft].includes(
        data?.state,
      ) &&
      data.vote_type !== 99 &&
      data.vote_type !== 98
    ) {
      return false;
    }
    return true;
  };

  const getCurrentCategory = () => {
    if (data?.category_name) {
      return data.category_name;
    } else {
      if (data?.proposal_category_id) {
        const findOne = proposalCategories.find((c) => c.id === data.proposal_category_id);
        if (findOne) {
          return findOne.name;
        }
      }
      return "";
    }
  };
  const getTimeTagDisplay = () => {
    if (data?.state === ProposalState.Draft) {
      if (!data?.publicity_ts) {
        return null;
      }
      return (
        <TimeTag>
          {t("Proposal.DraftEndAt", {
            leftTime: t("Proposal.TimeDisplay", {
              ...formatDeltaDate(new Date(data?.publicity_ts * 1000).getTime()),
            }),
          })}
        </TimeTag>
      );
    }
    if (data?.state === ProposalState.PendingExecution) {
      if (data?.execution_ts && data?.execution_ts * 1000 > Date.now()) {
        return (
          <TimeTag>
            {t("Proposal.AutoExecuteLeftTime", {
              ...formatDeltaDate((data?.execution_ts || 0) * 1000),
            })}
          </TimeTag>
        );
      }
    }
    const poll = data?.votes?.[0];
    if (!poll) {
      return;
    }
    if (data?.state === ProposalState.Voting) {
      const pollStatus = getPollStatus(poll.poll_start_at, poll.close_at);
      if (pollStatus === VoteType.Open) {
        return (
          <TimeTag>
            {t("Proposal.VoteEndAt", {
              leftTime: t("Proposal.TimeDisplay", { ...formatDeltaDate(new Date(poll.close_at).getTime()) }),
            })}
          </TimeTag>
        );
      }
    }
  };
  const currentCategory = getCurrentCategory();


  const showVotedTag = (currentState) =>{
    if (!data?.votes?.[0]) {
      return false;
    }
    const votedItem = data?.votes?.[0].options.filter((item)=>item.is_vote);

    return ( !!userToken && !!votedItem?.length &&  currentState === "voting" && !!userToken) && hasPermission
  }

  const showVotedNot = (currentState) =>{
    if (!data?.votes?.[0]) {
      return false;
    }
    const votedItem = data?.votes?.[0].options.filter((item)=>item.is_vote);

    return ( !!userToken && !votedItem?.length &&  currentState === "voting" && !!userToken) && hasPermission
  }


  useEffect(() => {
    if(!id ||!showVote() )return;
    const getVotePermission = () => {
      checkCanVote(Number(id)).then((r) => {
        setHasPermission(r.data);
      });
    };
    getVotePermission()
  }, [id,data]);

  // useEffect(() => {
  //   checkMetaforoLogin();
  // }, []);

  return (
    <Layout
      title={t("Proposal.ProposalDetail")}
      headStyle={{ style: { borderBottom: "1px solid var(--border-color-1)" } }}
      customTab={

          !!errorTips ?<div>&nbsp;</div>: <ThreadTabbar
              id={id}
              showVote={showVote()}
              openComment={() => navigate(`/proposal/thread/${id}/comments`)}
              openHistory={() => navigate(`/proposal/thread/${id}/history`, { state: data.histories?.lists ?? [] })}
          />


      }
      headerProps={{ backPath: "/proposal" }}
    >
      <ThreadHead>
        <div className="title">
          {getProposalSIPSlug(data?.sip)}
          {data?.title}{" "}
          {data?.arweave && (
            <a
              href={`https://arweave.net/tx/${data?.arweave}/data.html`}
              target="_blank"
              rel="noreferrer"
              className="linkStyle"
            >
              <img src={LinkImg} alt="" />
            </a>
          )}
        </div>
        <FlexLine>
          {showVotedTag(data?.state) &&  <VotedBox>{t('Proposal.HasVote')}</VotedBox>}
          {showVotedNot(data?.state) &&  <VotedBox2>{t('Proposal.notVote')}</VotedBox2>}
          {data?.state && <ProposalStateTag state={data.state} />}
          {currentCategory && <CategoryTag>{currentCategory}</CategoryTag>}
          {data?.template_name && <TemplateTag>{data?.template_name}</TemplateTag>}
        </FlexLine>
        {getTimeTagDisplay()}
        <InfoBox>
          <UserBox>
            <Avatar src={applicantAvatar} size="30px" />
            <div>
              <span className="name">{applicantSNS}</span>
              {data?.create_ts && <div className="date">{formatTime(data.create_ts * 1000)}</div>}
            </div>
          </UserBox>
        </InfoBox>
      </ThreadHead>
      {data?.is_rejected && data?.reject_reason && data?.reject_ts && (
        <RejectOuter>
          <RejectBlock>
            <RejectLine>
              <span className="rejectTit">{t("Proposal.CityhallRejected")}</span>
              <span className="time">{formatTime(data.reject_ts * 1000)}</span>
            </RejectLine>
            <div className="desc">{data.reject_reason}</div>
          </RejectBlock>
          <div className="line" />
        </RejectOuter>
      )}
      <ContentOuter>
        {!!errorTips &&<ErrorBox>{errorTips}</ErrorBox>
        }
        {!!preview?.length && (
          <>
            <ComponnentBox>
              <div className="title">{previewTitle}</div>
            </ComponnentBox>
            <PreviewMobie
                rpc={getConfig().NETWORK.rpcs[0]}
              DataSource={JSON.parse(JSON.stringify(preview || []))}
              language={i18n.language}
              initialItems={components}
            />
          </>
        )}

        {!!beforeList?.length &&
          beforeList.map((block, i) => (
            <ProposalContentBlock key={block.title} $radius={i === 0 && !dataSource?.length ? "4px 4px 0 0" : "0"}>
              <div className="title">{block.title}</div>
              <div className="content">
                <MdPreview modelValue={block.content || ""} />
              </div>
            </ProposalContentBlock>
          ))}

        {!!dataSource?.length && (
          <ComponnentBox>
            <div className="title">{componentName || t("Proposal.proposalComponents")}</div>
          </ComponnentBox>
        )}
        {componentName === '激励申请表' && <ViewMore>
          <div>{t('Project.budgetUtil')}</div>
          <div>
            <Link to={`/proposal/thread/${data?.id}/budget`}> {t('Project.ClickToView')}</Link></div>
        </ViewMore>
        }
        <PreviewMobie
          DataSource={dataSource}
          language={i18n.language.indexOf("zh") > -1 ? "zh" : "en"}
          initialItems={components}
        />

        {!!contentBlocks?.length &&
          contentBlocks.map((block, i) => (
            <ProposalContentBlock key={block.title} $radius={i === 0 && !dataSource?.length ? "4px 4px 0 0" : "0"}>
              <div className="title">{block.title}</div>
              <div className="content">
                <MdPreview modelValue={block.content || ""} />
              </div>
            </ProposalContentBlock>
          ))}
      </ContentOuter>
      {showVote() && (
        <ProposalVote
          voteGate={data?.vote_gate}
          poll={data.votes[0]}
          id={Number(id)}
          hasPermission={hasPermission}
          updateStatus={getProposal}
          showMultiple={data.is_multiple_vote}
          proposalState={data?.state}
          execution_ts={data?.execution_ts}
          voteOptionType={data?.vote_type}
        />
      )}
      {LoginMetafoModal}
      {Toast}
    </Layout>
  );
}


const ViewMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin:10px 15px;
  background: #f5f5f5;
  padding: 10px 5px;
  border-radius: 4px;
  a{
    color: var(--primary-color);
  }
`

const ErrorBox = styled.div`
padding: 30px;
color: #dc3545;
text-align: center;
font-size: 20px;
font-weight: bold;
`

const RejectBlock = styled.div`
  border-radius: 8px;
  background: rgba(251, 78, 78, 0.1);
  padding: 8px 16px;
  margin-bottom: 16px;
  .desc {
    color: var(--bs-body-color_active);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
`;

const RejectOuter = styled.div`
  margin: 0 16px 16px;
  .line {
    width: 100%;
    height: 1px;
    background: var(--border-color-1);
  }
`;

const RejectLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  .rejectTit {
    color: #fb4e4e;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }
  .time {
    color: #bbb;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
  }
`;

const ThreadHead = styled.div`
  padding: 16px;
  .title {
    font-size: 16px;
    font-family: "Poppins-Bold";
    color: var(--bs-body-color_active);
    line-height: 30px;
  }
  .linkStyle {
    width: 16px;
    height: 16px;
    img {
      width: 16px;
      height: 16px;
      margin-bottom: -3px;
    }
  }
`;

const FlexLine = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  gap: 6px;
  flex-wrap: wrap;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const UserBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    object-position: center;
  }

  .name {
    font-size: 12px;
    font-weight: 600;
    line-height: 22px;
    color: var(--bs-body-color_active);
    cursor: default;
  }
  .date {
    color: #bbb;
    font-size: 12px;
  }
`;

const ContentOuter = styled.div``;

const ProposalContentBlock = styled.div`
  margin-bottom: 16px;
  padding: 0 16px;
  .title {
    background: rgba(82, 0, 255, 0.08);
    line-height: 40px;
    border-radius: 4px;
    color: var(--bs-body-color_active);
    padding-inline: 8px;
    font-size: 16px;
    font-family: "Poppins-SemiBold";
  }
  .content .md-editor-preview-wrapper {
    padding-inline: 12px;
    font-size: 14px;
  }
`;

const ComponnentBox = styled(ProposalContentBlock)`
  margin-bottom: 10px;
`;

const StatusTag = styled.div`
  background-color: #fb4e4e;
  border: 1px solid;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  box-sizing: border-box;
`;

const TimeTag = styled.div`
  color: var(--primary-color);
  font-size: 12px;
  margin-bottom: 4px;
`;

const VotedBox = styled.div`
    display: inline-block;
    border-radius: 4px;
    border: 1px solid #08D0EA30;
    color: #08b0c5;
    font-size: 12px;
    background: #08D0EA30;
    padding: 0 5px;
    text-align: center;
    height: 18px;
`

const VotedBox2 = styled(VotedBox)`
    border: 1px solid rgba(255, 81, 209,0.2);
    color: rgba(255, 81, 209,1);
    background: rgba(255, 81, 209,0.2);

`

