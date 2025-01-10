import {
  ASSIGN_DOCTOR_MEDICAL_CENTRE,
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
    default:
      return state;
  }
};

export default doctorMedicalCentreList;
