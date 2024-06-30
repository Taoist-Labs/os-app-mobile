import styled from "styled-components";
import { useTranslation } from "react-i18next";
import store from "store";
import { saveLoading } from "store/reducer";
import React, { useEffect, useMemo, useState } from "react";
import { getUsers } from "api/user";
import UserList from "components/userList";
import { useParseSNSList } from "hooks/useParseSNS";
import UserModal from "components/userModal";

export default function ProjectMember({data}) {
  const { t } = useTranslation();
  const [userMap, setUserMap] = useState({});
  const [members, setMembers] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [user, setUser] = useState();
  const [useArr, setUserArr] = useState([]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set([...members, ...sponsors]));
  }, [members, sponsors]);

  const nameMap = useParseSNSList(uniqueUsers);

  const getUsersInfo = async (wallets) => {
    if (!wallets.length) {
      return;
    }
    store.dispatch(saveLoading(true));

    try {
      const res = await getUsers(wallets);
      const userData = {};
      res.data.forEach((r) => {
        userData[r.wallet || ""] = r;
      });
      sponsors.map((item)=>{
        userData[item].title= t("Guild.Moderator");
      })

      setUserMap(userData);
    } catch (error) {
      logError("getUsersInfo error:", error);
    } finally {
      store.dispatch(saveLoading(false));
    }
  };
  // const { memberUsers, sponsorUsers } = useMemo(() => {
  //   return {
  //     memberUsers: members.map((m) => userMap[m]),
  //     sponsorUsers: sponsors.map((s) => userMap[s]),
  //   };
  // }, [userMap, members, sponsors]);

  useEffect(() => {
    if(!userMap)return;
    let arr =[];
    for (const key in userMap) {
      arr.push(userMap[key])
    }
    setUserArr(arr)

  }, [userMap]);

  useEffect(() => {
    getUsersInfo(Array.from(new Set([...members, ...sponsors])));
  }, [members,sponsors]);

  useEffect(() => {
    const members = data?.members || [];
    const sponsors = data?.sponsors || [];
    setMembers(members.map((m) => m.toLowerCase()));
    setSponsors(sponsors.map((m) => m.toLowerCase()));
  }, [data]);
  const showUser = (u) => {
    setUser(u);
  };



  return (

      <BorderBox>
        <MemberBox>
          {/*<dt>{t('Guild.Moderator')}</dt>*/}
          <dd>
            <MemberContent>
              {user && <UserModal user={{ ...user, sns: nameMap[user?.wallet] }} handleClose={() => setUser(undefined)} />}
              <UserList data={[...useArr]} nameMap={nameMap} onChooseUser={showUser} />
            </MemberContent>
          </dd>
        </MemberBox>
        <MemberBox>
          <dt>{t('Guild.Contact')}</dt>
          <dd className="dd"> {data?.ContantWay ? data?.ContantWay : (nameMap[sponsors[0]]?.endsWith('.seedao') ? nameMap[sponsors[0]] : "")}</dd>
        </MemberBox>
      </BorderBox>


  );
}

const MemberContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  &>div{
    justify-content: flex-start;
  }

`;

const BorderBox = styled.div`
`
const MemberBox = styled.dl`
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    dt{
      color: rgba(41, 40, 47, 0.80);
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      margin-top: 20px;
    }
    .dd{
        flex-grow: 1;
        align-items: center;
        justify-content: center;
        line-height: 40px;
      font-size: 12px;
    }
`
