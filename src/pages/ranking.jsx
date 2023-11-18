import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Layout from "components/layout/layout";
import { useTranslation } from "react-i18next";
import useQuerySNS from "hooks/useQuerySNS";
import { getGovernanceNodeResult } from "api/cityhall";
import store from "../store";
import { saveLoading } from "../store/reducer";
import { formatNumber } from "utils/number";
import publicJs from "utils/publicJs";
import SortDownSvg from "components/svgs/sortDown";
import SortUpSvg from "components/svgs/sortUp";

const RankDirection = {
  default: 0,
  down: 1,
  up: 2,
};

const SortIcons = ({ direction }) => {
  return (
    <SortButton>
      <SortUpSvg isSelected={direction === RankDirection.up} />
      <SortDownSvg isSelected={direction === RankDirection.down} />
    </SortButton>
  );
};
export default function RankingPage() {
  const { t } = useTranslation();

  const [allList, setAllList] = useState([]);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState(0);
  const [dataMap, setDataMap] = useState({});

  const { getMultiSNS } = useQuerySNS();

  const [rankCurrent, setRankCurrent] = useState(RankDirection.default);
  const [rankTotal, setRankTotal] = useState(RankDirection.down);

  const currentSeason = useMemo(() => {
    return `S${currentSeasonNumber}`;
  }, [currentSeasonNumber]);

  const displayList = useMemo(() => {
    const newList = [...allList];
    if (rankTotal !== RankDirection.default) {
      newList.sort((a, b) => {
        const a_total = Number(a.season_total_credit);
        const b_total = Number(b.season_total_credit);

        if (rankTotal === RankDirection.down) {
          return b_total - a_total;
        } else {
          return a_total - b_total;
        }
      });
    }
    if (rankCurrent !== RankDirection.default) {
      newList.sort((a, b) => {
        const a_current = a.seasons_credit.find((item) => item.season_name === currentSeason)?.total || 0;
        const b_current = b.seasons_credit.find((item) => item.season_name === currentSeason)?.total || 0;
        if (rankCurrent === RankDirection.down) {
          return Number(b_current) - Number(a_current);
        } else {
          return Number(a_current) - Number(b_current);
        }
      });
    }

    return newList;
  }, [allList, rankCurrent, rankTotal]);

  const formatSNS = (wallet) => {
    const sns = dataMap[wallet];
    return sns.endsWith(".seedao") ? sns : publicJs.AddressToShow(sns, 4);
  };
  useEffect(() => {
    const getList = () => {
      store.dispatch(saveLoading(true));
      getGovernanceNodeResult()
        .then((res) => {
          const data = res.data;
          setAllList(data.records);

          setCurrentSeasonNumber(Number(data.season_name.replace("S", "")));

          const _wallets = new Set();
          data.records.forEach((item) => {
            _wallets.add(item.wallet);
          });
          getMultiSNS(Array.from(_wallets)).then((_dataMap) => {
            setDataMap(_dataMap);
          });
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          store.dispatch(saveLoading(false));
        });
    };
    getList();
  }, []);

  const onClickCurrentRank = () => {
    if (rankCurrent === RankDirection.down) {
      setRankCurrent(RankDirection.up);
    } else {
      setRankCurrent(RankDirection.down);
    }
    setRankTotal(RankDirection.default);
  };

  const onClicktotalRank = () => {
    if (rankTotal === RankDirection.down) {
      setRankTotal(RankDirection.up);
    } else {
      setRankTotal(RankDirection.down);
    }
    setRankCurrent(RankDirection.default);
  };

  const getRankNum = (i) => {
    if (rankTotal === RankDirection.down || rankCurrent === RankDirection.down) {
      return i + 1;
    } else if (rankTotal === RankDirection.up || rankCurrent === RankDirection.up) {
      return displayList.length - i;
    }
  };

  return (
    <Layout title={t("Vault.ScrRanking")}>
      <SortBox>
        <SortCurrentSeason onClick={onClickCurrentRank}>
          <span>{currentSeason}</span>
          <SortIcons direction={rankCurrent} />
        </SortCurrentSeason>
        <SortTotalScr onClick={onClicktotalRank}>
          <span>{t("Vault.Total")}</span>
          <SortIcons direction={rankTotal} />
        </SortTotalScr>
      </SortBox>
      <ListBox>
        {displayList.map((item, idx) => (
          <li key={item.wallet}>
            <NumberBox>{getRankNum(idx)}</NumberBox>
            <ItemBox style={{ flex: 1 }}>{formatSNS(item.wallet)}</ItemBox>
            <ItemBox style={{ flex: 1 }}>
              <span>
                {formatNumber(Number(item.seasons_credit?.find((s) => s.season_name === currentSeason)?.total || 0))}
                {" SCR"}
              </span>
              <LightBox className="inline">{currentSeason}</LightBox>
            </ItemBox>
            <ItemBox style={{ flex: 1 }}>
              <span>
                {formatNumber(Number(item.season_total_credit) || 0)}
                {" SCR"}
              </span>
              <LightBox className="inline">{t("Vault.Total")}</LightBox>
            </ItemBox>
          </li>
        ))}
      </ListBox>
    </Layout>
  );
}

const ListBox = styled.ul`
  font-size: 12px;
  padding-inline: 20px;
  line-height: 44px;
  height: calc(var(--app-height) - 168px);
  box-sizing: border-box;
  overflow-y: auto;
  li {
    display: flex;
    border-bottom: 1px solid var(--border-color-1);
    &:last-child {
      border-bottom: none;
    }
  }
`;
const ItemBox = styled.div`
  flex: 1;
`;
const LightBox = styled.span`
  color: #9ca1b3;
  font-size: 10px;
  &.inline {
    margin-left: 3px;
  }
`;
const NumberBox = styled(LightBox)`
  flex: unset;
  width: 26px;
  text-align: center;
`;

const SortBox = styled.div`
  padding-inline: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  margin-bottom: 11px;
`;

const SortItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 55px;
  height: 24px;
  line-height: 24px;
  padding-inline: 6px;
  background: var(--background-color-2);
  border-radius: 4px;
  font-size: 12px;
`;

const SortCurrentSeason = styled(SortItem)`
  width: 55px;
`;

const SortTotalScr = styled(SortItem)`
  width: 65px;
`;

const SortButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;
