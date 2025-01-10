import {
  ASSIGN_DOCTOR_MEDICAL_CENTRE,
  DETACH_DOCTOR_MEDICAL_CENTRE,
  DOCTOR_MEDICAL_CENTRE_LIST_GET,
} from "../actionTypes";
import api from "../../utils/appApi";

export const getMedicalCentreByDoctorId =
  (id, params = {}) =>
  async (dispatch) => {
    try {
      const response = await api.doctorMedicalCentre.get(id, params);

      dispatch({ type: DOCTOR_MEDICAL_CENTRE_LIST_GET, payload: response?.data });

      return Promise.resolve(response?.data);
    } catch (error) {
      return Promise.reject(error);
    }
  };

export const assignDoctorToMedicalCenter = (user_id, medical_center_id) => async (dispatch) => {
  try {
    const response = await api.doctorMedicalCentre.create({ medical_center_id, user_id });

    dispatch({ type: ASSIGN_DOCTOR_MEDICAL_CENTRE, payload: response?.data });

    return Promise.resolve(response?.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const removeDoctorFromMedicalCenter = (userId, medicalCenterId) => async (dispatch) => {
  try {
    await api.doctorMedicalCentre.delete(userId, medicalCenterId);

    dispatch({ type: DETACH_DOCTOR_MEDICAL_CENTRE, payload: medicalCenterId });

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
