import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  PageHeader,
  message,
  Modal,
  Table,
  Avatar,
  Space,
  Select,
  DatePicker,
  Popconfirm,
} from "antd";

import api from "../../../utils/appApi";
import { UploadFile } from "../../../components";
import { useMutation, useQuery, useQueryClient } from "react-query";
import TextEditor from "../../../components/TextEditor";
import moment from "moment";
import { useToggle } from "react-use";
import { QUERY_KEYS } from "../../../utils/queryKeys";
import PropTypes from "prop-types";
import { DoctorSelect } from "./DoctorSelect";

export const EditModal = ({ id, onClose }) => {
  const queryClient = useQueryClient();
  const [showModal, toggleModal] = useToggle(false);

  const { data: totd } = useQuery({
    queryKey: [QUERY_KEYS.TIP_OF_THE_DAY, id],
    queryFn: () => api.tipOfTheDay.getById(id),
    enabled: !!id,
  });

  const updateTotd = useMutation({
    mutationFn: api.tipOfTheDay.update,
  });

  useEffect(() => {
    if (id) {
      toggleModal(true);
    }
  }, [id]);

  const [form] = Form.useForm();

  const onFormSubmit = useCallback(
    async (values) => {
      if (!id) return;

      const { image, send_at, created_by, ...restValues } = values;
      let upload_id = totd?.data?.image?.id;

      try {
        if (image[0]) {
          const { data } = await api.upload.file(image[0]?.originFileObj);
          upload_id = data?.data?.id;
        }

        updateTotd.mutate(
          {
            id,
            data: {
              upload_id,
              created_by: created_by || null,
              send_at: send_at ? moment(send_at).format("YYYY-MM-DD HH:mm") : null,
              ...restValues,
            },
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
              message.success("Sfatul zilei actualizat cu succes!");
              handleCloseModal();
            },

            onError: () => message.error("A apărut o eroare la actualizare de sfatul zilei."),
          }
        );
      } catch (error) {
        message.error("A apărut o eroare la actualizare de sfatul zilei.");
      }
    },
    [id, totd]
  );

  function handleCloseModal() {
    toggleModal(false);
    form.resetFields();
    onClose();
  }

  useEffect(() => {
    if (totd?.data) {
      form.setFields([
        { name: "title", value: totd?.data?.title },
        { name: "content", value: totd?.data?.content },
        { name: "send_at", value: totd?.data?.send_at ? moment.utc(totd?.data?.send_at) : null },
        { name: "created_by", value: totd?.data?.created_by?.id },
        { name: "image", value: [] },
      ]);
    }
  }, [totd, form]);

  return (
    <Modal
      title={`Editare sfatul zilei #${id}`}
      open={showModal}
      onOk={form.submit}
      onCancel={handleCloseModal}
      confirmLoading={updateTotd?.isLoading}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFormSubmit}
        onValuesChange={(changedValues) => {
          if (changedValues.content !== undefined) {
            form.setFieldsValue({ content: changedValues.content });
          }
        }}
      >
        <Form.Item
          name="image"
          label="Imagine"
          rules={[
            {
              required: true,
              validator: (_, value) => {
                if ((value && value.length > 0) || totd?.data?.image) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Imaginea este obligatorie."));
              },
            },
          ]}
          valuePropName="fileList"
        >
          <UploadFile defaultPreview={totd?.data?.image?.url || ""} />
        </Form.Item>

        <Form.Item name="title" label="Titlu" rules={[{ required: true }]}>
          <Input placeholder="title" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Conținut"
          rules={[{ required: true, message: "Introduceți conținutul" }]}
          getValueProps={(value) => ({ value })}
        >
          <TextEditor />
        </Form.Item>

        <div className="tw-grid tw-grid-cols-2 tw-gap-5">
          <Form.Item name="send_at" label="Data și ora trimiterii" rules={[{ required: false }]}>
            <DatePicker
              className="tw-w-full"
              showToday={false}
              showNow={false}
              disabledDate={(current) => current && current < moment()}
              showTime={{ format: "HH:mm", showSecond: false }}
              format="DD MMMM YYYY, HH:mm"
            />
          </Form.Item>

          <Form.Item name="created_by" label="Creat de" rules={[{ required: false }]}>
            <DoctorSelect defaultOption={totd?.data?.created_by} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

EditModal.propTypes = {
  id: PropTypes.number,
  onClose: PropTypes.func,
};
