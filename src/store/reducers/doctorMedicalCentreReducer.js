import {
  CLEAN_ON_UNMOUNT_TRUE,
  CLEAN_ON_UNMOUNT_FALSE,
  ASSIGN_DOCTOR_MEDICAL_CENTRE,
  MEDICAL_CENTRE_LIST_CLEAN,
  DOCTOR_MEDICAL_CENTRE_LIST_GET,
  DETACH_DOCTOR_MEDICAL_CENTRE,
} from "../actionTypes";

const initialState = {
  payload: {
    data: [],
    meta: {},
  },
  cleanOnUnmount: true,
};

const doctorMedicalCentreList = (state = initialState, action = {}) => {
  switch (action.type) {
    case DOCTOR_MEDICAL_CENTRE_LIST_GET: {
      console.log("action.payload", action.payload);
      return { ...state, payload: { ...action.payload } };
    }

    case ASSIGN_DOCTOR_MEDICAL_CENTRE: {
      return {
        ...state,
        payload: {
          ...state.payload,
          data: [...state.payload.data, action.payload.data],
        },
      };
    }

    case DETACH_DOCTOR_MEDICAL_CENTRE: {
      return {
        payload: {
          meta: state.payload.meta,
          data: state.payload.data?.filter((item) => item?.medical_centre?.id !== action.payload),
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

export default doctorMedicalCentreList;
