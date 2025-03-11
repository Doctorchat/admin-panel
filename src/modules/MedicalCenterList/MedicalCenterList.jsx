import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Button, Drawer, Form, Input, message, Popconfirm } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useMount, useSessionStorage, useUnmount } from "react-use";
import {
  cleanMedicalCentreList,
  deleteMedicalCentre,
  getMedicalCentreList,
  setCleanOnUnmountTrue,
  updateMedicalCentre,
} from "../../store/actions/medicalCentreAction";
import { DcTable, UploadFile } from "../../components";
import date from "../../utils/date";
import { phoneValidationRule } from "../../utils/validation";
import api from "../../utils/appApi";

const initialState = {
  page: 1,
  sort_column: "id",
  sort_direction: "descend",
};

const tableStateKey = "medical-centre-list-state";

export default function MedicalCenterList() {
  const [state, setState] = useSessionStorage(tableStateKey, initialState);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removeMedicalCentreLoading, setRemoveMedicalCentreLoading] = useState(false);
  const [activeMedicalCentre, setActiveMedicalCentre] = useState(null);

  const { medicalCentre, cleanOnUnmount } = useSelector((store) => ({
    medicalCentre: store.medicalCentreList.payload,
    cleanOnUnmount: store.medicalCentreList.cleanOnUnmount,
  }));

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onCloseDrawer = useCallback(() => setActiveMedicalCentre(false), []);

  const onTableChange = useCallback(
    (pagination) => {
      const newState = { ...state };

      newState.page = pagination.current;

      setState(newState);
    },
    [setState, state]
  );

  const onViewMedicalCentre = useCallback(
    (centre) => () => {
      setActiveMedicalCentre(centre);
    },
    []
  );

  const removeHandler = useCallback(
    (id) => async () => {
      setRemoveMedicalCentreLoading(id);
      try {
        await dispatch(deleteMedicalCentre(id));
      } catch (e) {
        message.error("A apărut o eroare la ștergerea de centru medical.");
      }
      setRemoveMedicalCentreLoading(false);
    },
    [dispatch]
  );

  const onEditSubmit = useCallback(
    async (values) => {
      const { logo, ...restValues } = values;

      setEditLoading(true);

      let upload_id = activeMedicalCentre?.logo?.id;

      try {
        if (logo[0]) {
          const { data } = await api.upload.file(logo[0]?.originFileObj);
          upload_id = data?.data?.id;
        }

        await dispatch(updateMedicalCentre(activeMedicalCentre?.id, { ...restValues, upload_id }));

        message.success("Centru medical a fost actualizat.");

        setEditLoading(false);
        form.resetFields();
        onCloseDrawer();
      } catch (error) {
        message.error("A apărut o eroare la actualizare de centru medical.");
      }
    },
    [activeMedicalCentre, dispatch]
  );

  useEffect(() => {
    const { page, sort_column, sort_direction, per_page } = state;

    setLoading(true);

    dispatch(getMedicalCentreList({ page, sort_column, sort_direction, per_page }))
      .catch(() => {
        if (error?.response?.status === 500) {
          setError({
            status: error.response.status,
            message: error.response.data.message,
          });
          sessionStorage.removeItem(tableStateKey);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, error, state]);

  useEffect(() => {
    if (activeMedicalCentre && Object.keys(activeMedicalCentre).length) {
      form.setFields([
        { name: "name", value: activeMedicalCentre.name },
        { name: "address", value: activeMedicalCentre.address },
        { name: "city", value: activeMedicalCentre.city },
        { name: "email", value: activeMedicalCentre.email },
        { name: "phone", value: activeMedicalCentre.phone },
        { name: "logo", value: [] },
      ]);
    }
  }, [activeMedicalCentre, form]);

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id" },
      {
        title: "Nume",
        dataIndex: "name",
        render: (_, { name, logo }) => {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "max-content" }}>
              <Avatar src={logo?.url} icon={<BankOutlined style={{ display: "inline-flex" }} />} />
              {name}
            </div>
          );
        },
      },
      {
        title: "Localitate",
        dataIndex: "city",
      },
      {
        title: "Adresă",
        dataIndex: "address",
      },
      {
        title: "Telefon",
        dataIndex: "phone",
        render: (phone) => <div style={{ minWidth: "max-content" }}>{phone}</div>,
      },
      {
        title: "Email",
        dataIndex: "email",
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
          <div style={{ display: "flex" }}>
            <Button type="primary" size="small" className="me-2" onClick={onViewMedicalCentre(row)}>
              Editează
            </Button>

            <Popconfirm
              title="Ești sigur ca vrei sa ștergi acestă cerere?"
              placement="left"
              okText="Accept"
              cancelText="Anulează"
              onConfirm={removeHandler(row.id)}
            >
              <Button type="primary" size="small" danger loading={removeMedicalCentreLoading === row.id}>
                Șterge
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [onViewMedicalCentre, removeHandler, removeMedicalCentreLoading]
  );

  useMount(() => {
    dispatch(setCleanOnUnmountTrue());
  });

  useUnmount(() => {
    if (cleanOnUnmount) {
      sessionStorage.removeItem(tableStateKey);
      dispatch(cleanMedicalCentreList());
    }
  });

  if (error) {
    return <Alert showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }

  return (
    <>
      <Drawer open={activeMedicalCentre} onClose={onCloseDrawer} title="Editare centru medical">
        <Form layout="vertical" form={form} onFinish={onEditSubmit}>
          <Form.Item
            name="logo"
            label="Logo"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if ((value && value.length > 0) || activeMedicalCentre?.logo) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Logo-ul este obligatoriu."));
                },
              },
            ]}
            valuePropName="fileList"
          >
            <UploadFile defaultPreview={activeMedicalCentre?.logo?.url || ""} />
          </Form.Item>

          <Form.Item name="name" label="Nume" rules={[{ required: true }, { min: 3 }]}>
            <Input placeholder="Introdu numele complet" />
          </Form.Item>

          <Form.Item name="address" label="Adresă" rules={[{ required: true }, { min: 3 }]}>
            <Input placeholder="Introdu adresa" />
          </Form.Item>

          <Form.Item name="city" label="Localitate" rules={[{ required: true }]}>
            <Input placeholder="Introdu localitatea" />
          </Form.Item>

          <Form.Item name="phone" label="Număr de telefon" rules={[{ required: true }, phoneValidationRule]}>
            <Input placeholder="Introdu numărul de telefon" />
          </Form.Item>

          <Form.Item name="email" label="Adresă de email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="Introdu adresa de email" />
          </Form.Item>

          <Form.Item name="password" label="Parolă" rules={[{ min: 8 }]}>
            <Input.Password placeholder="Introdu parola" />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            label="Confirmare parolă"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Parolele nu se potrivesc."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Reintrodu parola" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={editLoading}>
            Salveză
          </Button>
        </Form>
      </Drawer>

      <DcTable
        dataColumns={columns}
        dataSource={medicalCentre?.data}
        loading={loading}
        onTabelChange={onTableChange}
        pagination={{
          per_page: medicalCentre?.meta?.per_page,
          total: medicalCentre?.meta?.total,
          current_page: medicalCentre?.meta?.current_page,
        }}
      />
    </>
  );
}
