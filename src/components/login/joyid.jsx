import {Button} from "react-bootstrap";
import {
    connectWithRedirect,
    connectCallback,
    signMessageWithRedirect,
    signMessageCallback,
} from "@joyid/evm";
import {useEffect, useState} from "react";
import store from "../../store";
import {saveAccount, saveUserToken, saveWalletType} from "../../store/reducer";
import {getNonce, login} from "../../api/user";
import {ethers} from "ethers";
import {createSiweMessage} from "../../utils/publicJs";
import AppConfig from "../../AppConfig";
import {useNavigate} from "react-router-dom";

export default function Joyid(){

    const navigate = useNavigate();
    const [account, setAccount] = useState();
    const [sig, setSig] = useState("");
    const [msg,setMsg] = useState();
    const [result,setResult] = useState(null);


    useEffect(() => {
        const redirectHome = () => {
            const _address = localStorage.getItem("joyid-address");
            if (_address) {
                setAccount(_address);
                return;
            }
            let state;
            try {
                state = connectCallback();
                if (state?.address) {
                    setAccount(state.address);
                    store.dispatch(saveAccount(state.address))
                    localStorage.setItem("joyid-address", state.address);
                    return true;
                }
            } catch (error) {
                console.error("callback:", error);
                localStorage.removeItem("joyid-status")
            }
        };

        const redirectSignMessage = () => {
            let state;
            try {
                state = signMessageCallback();
                setSig(state.signature);
                return true;
            } catch (error) {
                console.error("callback sign:", error);
                localStorage.removeItem("joyid-status")
            }
        };
        redirectHome();
        redirectSignMessage();
    }, []);

    const buildRedirectUrl = (action) => {
        const url = new URL(`${window.location.origin}/login`);
        url.searchParams.set("action", action);
        return url.href;
    }

    useEffect(()=>{
        let action = localStorage.getItem("joyid-status")
        if(!account || action !== "login" ) return;
        onSignMessageRedirect()
    },[account])

    useEffect(()=>{
        if(!sig || !account) return;
        LoginTo()
    },[sig,account])


    const getMyNonce = async(wallet) =>{
        let rt = await getNonce(wallet);
        return rt.data.nonce;
    }

    const onSignMessageRedirect = async() => {
        localStorage.setItem("joyid-status","sign")
        let nonce = await getMyNonce(account);
        const eip55Addr = ethers.utils.getAddress(account);

        const siweMessage = createSiweMessage(eip55Addr, 1, nonce, 'Welcome to SeeDAO!');
        setMsg(siweMessage)
        localStorage.setItem("joyid-msg",siweMessage)

        const url = buildRedirectUrl("sign-message");
        signMessageWithRedirect(url, siweMessage, account, {
            state: msg,
        });
    };


    const onConnectRedirect = () => {
        localStorage.setItem("joyid-status","login")
        const url = buildRedirectUrl("connect");
        connectWithRedirect(url, {
            rpcURL: "https://eth.llamarpc.com",
            network: {
                chainId: 1,
                name: "Ethereum Mainnet",
            },
        });

    };


    const LoginTo = async () =>{
        localStorage.setItem("joyid-status",null)
        const { host} = AppConfig;
        let ms =  localStorage.getItem("joyid-msg")
        let obj = {
            wallet: account,
            message: ms,
            signature: sig,
            domain: host,
            wallet_type: 'EOA',
            is_eip191_prefix: true
        };
        try{
            let rt = await login(obj);
            store.dispatch(saveUserToken(rt.data));
            store.dispatch(saveWalletType("joyid"));

            setResult(rt.data)
        }catch (e){
            console.error(e)
        }

    }

    useEffect(()=>{
        if(!result)return;
        navigate('/board');

    },[result])

    return <div>
        <Button onClick={()=>onConnectRedirect()}>JoyID</Button>
    </div>
}


