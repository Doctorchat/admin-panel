import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Input, PageHeader, message, Modal } from "antd";

import api from "../../utils/appApi";
import { UploadFile } from "../../components";
import { useMutation, useQuery, useQueryClient } from "react-query";
import TextEditor from "../../components/TextEditor";

const TipOfTheDayPage = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tip-of-the-day"], queryFn: api.tipOfTheDay.getAll });

  const mutation = useMutation({
    mutationFn: api.tipOfTheDay.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-of-the-day"] });
    },
  });

  console.log(query.data);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFormSubmit = useCallback(
    async (values) => {
      console.log(values);
      const { image, ...restValues } = values;
      let upload_id = null;

      try {
        const { data } = await api.upload.file(image[0]?.originFileObj);
        upload_id = data?.data?.id;

        // mutation.mutate({ ...restValues, upload_id, send_at: null, created_by: null });
        mutation.mutate({ ...restValues, upload_id, send_at: null, created_by: null });

        console.log({ ...restValues, upload_id });
        // await dispatch(createMedicalCentre({ upload_id, ...restValues }));

        message.success("Centru medical creat cu succes!");
        form.resetFields();
      } catch (error) {
        message.error("A apărut o eroare la crearea de centru medical.");
      }
    },
    [dispatch, form]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    form.submit();
    // setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <PageHeader
        className="site-page-header"
        title="Sfatul zilei"
        extra={[
          <Button key="medical-centre-add" type="primary" onClick={() => setIsModalOpen(true)}>
            Adaugă
          </Button>,
        ]}
      />

      <Modal title="Adaugă sfatul zilei " open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form layout="vertical" form={form} onFinish={onFormSubmit}>
          <Form.Item name="image" label="Imagine" rules={[{ required: true }]} valuePropName="fileList">
            <UploadFile listType="picture" />
          </Form.Item>

          <Form.Item name="title" label="Titlu" rules={[{ required: true }]}>
            <Input placeholder="title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Conținut"
            valuePropName="value"
            getValueFromEvent={(content) => content}
            rules={[{ required: true }]}
          >
            <TextEditor />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TipOfTheDayPage;
