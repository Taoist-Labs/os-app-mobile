import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CircleProgress from "components/circleProgress";
import { useEffect, useState, useRef } from "react";
import { ACTIONS, useSNSContext } from "./snsProvider";
import { builtin } from "@seedao/sns-js";
import useToast from "hooks/useToast";
import { ethers } from "ethers";
import ABI from "assets/abi/SeeDAOMinter.json";
import { useSelector } from "react-redux";
import useTransaction from "hooks/useTransaction";
import getConfig from "constant/envCofnig";
import { erc20ABI } from "wagmi";

const networkConfig = getConfig().NETWORK;
const PAY_TOKEN = networkConfig.tokens[0];
const PAY_NUMBER = 5;

const buildApproveData = () => {
  const iface = new ethers.utils.Interface(erc20ABI);
  return iface.encodeFunctionData("approve", [
    builtin.SEEDAO_MINTER_ADDR,
    ethers.utils.parseUnits(String(PAY_NUMBER), PAY_TOKEN.decimals),
  ]);
};

const buildRegisterData = (sns, resolveAddress, secret) => {
  const iface = new ethers.utils.Interface(ABI);
  return iface.encodeFunctionData("register", [sns, resolveAddress, secret, PAY_TOKEN.address]);
};

const buildWhiteListRegisterData = (sns, resolveAddress, secret, proof) => {
  const iface = new ethers.utils.Interface(ABI);
  return iface.encodeFunctionData("registerWithWhitelist", [sns, resolveAddress, secret, 0, proof]);
};

export default function RegisterSNSStep2() {
  const { t } = useTranslation();

  const account = useSelector((state) => state.account);
  const rpc = useSelector((state) => state.rpc);

  const {
    state: { localData, sns, userProof, minterContract },
    dispatch: dispatchSNS,
  } = useSNSContext();
  const { toast } = useToast();

  const startTimeRef = useRef(0);
  const [leftTime, setLeftTime] = useState(0);
  const [secret, setSecret] = useState("");

  const { handleTransaction } = useTransaction("sns-register");

  useEffect(() => {
    const parseLocalData = () => {
      if (!account || !localData) {
        return;
      }
      const d = localData[account];
      setSecret(d.secret);
      startTimeRef.current = d.timestamp || 0;
    };
    parseLocalData();
  }, [localData]);

  useEffect(() => {
    let timer;
    const timerFunc = () => {
      if (!startTimeRef.current) {
        return;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      const delta = currentTime - startTimeRef.current;
      if (delta > 60) {
        setLeftTime(0);
        clearInterval(timer);
        return;
      }
      setLeftTime(60 - delta);
    };
    timerFunc();
    timer = setInterval(timerFunc, 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = (leftTime / 60) * 100;

  const handleRegister = async () => {
    if (!account) {
      return;
    }
    try {
      console.log(userProof, sns, account, builtin.PUBLIC_RESOLVER_ADDR, secret);
      let tx;
      if (userProof) {
        // whitelist
        tx = await handleTransaction(
          builtin.SEEDAO_MINTER_ADDR,
          buildWhiteListRegisterData(
            sns,
            builtin.PUBLIC_RESOLVER_ADDR,
            ethers.utils.formatBytes32String(secret),
            userProof,
          ),
        );
      } else {
        // approve
        const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
        const tokenContract = new ethers.Contract(PAY_TOKEN.address, erc20ABI, provider);
        // check approve balance
        const approve_balance = await tokenContract.allowance(account, builtin.SEEDAO_MINTER_ADDR);
        const not_enough = approve_balance.lt(ethers.utils.parseUnits(String(PAY_NUMBER), PAY_TOKEN.decimals));
        if (not_enough) {
          tx = await handleTransaction(PAY_TOKEN.address, buildApproveData(), "approving");
          // joyid will redirect and not execute the bottom code
        }
        // pay mint -- other wallet will execute this method
        tx = await handleTransaction(
          builtin.SEEDAO_MINTER_ADDR,
          buildRegisterData(sns, builtin.PUBLIC_RESOLVER_ADDR, ethers.utils.formatBytes32String(secret)),
        );
      }

      const hash = (tx && tx.hash) || tx;
      if (hash) {
        const d = { ...localData };
        d[account].registerHash = hash;
        d[account].step = "register";
        d[account].stepStatus = "pending";
        dispatchSNS({ type: ACTIONS.SET_STORAGE, payload: JSON.stringify(d) });
      }
    } catch (error) {
      dispatchSNS({ type: ACTIONS.CLOSE_LOADING });
      console.error("register failed", error);
      toast.danger(error?.reason || error?.data?.message || "error");
    } finally {
    }
  };

  const handleContinueMint = async () => {
    // pay mint continue -- joyid
    handleTransaction(
      builtin.SEEDAO_MINTER_ADDR,
      buildRegisterData(sns, builtin.PUBLIC_RESOLVER_ADDR, ethers.utils.formatBytes32String(secret)),
    );
  };

  useEffect(() => {
    if (!account || !localData) {
      return;
    }
    const hash = localData[account]?.registerHash;
    console.log(localData[account], hash);
    if (!hash || localData[account]?.stepStatus === "failed") {
      return;
    }
    let timer;
    const timerFunc = () => {
      if (!account || !localData || !rpc) {
        return;
      }
      console.log(localData, account);
      const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
      provider.getTransactionReceipt(hash).then((r) => {
        console.log("check tx status:", r);
        const _d = { ...localData };
        if (r && r.status === 1) {
          // means tx success
          if (_d[account].stepStatus === "approving") {
            _d[account].stepStatus = "approve_success";
            dispatchSNS({ type: ACTIONS.SET_STORAGE, payload: JSON.stringify(_d) });
            handleContinueMint();
          } else {
            _d[account].stepStatus = "success";
            dispatchSNS({ type: ACTIONS.CLOSE_LOADING });
            dispatchSNS({ type: ACTIONS.SET_STORAGE, payload: JSON.stringify(_d) });
          }
          clearInterval(timer);
        } else if (r && (r.status === 2 || r.status === 0)) {
          // means tx failed
          _d[account].stepStatus = "failed";
          dispatchSNS({ type: ACTIONS.SET_STORAGE, payload: JSON.stringify(_d) });
          dispatchSNS({ type: ACTIONS.CLOSE_LOADING });
          clearInterval(timer);
        }
      });
    };
    timer = setInterval(timerFunc, 1000);
    return () => timer && clearInterval(timer);
  }, [localData, account, rpc]);

  return (
    <Container>
      <ContainerWrapper>
        <CurrentSNS>{sns}.seedao</CurrentSNS>
        <CircleBox color="var(--primary-color)">
          <CircleProgress progress={progress} color="var(--primary-color)" />
          <div className="number">
            {leftTime}
            <span className="sec">S</span>
          </div>
        </CircleBox>
        <StepTitle>{t("SNS.TimerTitle")}</StepTitle>
        <StepDesc>{t("SNS.TimerDesc")}</StepDesc>
        <FinishButton onClick={handleRegister} disabled={!!leftTime}>
          {t("SNS.Finish")}
        </FinishButton>
      </ContainerWrapper>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
`;

const ContainerWrapper = styled.div`
  display: inline-block;
`;

const CurrentSNS = styled.div`
  font-family: "Poppins-SemiBold";
  font-weight: 600;
  font-size: 34px;
  line-height: 54px;
  letter-spacing: 1px;
  margin-top: 60px;
  margin-bottom: 51px;
`;

const StepTitle = styled.div`
  margin-top: 51px;
  line-height: 24px;
  font-size: 18px;
  font-weight: 400;
  font-family: "Poppins-Medium";
  color: var(--sns-font-color);
`;
const StepDesc = styled.div`
  font-size: 18px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 400;
  margin-top: 11px;
  color: var(--sns-font-color);
`;

const CircleBox = styled.div`
  position: relative;
  .number {
    font-size: 44px;
    font-family: "Poppins-SemiBold";
    font-weight: bold;
    color: ${(props) => props.color};
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    line-height: 160px;
  }
  .sec {
    font-family: "Poppins-Regular";
    font-weight: 400;
    font-size: 20px;
    position: relative;
    bottom: 6px;
    left: 2px;
  }
`;

const FinishButton = styled.button`
  display: inline-block;
  margin-top: 26px;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: var(--primary-color);
  border-radius: 16px;
  color: #fff;
  font-size: 14px;
  border-width: 0;
  &:disabled {
    background: var(--primary-color);
    border-color: transparent;
    opacity: 0.4;
  }
`;
