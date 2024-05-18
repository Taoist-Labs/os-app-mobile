import SipTag from "../sipTag";
import ProjectMember from "../../pages/project/info/member";
import { MdPreview } from "md-editor-rt";
import React, { useEffect, useState } from "react";
import store from "../../store";
import { saveLoading } from "../../store/reducer";
import { getProjectById } from "../../api/project";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import DefaultLogo from "assets/Imgs/defaultLogo.png";
import LinkImg from "assets/Imgs/linkHome.svg";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import { formatCategory } from "components/proposalCom/categoryTag";

const FlexBox = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 0;
  margin: 0 20px;
  border-top: 1px solid rgba(217, 217, 217, 0.5);
  border-bottom: 1px solid rgba(217, 217, 217, 0.5);
`;

const ImgBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    object-position: center;
    border-radius: 15px;
  }
`;
const TitleBox = styled.div`
  font-size: 16px;
  font-family: "Poppins-SemiBold";
  font-weight: 600;
  line-height: 24px;
  flex-grow: 1;
`;

const ProposalsBox = styled.div`
  display: flex;
  margin-inline: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(217, 217, 217, 0.5);
`;

const DescBox = styled.div`
  padding: 15px 0 10px;
  margin: 0 20px 20px;
  color: #9a9a9a;
  font-size: 14px;
  border-bottom: 1px solid rgba(217, 217, 217, 0.5);

  .quill {
    width: 100%;
  }
  .ql-container {
    width: 100% !important;
    border: 0;
  }
  p {
    padding: 0;
  }
  .ql-editor {
    width: 100%;
    padding: 0;
  }
  .title{
    color: rgba(41, 40, 47, 0.80);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 10px;
  }
`;

const ContentBlock = styled.div`
  border-top: 1px solid rgba(217, 217, 217, 0.5);
  padding-top: 20px;
  margin: 0 20px 20px;
`;

const TitleAll = styled.div`
  font-size: 20px;
  font-family: Poppins-SemiBold;
  font-weight: 600;
  padding-bottom: 15px;
`;

const MBox = styled.div`
  padding: 20px 20px 0;
`;

const StatusBox = styled.div`
  font-size: 12px;
  color: #fff;
  background: var(--primary-color);
  padding: 4px 12px;
  border-radius: 4px;

  &.pending_close {
    background: #f9b617;
  }
  &.close {
    background: rgb(163, 160, 160);
  }
  &.close-failed {
    background: rgb(255, 51, 51);
  }
`;

const SipTagStyle = styled.a`
  display: inline-block;
  border-radius: 5px;
  border: 1px solid #0085ff;
  font-size: 12px;
  padding: 2px 12px;

  color: #0085ff;
  &:hover {
    color: #0085ff;
  }
`;

const FlexFirst = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  flex-wrap: wrap;
`;

const CategoryTag = styled.div`
  display: inline-block;
  border-radius: 4px;
  border: 1px solid var(--proposal-tag-border);
  color: var(--bs-body-color_active);
  font-size: 12px;
  background: var(--line-home);
  padding: 2px 16px;
  text-align: center;
`;

const FlexLine = styled.div`
  padding-left: 15px;
`;

const BorderBox = styled.div`
  border: 1px solid var(--border-color-1);
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  margin-bottom: 20px;
`;
const MemberBox = styled.dl`
  width: 50%;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &:first-child {
    border-right: 1px solid var(--border-color-1);
  }
  dt {
    font-size: 12px;
    opacity: 0.8;
  }
  .dd {
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    line-height: 40px;
  }
`;
const BtmBox = styled.div`
  border: 1px solid var(--border-color-1);
  padding: 20px;
  border-radius: 8px;
`;
const MainBox = styled.div`
  padding: 0 20px;
`;

const Abox = styled.div`
  font-size: 12px;
  color: var(--primary-color);
  margin-bottom: 10px;
`;
const FlexBtnBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const BtnBox = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 2px 12px;
  border-radius: 4px;
  gap: 6px;
  img {
    width: 14px;
  }
`;

const DlBox = styled.div`
  margin-top: 40px;
  dl {
    margin-bottom: 20px;
  }
  dt {
    margin-bottom: 10px;
    font-size: 12px;
    opacity: 0.6;
  }
  dd {
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .quill {
    width: 100%;
  }
  .ql-container {
    width: 100% !important;
    border: 0;
  }
  p {
    padding: 0;
  }
  .ql-editor {
    width: 100%;
    padding: 0;
  }
`;
const FlexBoxBg = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LineBox = styled.div`
  margin: 0 20px;
  padding-bottom: 20px;
  
  .title{
    color: rgba(41, 40, 47, 0.80);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 10px;
  }
  .content,.contentBtm{
    border-bottom: 1px solid rgba(217, 217, 217, 0.5);
    &>dl{
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 10px;
      &>dt{
        color: rgba(156, 164, 171, 0.80);

        font-style: normal;
        font-weight: 400;
        line-height: 20px;
      }
    }
    .colLine{
      flex-direction: column;
      align-items: flex-start;
      &>dt{
        padding-bottom: 10px;
      }
    }
  }
  a{
    color: var(--primary-color);
  }
  .contentBtm{
    border-bottom: 0;
    font-size: 14px;
    color: rgba(156, 164, 171, 0.80);
  }
  .intro{
    width: 100%;
  }

`

export default function ProjectInner({ id }) {
  const { t } = useTranslation();
  const [data, setData] = useState();

  useEffect(() => {
    const getProjectData = async () => {
      store.dispatch(saveLoading(true));
      try {
        const data = await getProjectById(id);
        setData(data.data);
      } catch (error) {
        logError(error);
      } finally {
        store.dispatch(saveLoading(false));
      }
    };
    if (id) {
      getProjectData();
      // dispatch({ type: PROJECT_ACTIONS.SET_ID, payload: Number(id) });
    }
  }, [id]);

  const showStatusComponent = () => {
    if (data?.status === "closed") {
      return <StatusBox className="close">{t("Project.Closed")}</StatusBox>;
    }
    if (data?.status === "open") {
      return <StatusBox>{t("Project.Open")}</StatusBox>;
    }
    if (data?.status === "closing") {
      return <StatusBox >{t("Project.Closing")}</StatusBox>;
    }
    if (data?.status === "close_failed") {
      return <StatusBox className="close-failed">{t("Project.CloseFailed")}</StatusBox>;
    }
  };

  const formatBudget = (str) => {
    if (!str) return;
    let strJson = JSON.parse(str);

    let strArr = [];
    strJson.map((item) => {
      strArr.push({ ...item });
    });
    return strArr ?? [];
  };

  const formatDate = (date) => {
    if (date) {
      let time = Number(date);
      return dayjs(time).format(`YYYY-MM-DD`);
    } else {
      return "";
    }
  };

  return (
    <>
      <FlexBox>
        <ImgBlock>
          <img src={data?.logo || DefaultLogo} alt="" />
        </ImgBlock>
        <FlexLine>
          <TitleBox>{data?.name}</TitleBox>
          <FlexFirst>
            {data?.SIP && <SipTagStyle>SIP - {data?.SIP}</SipTagStyle>}
            {data?.Category && <CategoryTag>{formatCategory(data?.Category)}</CategoryTag>}
            {/*<StatusBox className={detail?.status}>{t(`Project.Edit`)}</StatusBox>*/}
            {showStatusComponent()}
          </FlexFirst>
        </FlexLine>
      </FlexBox>

      <DescBox>
        <div className="title">项目简介</div>
        <Desc>{data?.desc}</Desc>
      </DescBox>
      <LineBox>
        <div className="title">项目负责人</div>
        <div className="content">
          <ProjectMember data={data} />
        </div>
      </LineBox>

      <LineBox>
        <div className="title">立项信息</div>
        <ul className="content">
          <dl>
            <dt>立项提案链接</dt>
            <dd><a href="#">点击查看</a></dd>
          </dl>
          <dl>
            <dt>项目预算</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
          <dl>
            <dt>计划完成时限</dt>
            <dd>2024-08-07</dd>
          </dl>
          <dl className="colLine">
            <dt>交付物</dt>
            <dd className="intro">文档10-篇，公众号文章20篇，播客10篇，文档10-篇公众号文章20篇</dd>
          </dl>
        </ul>
      </LineBox>

      <LineBox>
        <div className="title">项目预算使用情况</div>
        <div className="content">
          <dl>
            <dt>项目预算</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
          <dl>
            <dt>预付比例</dt>
            <dd>50%</dd>
          </dl>
          <dl>
            <dt>可预支数额</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
          <dl>
            <dt>当前已预支</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
          <dl>
            <dt>预算余额</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
          <dl>
            <dt>可预支余额</dt>
            <dd>10000 SCR, 1000 USDT</dd>
          </dl>
        </div>
      </LineBox>
      <LineBox>
        <div className="title">结项信息</div>
        <div className="content">
          <dl>
            <dt>结项提案链接</dt>
            <dd><Link to="/project/budget/22">点击查看</Link></dd>
          </dl>
        </div>

      </LineBox>

      <LineBox>
        <div className="title">项目官方链接</div>
        <div className="contentBtm">项目暂无官方链接~</div>
      </LineBox>


      {/*<DescBox>{data?.desc}</DescBox>*/}

      <MainBox>
        {data?.OfficialLink && (
          <a href={data?.OfficialLink} target="_blank" rel="noreferrer">
            <Abox>{t("Project.viewMore")} &gt;&gt;</Abox>
          </a>
        )}


        <BtmBox>
          <FlexBtnBox>
            {data?.ApprovalLink && (
              <Link to={data?.ApprovalLink} target="_blank">
                <BtnBox>
                  <span>{t("Project.StartProjectLink")}</span> <img src={LinkImg} alt="" />
                </BtnBox>
              </Link>
            )}
            {data?.OverLink && (
              <Link to={data?.OverLink} target="_blank">
                <BtnBox>
                  <span>{t("Project.EndProjectLink")}</span> <img src={LinkImg} alt="" />
                </BtnBox>
              </Link>
            )}
          </FlexBtnBox>
          <DlBox>
            <dl>
              <dt>{t("Project.Budget")}</dt>
              <dd>
                {formatBudget(data?.Budgets)?.map((i, index) => (
                  <FlexBoxBg key={`budget_${index}`}>
                    <span>{i.name}</span>
                  </FlexBoxBg>
                ))}
              </dd>
            </dl>
            <dl>
              <dt>{t("Project.Deliverables")}</dt>
              {/*<dd>{data?.Deliverable}</dd>*/}
              <dd>
                <ReactQuill theme="snow" value={data?.Deliverable} modules={{ toolbar: false }} readOnly={true} />
              </dd>
            </dl>
            <dl>
              <dt>{t("Project.PlanFinishTime")}</dt>
              <dd>{formatDate(data?.PlanTime)}</dd>
            </dl>
          </DlBox>
        </BtmBox>
      </MainBox>

      {/*<ProposalsBox>*/}
      {/*    {data?.proposals?.map((item, index) => (*/}
      {/*        <SipTag key={`proposal_${index}`} slug={item} />*/}
      {/*    ))}*/}
      {/*</ProposalsBox>*/}

      {/*<MBox>*/}
      {/*    <TitleAll>{t("Project.Members")}</TitleAll>*/}

      {/*</MBox>*/}

      {/*<ContentBlock>*/}
      {/*    <TitleAll>{t("Project.Intro")}</TitleAll>*/}
      {/*    <MdPreview modelValue={data?.intro || ""} />*/}
      {/*</ContentBlock>*/}
    </>
  );
}

const Desc = styled.div`
  white-space: pre-wrap;
`;
