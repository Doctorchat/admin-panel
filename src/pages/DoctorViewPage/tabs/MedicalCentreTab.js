import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Col, message, Modal, Popconfirm, Row, Select, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getMedicalCentreList } from "../../../store/actions/medicalCentreAction";
import { BankOutlined, PlusOutlined } from "@ant-design/icons";
import { DcTable } from "../../../components";
import date from "../../../utils/date";
import { useParams } from "react-router-dom";
import {
  assignDoctorToMedicalCenter,
  getMedicalCentreByDoctorId,
  removeDoctorFromMedicalCenter,
} from "../../../store/actions/doctorMedicalCentreAction";

const { Option } = Select;

export default function MedicalCentreTab() {
  const { doc_id } = useParams();

  const [selectedMedicalCentre, setSelectedMedicalCentre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removeMedicalCentreLoading, setRemoveMedicalCentreLoading] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedMedicalCentre(null);
  };

  const { medicalCentre, doctorMedicalCentre } = useSelector((store) => ({
    medicalCentre: store.medicalCentreList.payload,
    doctorMedicalCentre: store.doctorMedicalCentreList.payload,
  }));

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMedicalCentreList()).catch(() => {
      if (error?.response?.status === 500) {
        setError({
          status: error.response.status,
          message: error.response.data.message,
        });
      }
    });
  }, [dispatch, error]);

  useEffect(() => {
    setLoading(true);

    dispatch(getMedicalCentreByDoctorId(doc_id, { per_page: 1_000 }))
      .catch(() => {
        if (error?.response?.status === 500) {
          setError({
            status: error.response.status,
            message: error.response.data.message,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, error]);

  const onChange = (value) => {
    setSelectedMedicalCentre(value);
  };

  const medicalCentreData = useMemo(() => {
    const doctorCentres = doctorMedicalCentre?.data || [];
    const allCentres = medicalCentre?.data || [];

    return allCentres.map(({ id: value, name: label, ...rest }) => ({
      value,
      label,
      ...rest,
      disabled: doctorCentres.some((dmc) => dmc?.medical_centre?.id === value),
    }));
  }, [doctorMedicalCentre, medicalCentre]);

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id" },
      {
        title: "Nume",
        render: (_, row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "max-content" }}>
            <Avatar src={row?.medical_centre?.logo?.url} icon={<BankOutlined style={{ display: "inline-flex" }} />} />
            {row?.medical_centre?.name}
          </div>
        ),
      },
      {
        title: "Localitate",
        dataIndex: ["medical_centre", "city"],
      },
      {
        title: "Adresă",
        dataIndex: ["medical_centre", "address"],
      },
      {
        title: "Telefon",
        dataIndex: ["medical_centre", "phone"],
        render: (phone) => <div style={{ minWidth: "max-content" }}>{phone}</div>,
      },
      {
        title: "Email",
        dataIndex: ["medical_centre", "email"],
        render: (email) => <div style={{ minWidth: "max-content" }}>{email}</div>,
      },
      {
        title: "Creat",
        dataIndex: "created_at",
        render: (rowData) => date(rowData).full,
      },
      {
        title: "Actualizat",
        dataIndex: "updated_at",
        render: (rowData) => date(rowData).full,
      },
      {
        title: "Acțiuni",
        render: (_, row) => (
          <Popconfirm
            title="Sigur doriți să ștergiți acest centru medical?"
            placement="left"
            okText="Accept"
            cancelText="Anulează"
            onConfirm={removeHandler(row?.medical_centre?.id)}
          >
            <Button type="primary" size="small" danger loading={removeMedicalCentreLoading === row.id}>
              Șterge
            </Button>
          </Popconfirm>
        ),
      },
    ],
    []
  );

  const handleOk = async () => {
    try {
      await dispatch(assignDoctorToMedicalCenter(doc_id, selectedMedicalCentre));
    } catch (e) {
      message.error("A apărut o eroare la adăugarea de centru medical.");
    } finally {
      setSelectedMedicalCentre(null);
      setIsModalOpen(false);
    }
  };

  const removeHandler = useCallback(
    (id) => async () => {
      setRemoveMedicalCentreLoading(id);
      try {
        await dispatch(removeDoctorFromMedicalCenter(doc_id, id));
      } catch (e) {
        message.error("A apărut o eroare la ștergerea de centru medical.");
      }
      setRemoveMedicalCentreLoading(null);
    },
    [dispatch]
  );

  return (
    <>
      <Modal title="Adăugare centru medical" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Select
          showSearch
          placeholder="Selectați centrul medical"
          optionFilterProp="label"
          optionLabelProp="label"
          onChange={onChange}
          style={{ width: "100%" }}
          size="large"
          value={selectedMedicalCentre}
        >
          {medicalCentreData?.map(({ value, label, address, logo, disabled, city }) => (
            <Option key={value} value={value} label={label} disabled={disabled}>
              <Space style={{ display: "flex" }}>
                <Avatar shape="square" size="large" src={logo?.url} style={{ opacity: disabled ? 0.5 : 1 }} />
                <div>
                  <div>{label}</div>
                  <div style={{ opacity: 0.5, fontSize: 12 }}>
                    {address}, {city}
                  </div>
                </div>
              </Space>
            </Option>
          ))}
        </Select>
      </Modal>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Button
            type="primary"
            onClick={showModal}
            icon={<PlusOutlined />}
            style={{ display: "flex", alignItems: "center" }}
          >
            Adaugă centru medical
          </Button>
        </Col>

        <Col span={24}>
          <DcTable dataColumns={columns} dataSource={doctorMedicalCentre?.data} loading={loading} />
        </Col>
      </Row>
    </>
  );
}
