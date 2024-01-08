import request from "./index";
import { METAFORO_TOKEN } from "utils/constant";

const PATH_PREFIX = "/proposals/";

export const getMetaforoData = () => {
  try {
    const data = localStorage.getItem(METAFORO_TOKEN);
    return data;
  } catch (error) {}
};

export const getProposalCategoryList = () => {
  return request.get(`/proposal_categories/list`);
};

export const getProposalList = (data) => {
  return request.get(`${PATH_PREFIX}list`, data);
};

export const getProposalDetail = (id, startPostId) => {
  return request.get(
    `${PATH_PREFIX}show/${id}`,
    {
      start_post_id: startPostId,
      access_token: getMetaforoData()?.token,
    },
    {},
  );
};

export const prepareMetaforo = () => {
  const data = getMetaforoData();
  console.log("=====getMetaforoData", data);
  return request.post("/user/prepare_metaforo", {
    api_token: data?.token,
    user: { id: data.id },
  });
};

// =========== vote ===========

export const checkCanVote = (id) => {
  return request.post(`${PATH_PREFIX}can_vote/${id}`);
};

export const castVote = (id, vote_id, option) => {
  return request.post(`${PATH_PREFIX}vote/${id}`, {
    vote_id,
    options: [option],
    metaforo_access_token: getMetaforoData()?.token,
  });
};

export const getVotersOfOption = (option_id, page) => {
  return request.get(`${PATH_PREFIX}vote_detail/${option_id}`, {
    page,
  });
};

// =========== comment ===========

// NOTE: reply_id is metaforo_id
export const addComment = (id, content, reply_id) => {
  return request.post(`${PATH_PREFIX}add_comment/${id}`, {
    content,
    reply_id,
    editor_type: 0,
    metaforo_access_token: getMetaforoData()?.token,
  });
};

export const editCommet = (id, content, cid) => {
  return request.post(`${PATH_PREFIX}edit_comment/${id}`, {
    post_id: cid,
    content,
    editor_type: 0,
    metaforo_access_token: getMetaforoData()?.token,
  });
};

export const deleteCommet = (id, cid) => {
  return request.post(`${PATH_PREFIX}delete_comment/${id}`, {
    post_id: cid,
    metaforo_access_token: getMetaforoData()?.token,
  });
};

export const getTemplate = () => {
  return request.get("/proposal_tmpl/");
};
export const getComponents = () => {
  return request.get("/proposal_components/");
};
