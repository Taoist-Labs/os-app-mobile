import Layout from "../components/layout/layout";
import styled from "styled-components";
import React, { ChangeEvent, useEffect, useState, FormEvent, useRef } from "react";
import { getUser, updateUser } from "../api/user";
// import { useAuthContext, AppActionType } from 'providers/authProvider';
import { useTranslation } from "react-i18next";
// import useToast, { ToastType } from 'hooks/useToast';
import { Upload, X } from "react-bootstrap-icons";
// import { ContainerPadding } from 'assets/styles/global';
// import useParseSNS from 'hooks/useParseSNS';
// import CopyBox from 'components/copy';
import copyIcon from "assets/images/copy.svg";
import { useSelector } from "react-redux";
import store from "../store";
import { saveAccount, saveLoading, saveUserToken, saveWalletType } from "../store/reducer";
import { useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import useToast from "hooks/useToast";

const InputGroup = styled.div``;
const Button = styled.div``;
const Form = styled.div``;

const HeadBox = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 40px;
`;
const CardBox = styled.div`
  min-height: 100%;
  padding: 0 20px;
`;
const AvatarBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UlBox = styled.ul`
  width: 100%;
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(217, 217, 217, 0.5);
    padding: 15px 0;
    .title {
      color: #9a9a9a;
      font-size: 14px;
    }
  }
`;
const InputBox = styled(InputGroup)`
  flex-grow: 1;
  margin-left: 20px;
  .wallet {
    border: 1px solid #eee;
    width: 100%;
    border-radius: 0.25rem;
    height: 40px;
    padding: 0 1.125rem;
    display: flex;
    align-items: center;
    overflow-x: auto;
  }
  .copy-content {
    position: absolute;
    right: -30px;
    top: 8px;
  }
  input,
  textarea {
    border: 0;
    width: 100%;
    text-align: right;
    font-size: 14px;
    &:focus {
      outline: none;
    }
  }
  textarea {
    margin-bottom: -5px;
    resize: none;
  }
`;
const MidBox = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
  gap: 60px;
`;

const ButtonBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 50px;
  left: 0;
  button {
    width: 89%;
    height: 44px;
    background: #eeeef4;
    border-radius: 16px;
    border: 0;
    font-size: 14px;
    color: #000;
  }
`;

const ConfirmBox = styled.div`
  color: var(--primary-color);
  display: inline-block;
  font-size: 17px;
`;

export default function ProfileEdit() {
  // const {
  //   state: { userData },
  //   dispatch,
  // } = useAuthContext();
  // const sns = useParseSNS(userData?.wallet);

  const { t } = useTranslation();
  // const { Toast, showToast } = useToast();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [twitter, setTwitter] = useState("");
  const [wechat, setWechat] = useState("");
  const [mirror, setMirror] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [wallet, setWallet] = useState("");
  const { disconnect } = useDisconnect();

  const [height, setHeight] = useState("1em");

  useEffect(() => {
    const textarea = document.getElementById("textarea");
    setHeight(`${textarea.scrollHeight}px`);
  }, [bio]);

  const handleValue = (e) => {
    const { value } = e.target;
    setBio(value);
  };

  const userToken = useSelector((state) => state.userToken);
  const walletType = useSelector((state) => state.walletType);
  const navigate = useNavigate();

  const { Toast, toast } = useToast();

  const logout = () => {
    store.dispatch(saveAccount(null));
    store.dispatch(saveUserToken(null));
    store.dispatch(saveWalletType(null));
    if (walletType === "metamask") {
      disconnect();
    }
    // store.dispatch(saveLogout(true));
    navigate("/login");
  };

  useEffect(() => {
    getMyDetail();
  }, []);
  const getMyDetail = async () => {
    store.dispatch(saveLoading(true));
    try {
      let rt = await getUser();
      const { avatar, bio, email, discord_profile, twitter_profile, wechat, mirror, wallet, nickname } = rt.data;
      setUserName(nickname);
      setEmail(email);
      let mapArr = new Map();

      rt.data.social_accounts.map((item) => {
        mapArr.set(item.network, item.identity);
      });
      setTwitter(mapArr.get("twitter") ?? "");
      setDiscord(mapArr.get("discord") ?? "");
      setWechat(mapArr.get("wechat") ?? "");
      setMirror(mapArr.get("mirror") ?? "");
      setGithub(mapArr.get("github") ?? "");
      setBio(bio);
      setAvatar(avatar);
      setWallet(wallet);
    } catch (e) {
      console.error(e);
    } finally {
      store.dispatch(saveLoading(false));
    }
  };

  const handleInput = (e, type) => {
    const { value } = e.target;
    switch (type) {
      case "userName":
        setUserName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "discord":
        setDiscord(value);
        break;
      case "twitter":
        setTwitter(value);
        break;
      case "wechat":
        setWechat(value);
        break;
      case "mirror":
        setMirror(value);
        break;
      // case 'bio':
      //   setBio(value);
      //   break;
      case "github":
        setGithub(value);
        break;
      default:
        return;
    }
  };
  const saveProfile = async () => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !reg.test(email)) {
      toast.danger(t("My.IncorrectEmail"));
      return;
    }
    if (mirror && mirror.indexOf("mirror.xyz") === -1) {
      toast.danger(t("My.IncorrectMirror"));
      return;
    }
    if (twitter && !twitter.startsWith("https://twitter.com/")) {
      toast.danger(t("My.IncorrectLink", { media: "Twitter" }));
      return;
    }

    store.dispatch(saveLoading(true));
    try {
      const data = {
        name: userName,
        avatar,
        email,
        discord_profile: discord,
        twitter_profile: twitter,
        github_profile: github,
        wechat,
        mirror,
        bio,
      };
      await updateUser(data);
      // dispatch({ type: AppActionType.SET_USER_DATA, payload: { ...userData, ...data } });
      toast.success(t("My.ModifiedSuccess"));
      setTimeout(() => {
        window.location.replace(`${window.location.origin}/user/profile`);
      }, 1000);
    } catch (error) {
      console.error("updateUser failed", error);
      toast.danger(t("My.ModifiedFailed"));
    } finally {
      store.dispatch(saveLoading(false));
    }
  };

  const getBase64 = (imgUrl) => {
    window.URL = window.URL || window.webkitURL;
    const xhr = new XMLHttpRequest();
    xhr.open("get", imgUrl, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status === 200) {
        const blob = this.response;
        const oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          const { result } = e.target;
          setAvatar(result);
        };
        oFileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  };

  const updateLogo = (e) => {
    const { files } = e.target;
    const url = window.URL.createObjectURL(files[0]);
    getBase64(url);
  };

  const removeUrl = () => {
    setAvatar("");
  };

  return (
    <Layout
      noTab
      title={t("My.EditTitle")}
      rightOperation={<ConfirmBox onClick={saveProfile}>{t("General.confirm")}</ConfirmBox>}
    >
      <CardBox>
        {/*<HeadBox>*/}

        {/*  <InfoBox>*/}
        {/*    /!*<div className="wallet">{sns}</div>*!/*/}
        {/*    <div className="wallet">*/}
        {/*      /!*<div>{userData?.wallet}</div>*!/*/}
        {/*      /!*{userData?.wallet && (*!/*/}
        {/*      /!*  <CopyBox text={userData?.wallet} dir="right">*!/*/}
        {/*      /!*    <img src={copyIcon} alt="" style={{ position: 'relative', top: '-2px' }} />*!/*/}
        {/*      /!*  </CopyBox>*!/*/}
        {/*      /!*)}*!/*/}
        {/*    </div>*/}
        {/*  </InfoBox>*/}
        {/*</HeadBox>*/}

        <MidBox>
          <UlBox>
            <li>
              <div className="title">{t("My.Avatar")}</div>
              <AvatarBox>
                <UploadBox htmlFor="fileUpload" onChange={(e) => updateLogo(e)}>
                  {!avatar && (
                    <div>
                      <input id="fileUpload" type="file" hidden accept=".jpg, .jpeg, .png" />
                      {<Upload />}
                    </div>
                  )}
                  {!!avatar && (
                    <ImgBox onClick={() => removeUrl()}>
                      <div className="del">
                        <X className="iconTop" />
                      </div>
                      <img src={avatar} alt="" />
                    </ImgBox>
                  )}
                </UploadBox>
              </AvatarBox>
            </li>
            <li>
              <div className="title">{t("My.Name")}</div>
              <InputBox>
                <input type="text" placeholder="" value={userName} onChange={(e) => handleInput(e, "userName")} />
              </InputBox>
            </li>
            <li>
              <div className="title">{t("My.Bio")}</div>
              <InputBox>
                <textarea
                  id="textarea"
                  placeholder=""
                  style={{ height: height }}
                  value={bio}
                  onChange={(e) => handleValue(e)}
                />
              </InputBox>
            </li>
            <li>
              <div className="title">{t("My.Email")}</div>
              <InputBox>
                <input type="text" placeholder="" value={email} onChange={(e) => handleInput(e, "email")} />
              </InputBox>
            </li>

            {/*<li>*/}
            {/*  <div className="title">{t('My.Discord')}</div>*/}
            {/*  <InputBox>*/}
            {/*    <Form.Control type="text" placeholder="" value={discord} onChange={(e) => handleInput(e, 'discord')} />*/}
            {/*  </InputBox>*/}
            {/*</li>*/}
            {/*<li>*/}
            {/*  <div className="title">{t('My.Twitter')}</div>*/}
            {/*  <InputBox>*/}
            {/*    <Form.Control*/}
            {/*      type="text"*/}
            {/*      placeholder="eg, https://twitter.com/..."*/}
            {/*      value={twitter}*/}
            {/*      onChange={(e) => handleInput(e, 'twitter')}*/}
            {/*    />*/}
            {/*  </InputBox>*/}
            {/*</li>*/}
            <li>
              <div className="title">{t("My.Twitter")}</div>
              <InputBox>
                <input type="text" placeholder="" value={twitter} onChange={(e) => handleInput(e, "twitter")} />
              </InputBox>
            </li>
            <li>
              <div className="title">{t("My.Mirror")}</div>
              <InputBox>
                <input type="text" placeholder="" value={mirror} onChange={(e) => handleInput(e, "mirror")} />
              </InputBox>
            </li>
            <li>
              <div className="title">{t("My.Github")}</div>
              <InputBox>
                <input type="text" placeholder="" value={github} onChange={(e) => handleInput(e, "github")} />
              </InputBox>
            </li>
          </UlBox>
        </MidBox>
      </CardBox>
      <ButtonBox>
        <button onClick={() => logout()}>{t("My.logout")}</button>
      </ButtonBox>
      {Toast}
    </Layout>
  );
}

const UploadBox = styled.label`
  background: #f8f8f8;
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-top: 20px;
  font-family: "Inter-Regular";
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  .iconRht {
    margin-right: 10px;
  }
  img {
    max-width: 100%;
    object-fit: cover;
  }
`;

const ImgBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  .del {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    //display: flex;
    align-items: center;
    justify-content: center;
    background: #a16eff;
    opacity: 0.5;
    color: #fff;
    cursor: pointer;
    .iconTop {
      font-size: 40px;
    }
  }
  &:hover {
    .del {
      display: flex;
    }
  }
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  .wallet {
    display: flex;
    gap: 10px;
  }
`;
