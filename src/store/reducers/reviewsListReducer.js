import {
  REVIEWS_LIST_GET,
  CLEAN_ON_UNMOUNT_TRUE,
  CLEAN_ON_UNMOUNT_FALSE,
  REVIEWS_LIST_CLEAN,
} from "../actionTypes";

const initialState = {
  payload: {},
  cleanOnUnmount: true,
};

const chatsList = (state = initialState, action = {}) => {
  switch (action.type) {
    case REVIEWS_LIST_GET: {
      return { ...state, payload: action.payload };
    }
    case REVIEWS_LIST_CLEAN:
      return initialState;
    case CLEAN_ON_UNMOUNT_TRUE:
      return {
        ...state,
        cleanOnUnmount: true,
      };
    case CLEAN_ON_UNMOUNT_FALSE:
      return {
        ...state,
        cleanOnUnmount: false,
      };
    default:
      return state;
  }
};

export default chatsList;
