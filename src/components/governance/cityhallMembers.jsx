import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { getCityHallDetail } from "api/cityhall";
import { getUsers } from "api/user";
import publicJs from "utils/publicJs";
import useQuerySNS from "hooks/useQuerySNS";
import { useSelector } from "react-redux";
import UserModal from "components/userModal";
import Avatar from "components/common/avatar";
import { formatAddress } from "utils/address";
import useCurrentSeason from "hooks/useCurrentSeason";

const MemberAvatar = ({ user, onSelect }) => {
  const reFormat = () =>{
    if(user?.sns?.toLowerCase() === user?.wallet?.toLowerCase()){
      return  publicJs.AddressToShow(user.wallet,10)
    }else{
      return user.sns;
    }
  }

  return (
    <MemberAvatarStyle line={1}>
      <AvatarBox onClick={onSelect}>
        <Avatar src={user.avatar|| user?.sp?.avatar} size="44px" />
      </AvatarBox>
      <div className="rhtBox">
        <div className="sns">{reFormat()}</div>
        <div className="name">{user.name || user?.sp?.nickname}</div>
      </div>

    </MemberAvatarStyle>
  );
};

const GroupItem = ({ name, members }) => {
  const [user, setUser] = useState();

  return (
    <GroupItemStyle>
      {user && <UserModal user={user} handleClose={() => setUser(undefined)} />}
      <GroupName>{name}</GroupName>
      <GroupMembers>
        {members.map((item, i) => (
          <MemberAvatar key={i} user={item} onSelect={() => setUser(item)} />
        ))}
      </GroupMembers>
    </GroupItemStyle>
  );
};

export default function CityhallMembers() {
  const { t } = useTranslation();
  const currentSeason = useCurrentSeason();

  const [cityhallMembers, setCityhallMembers] = useState({});
  const [userMap, setUserMap] = useState({});
  const snsMap = useSelector((state) => state.snsMap);

  const { getMultiSNS } = useQuerySNS();

  const handleMembers = (members) => {
    return members.map((w) => {
      const user = userMap[w.toLowerCase()];

      if (user) {
        return {
          ...user,
          sns: snsMap[w.toLowerCase()] || formatAddress(w, 10),
        };
      } else {
        return { sns: formatAddress(w, 10) };
      }
    });
  };

  const [govMembers, brandMembers, techMembers] = useMemo(() => {
    return [
      handleMembers(cityhallMembers.G_GOVERNANCE || []),
      handleMembers(cityhallMembers.G_BRANDING || []),
      handleMembers(cityhallMembers.G_TECH || []),
    ];
  }, [cityhallMembers, userMap, snsMap]);

  console.log(techMembers);

  const getUsersInfo = async (wallets) => {
    try {
      const res = await getUsers(wallets);
      const userData = {};
      res.data?.forEach((r) => {
        userData[(r.wallet || "").toLowerCase()] = r;
      });
      setUserMap(userData);
    } catch (error) {
      logError("getUsersInfo error:", error);
    }
  };

  useEffect(() => {
    const getCityhallMembers = async () => {
      try {
        const res = await getCityHallDetail();
        setCityhallMembers(res.data.grouped_sponsors);

        const _wallets = [];
        Object.keys(res.data.grouped_sponsors).forEach((key) => {
          _wallets.push(...res.data.grouped_sponsors[key]);
        });
        const wallets = Array.from(new Set(_wallets));
        getUsersInfo(wallets);
        getMultiSNS(wallets);
      } catch (error) {
        logError(error);
      }
    };
    getCityhallMembers();
  }, []);
  return (
    <>
      <CityhallTitle>{t("Governance.Cityhall", { season: currentSeason })}</CityhallTitle>
      <GroupItem name={t("Governance.CityhallGovernance")} members={govMembers} />
      <GroupItem name={t("Governance.CityhallBranding")} members={brandMembers} />
      <GroupItem name={t("Governance.CityhallTech")} members={techMembers} />
    </>
  );
}

const CityhallTitle = styled.div`
  font-size: 20px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  line-height: 22px;
`;

const GroupItemStyle = styled.div`
  margin-top: 16px;
`;

const GroupName = styled.div`
  font-size: 13px;
  font-family: Poppins-Regular, Poppins;
  font-weight: 400;
  color: var(--font-light-color);
  line-height: 17px;
  margin-bottom: 10px;
`;

const GroupMembers = styled.div`
  min-height: 100px;
  background: #ffffff;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  display: flex;
  box-sizing: border-box;
  padding:20px;
  flex-direction: column;

`;

const MemberAvatarStyle = styled.div`
  display: flex;
  
  font-size: 12px;
  align-items: flex-start;
  margin-top: 20px;
  &:first-child{
    margin-top: 0;
  }
.rhtBox{
  flex-grow: 1;
}
  .sns {
    margin-top: 8px;
    line-height: 21px;
    color: var(--font-color-1);
    box-sizing: border-box;
    padding: 0 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
  }
  .name {
    width: 100%;
    box-sizing: border-box;
    color: #9a9a9a;
    padding: 0 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AvatarBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
  }
`;
