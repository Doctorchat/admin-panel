import {
  CLEAN_ON_UNMOUNT_TRUE,
  CLEAN_ON_UNMOUNT_FALSE,
  MEDICAL_CENTRE_LIST_GET,
  CREATE_MEDICAL_CENTRE,
  UPDATE_MEDICAL_CENTRE,
  MEDICAL_CENTRE_LIST_CLEAN,
  DELETE_MEDICAL_CENTRE,
} from "../actionTypes";

const initialState = {
  payload: {
    data: [],
    meta: {},
  },
  cleanOnUnmount: true,
};

const medicalCentreList = (state = initialState, action = {}) => {
  switch (action.type) {
    case MEDICAL_CENTRE_LIST_GET: {
      return { ...state, payload: { ...action.payload } };
    }

    case CREATE_MEDICAL_CENTRE: {
      return {
        ...state,
        payload: {
          ...state.payload,
          data: [...state.payload.data, action.payload.data],
        },
      };
    }
    case UPDATE_MEDICAL_CENTRE: {
      return {
        payload: {
          ...state.payload,
          data: state.payload.data?.map((centre) =>
            centre.id === action?.payload?.data?.id ? action.payload.data : centre
          ),
        },
      };
    }
    case DELETE_MEDICAL_CENTRE: {
      return {
        payload: {
          meta: state.payload.meta,
          data: state.payload.data?.filter((item) => item.id !== action.payload),
        },
      };
    }
    case MEDICAL_CENTRE_LIST_CLEAN:
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

export default medicalCentreList;
