import {SiweMessage} from 'siwe';
import AppConfig from '../AppConfig';
import axios from 'axios';

const AddressToShow = (address) => {
  if (!address) {
    return "...";
  }
  if (address.length <= 8) {
    return address;
  }

  const frontStr = address.substring(0, 4);

  const afterStr = address.substring(address.length - 4, address.length);

  return `${frontStr}...${afterStr}`;
};

export const createSiweMessage = (address, chainId, nonce, statement) => {
  const {host, origin} = AppConfig;
  const siweMessage = new SiweMessage({
    domain: host,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: chainId,
    nonce,
  });
  return siweMessage.prepareMessage();
};


const IPFS_BASES = [
  'https://gateway.pinata.cloud/ipfs',
  'https://gateway.ipfs.io/ipfs',
  'https://ipfs.io/ipfs',
  'https://cf-ipfs.com/ipfs',
  'https://dweb.link/ipfs',
  'https://ipfs.eth.aragon.network/ipfs',
];

async function agumentedIpfsGet(hash) {
  const promises = IPFS_BASES.map(async (ipfsBase) => {
    try {
      let rt = await axios.get(`${ipfsBase}/${hash}`);
      if (rt.status === 200) {
        return `${ipfsBase}/${hash}`;
      } else {
        return Promise.reject(rt.status);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  });

  try {
    const result = await Promise.any(promises);
    return result;
  } catch (e) {
    return Promise.reject(e);
  }
}

const getImage = async (img) => {
  if (!img) return;
  if (img.indexOf('http://') > -1 || img.indexOf('https://') > -1) {
    return img;
  } else {
    let str = img;
    if (img.indexOf('ipfs://') > -1) {
      str = img.split('ipfs://')[1];
    }
    try {
      let imgAA = await agumentedIpfsGet(str);
      return imgAA;
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

export default {
  AddressToShow,
  createSiweMessage,
  getImage
};
