import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  PageHeader,
  message,
  Modal,
  Avatar,
  Space,
  Select,
  DatePicker,
  Popconfirm,
  Tag,
} from "antd";

import api from "../../utils/appApi";
import { DcTable, UploadFile } from "../../components";
import { useMutation, useQuery, useQueryClient } from "react-query";
import TextEditor from "../../components/TextEditor";
import moment from "moment";
import { useSessionStorage, useToggle } from "react-use";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { EditModal } from "./components/EditModal";
import { DoctorSelect } from "./components/DoctorSelect";

const TipOfTheDayPage = () => {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useSessionStorage("totd-current-page", 1);
  const [showModal, toggleModal] = useToggle(false);
  const [selectedRowData, setSelectedRowData] = useState();

  const { data: totd, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TIP_OF_THE_DAY, currentPage],
    queryFn: () => api.tipOfTheDay.getAll({ page: currentPage }),
  });

  const createTotd = useMutation({
    mutationFn: api.tipOfTheDay.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
    },
  });

  const deleteTotd = useMutation({
    mutationFn: api.tipOfTheDay.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
    },
  });

  const [form] = Form.useForm();

  const onFormSubmit = useCallback(
    async (values) => {
      const { image, send_at, created_by, ...restValues } = values;
      let upload_id = null;

      try {
        const { data } = await api.upload.file(image[0]?.originFileObj);
        upload_id = data?.data?.id;

        createTotd.mutate({
          upload_id,
          created_by: created_by || null,
          send_at: send_at ? moment(send_at).format("YYYY-MM-DD HH:mm") : null,
          ...restValues,
        });

        message.success("Sfatul zilei creat cu succes!");
        form.resetFields();
        toggleModal();
      } catch (error) {
        message.error("A apărut o eroare la crearea de sfatul zilei.");
      }
    },
    [form]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
      },
      {
        title: "Titlu",
        dataIndex: "title",
      },
      {
        title: "Creat de",
        dataIndex: "created_by",
        render: (_, { created_by }) =>
          created_by ? (
            <Space>
              <Avatar src={created_by?.avatar} />
              <span>{created_by?.name}</span>
            </Space>
          ) : (
            <span className="tw-text-gray-400 tw-text-xs">Nu este setat</span>
          ),
      },
      {
        title: "Statut",
        dataIndex: "status",
        render: (_, { status }) => {
          const currentStatus = {
            0: { color: "default", label: "Inactiv" },
            1: { color: "success", label: "Activ" },
          };
          return <Tag color={currentStatus[status]?.color}>{currentStatus[status]?.label}</Tag>;
        },
      },
      {
        title: "Data și ora trimiterii",
        dataIndex: "send_at",
        render: (_, { send_at }) =>
          send_at ? (
            <span>{moment.utc(send_at).format("DD MMMM YYYY, HH:mm")}</span>
          ) : (
            <span className="tw-text-gray-400 tw-text-xs">Nu este setat</span>
          ),
      },
      {
        title: "Acțiuni",
        render: (_, row) => (
          <Space>
            <Button type="primary" size="small" onClick={() => setSelectedRowData(row)}>
              Editează
            </Button>

            <Popconfirm
              title="Ești sigur ca vrei sa ștergi acestă cerere?"
              placement="left"
              okText="Accept"
              cancelText="Anulează"
              onConfirm={() => deleteTotd.mutate(row.id)}
            >
              <Button type="primary" size="small" danger>
                Șterge
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [totd]
  );

  const onTableChange = useCallback(
    (pagination) => {
      setCurrentPage(pagination.current);
    },
    [currentPage, setCurrentPage]
  );

  return (
    <>
      <PageHeader
        className="site-page-header"
        title="Sfatul zilei"
        extra={[
          <Button key="medical-centre-add" type="primary" onClick={toggleModal}>
            Adaugă
          </Button>,
        ]}
      />

      <DcTable
        rowKey="id"
        dataColumns={columns}
        dataSource={totd?.data}
        loading={isLoading}
        onTabelChange={onTableChange}
        pagination={{
          per_page: totd?.meta?.per_page,
          total: totd?.meta?.total,
          current_page: totd?.meta?.current_page,
        }}
      />

      <Modal title="Adaugă sfatul zilei" open={showModal} onOk={form.submit} onCancel={toggleModal}>
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
          <Form.Item name="image" label="Imagine" rules={[{ required: true }]} valuePropName="fileList">
            <UploadFile />
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
              <DoctorSelect />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <EditModal id={selectedRowData?.id} onClose={() => setSelectedRowData(null)} />
    </>
  );
};

export default TipOfTheDayPage;
