import {
  CLEAN_ON_UNMOUNT_FALSE,
  CLEAN_ON_UNMOUNT_TRUE,
  CREATE_MEDICAL_CENTRE,
  DELETE_MEDICAL_CENTRE,
  MEDICAL_CENTRE_LIST_CLEAN,
  MEDICAL_CENTRE_LIST_GET,
  UPDATE_MEDICAL_CENTRE,
} from "../actionTypes";
import api from "../../utils/appApi";

export const getMedicalCentreList =
  (params = {}) =>
  async (dispatch) => {
    try {
      const response = await api.medicalCentre.get(params);

      dispatch({ type: MEDICAL_CENTRE_LIST_GET, payload: response?.data });

      return Promise.resolve(response?.data);
    } catch (error) {
      return Promise.reject(error);
    }
  };

export const createMedicalCentre = (values) => async (dispatch) => {
  try {
    const response = await api.medicalCentre.create(values);

    dispatch({ type: CREATE_MEDICAL_CENTRE, payload: response?.data });

    return Promise.resolve(response?.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateMedicalCentre = (id, data) => async (dispatch) => {
  try {
    const response = await api.medicalCentre.update(id, data);

    dispatch({ type: UPDATE_MEDICAL_CENTRE, payload: response.data });

    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteMedicalCentre = (id) => async (dispatch) => {
  try {
    await api.medicalCentre.delete(id);

    dispatch({ type: DELETE_MEDICAL_CENTRE, payload: id });

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const cleanMedicalCentreList = () => (dispatch) =>
  dispatch({
    type: MEDICAL_CENTRE_LIST_CLEAN,
  });

export const setCleanOnUnmountTrue = () => (dispatch) =>
  new Promise((resolve) => {
    dispatch({
      type: CLEAN_ON_UNMOUNT_TRUE,
    });
    return resolve();
  });

export const setCleanOnUnmountFalse = () => (dispatch) =>
  new Promise((resolve) => {
    dispatch({
      type: CLEAN_ON_UNMOUNT_FALSE,
    });
    return resolve();
  });
