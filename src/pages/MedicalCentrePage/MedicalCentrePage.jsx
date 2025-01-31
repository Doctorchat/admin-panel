import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Drawer, Form, Input, PageHeader, message } from "antd";

import api from "../../utils/appApi";
import { MedicalCenterList } from "../../modules";
import usePermissionsRedirect from "../../hooks/usePermissionsRedirect";
import { createMedicalCentre } from "../../store/actions/medicalCentreAction";
import { UploadFile } from "../../components";

const MedicalCentrePage = () => {
  usePermissionsRedirect();

  const [addMedicalCentre, setAddMedicalCentre] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCloseDrawer = useCallback(() => setAddMedicalCentre(false), []);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFormSubmit = useCallback(
    async (values) => {
      setLoading(true);
      const { logo, ...restValues } = values;
      let upload_id = null;

      try {
        const { data } = await api.upload.file(logo[0]?.originFileObj);
        upload_id = data?.data?.id;

        await dispatch(createMedicalCentre({ upload_id, ...restValues }));

        message.success("Centru medical creat cu succes!");
        form.resetFields();
        setAddMedicalCentre(false);
      } catch (error) {
        message.error("A apărut o eroare la crearea de centru medical.");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, form]
  );

  return (
    <>
      <PageHeader
        className="site-page-header"
        title="Centre medicale"
        extra={[
          <Button key="medical-centre-add" type="primary" onClick={() => setAddMedicalCentre(true)}>
            Adaugă
          </Button>,
        ]}
      />

      <Drawer open={addMedicalCentre} onClose={onCloseDrawer} title="Adaugă centru medical">
        <Form layout="vertical" form={form} onFinish={onFormSubmit}>
          <Form.Item name="logo" label="Logo" rules={[{ required: true }]} valuePropName="fileList">
            <UploadFile />
          </Form.Item>

          <Form.Item name="name" label="Nume" rules={[{ required: true }]}>
            <Input placeholder="Introdu numele complet" />
          </Form.Item>

          <Form.Item name="address" label="Adresă" rules={[{ required: true }]}>
            <Input placeholder="Introdu adresa" />
          </Form.Item>

          <Form.Item name="city" label="Localitate" rules={[{ required: true }]}>
            <Input placeholder="Introdu localitatea" />
          </Form.Item>

          <Form.Item name="phone" label="Număr de telefon" rules={[{ required: true }]}>
            <Input placeholder="Introdu numărul de telefon" />
          </Form.Item>

          <Form.Item name="email" label="Adresă de email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="Introdu adresa de email" />
          </Form.Item>

          <Form.Item name="password" label="Parolă" rules={[{ required: true }, { min: 8 }]}>
            <Input.Password placeholder="Introdu parola" />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            label="Confirmare parolă"
            rules={[
              { required: true },
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

          <Button type="primary" htmlType="submit" loading={loading}>
            Salveză
          </Button>
        </Form>
      </Drawer>

      <MedicalCenterList />
    </>
  );
};

export default MedicalCentrePage;
