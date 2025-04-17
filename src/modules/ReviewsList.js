import PropTypes from "prop-types";
import { Alert, Button, Drawer, Form, Input, notification, Select, Space, Tag, Tooltip, Rate } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useMount, useSessionStorage, useUnmount } from "react-use";
import { DcTable } from "../components";
import {
  cleanReviewsList,
  getReviewsList,
  setCleanOnUnmountFalse,
  setCleanOnUnmountTrue,
  updateReivew,
} from "../store/actions/reviewsListAction";
import date from "../utils/date";
import api from "../utils/appApi";
import { EditOutlined, EyeOutlined, UserOutlined, MedicineBoxOutlined, MessageOutlined, CalendarOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';

const initialState = {
  page: 1,
  sort_column: "id",
  sort_direction: "descend",
};

export const reviewStatuses = {
  0: "Ascuns pentru toți",
  1: "Vizibil pentru doctor",
  2: "Vizibil in chat pentru clienți",
  3: "Vizibil peste tot",
};

const tableStateKey = "reviews-list-state";

export default function ReviewsList(props) {
  const { simplified, title, extra } = props;

  const limit = simplified ? 10 : 20;

  const [state, setState] = useSessionStorage(tableStateKey, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeReview, setActiveReview] = useState(null);
  const [open, setOpen] = useState(false);

  const { reviews, cleanOnUnmount } = useSelector((store) => ({
    reviews: store.reviewsList.payload,
    cleanOnUnmount: store.reviewsList.cleanOnUnmount,
  }));
  const [form] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  function fetchReviewsList(page, sort_column, sort_direction) {
    try {
      dispatch(getReviewsList({ page, sort_column, sort_direction, limit }));
    } catch (error) {
      if (error.response.status === 500) {
        setError({
          status: error.response.status,
          message: error.response.data.message,
        });
        sessionStorage.removeItem(tableStateKey);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { page, sort_column, sort_direction } = state;

    setLoading(true);

    fetchReviewsList(page, sort_column, sort_direction);
  }, [dispatch, error, simplified, state]);

  useMount(() => {
    dispatch(setCleanOnUnmountTrue());
  });

  useUnmount(() => {
    if (cleanOnUnmount) {
      sessionStorage.removeItem(tableStateKey);
      dispatch(cleanReviewsList());
    }
  });

  const onTableChange = useCallback(
    (pagination) => {
      const newState = { ...state };

      newState.page = pagination.current;

      setState(newState);
    },
    [setState, state]
  );

  const onTableLinksClick = useCallback(
    (path) => async (e) => {
      e.preventDefault();

      await dispatch(setCleanOnUnmountFalse());
      history.push(path);
    },
    [dispatch, history]
  );

  const onViewReview = useCallback(
    (review) => () => {
      setActiveReview(review);
      setOpen(true);
    },
    []
  );

  const onCloseReview = useCallback(() => {
    setActiveReview(null);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (activeReview && Object.keys(activeReview).length) {
      form.setFields([
        { name: "content", value: activeReview.content },
        { name: "visibility", value: activeReview.visibility },
        { name: "like", value: activeReview.like },
      ]);
    } else {
      form.resetFields();
    }
  }, [activeReview, form]);

  const onReviewEdit = useCallback(
    async (values) => {
      const data = { ...values };

      data.id = activeReview.id;
      // Convert boolean like to 1/0 for API
      data.like = data.like ? 1 : 0;

      try {
        const res = await api.reviews.update(data);
        dispatch(updateReivew(res.data));

        fetchReviewsList(state.page, state.sort_column, state.sort_direction);

        notification.success({ 
          message: "Succes", 
          description: "Testimonialul a fost actualizat cu succes" 
        });
        onCloseReview();
      } catch (error) {
        notification.error({ message: "Eroare", description: "A apărut o eroare" });
      }
    },
    [activeReview, dispatch, onCloseReview, state]
  );

  const getStatusTag = (visibility) => {
    const statusColors = {
      0: "red",
      1: "blue",
      2: "purple",
      3: "green",
    };
    
    return (
      <Tag color={statusColors[visibility]}>
        {reviewStatuses[visibility]}
      </Tag>
    );
  };

  const columns = useMemo(
    () => [
      { 
        title: "ID", 
        dataIndex: "id",
        width: 70, 
      },
      {
        title: "Client",
        dataIndex: "user",
        render: (rowData) => (
          <div>
            <Space>
              <div className="tw-w-8 tw-h-8 tw-rounded-full tw-overflow-hidden tw-bg-gray-200">
                <img 
                  src={rowData?.avatar} 
                  alt={rowData?.name} 
                  className="tw-w-full tw-h-full tw-object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23CCC' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <a href={`/user/${rowData?.id}`} 
                onClick={onTableLinksClick(`/user/${rowData?.id}`)}
                className="tw-font-medium tw-text-blue-600 hover:tw-text-blue-800">
                {rowData?.name}
              </a>
            </Space>
          </div>
        ),
      },
      {
        title: "Doctor",
        dataIndex: "doctor",
        render: ({ name, id, avatar }) => (
          <div>
            <Space>
              <div className="tw-w-8 tw-h-8 tw-rounded-full tw-overflow-hidden tw-bg-gray-200">
                <img 
                  src={avatar} 
                  alt={name} 
                  className="tw-w-full tw-h-full tw-object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23CCC' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <a href={`/doctor/${id}`} 
                onClick={onTableLinksClick(`/doctor/${id}`)}
                className="tw-font-medium tw-text-blue-600 hover:tw-text-blue-800">
                {name}
              </a>
            </Space>
          </div>
        ),
      },
      {
        title: "Conținut",
        dataIndex: "content",
        render: (content) => (
          <div className="tw-max-w-xs tw-overflow-hidden tw-text-ellipsis">
            <Tooltip title={content}>
              <span className="tw-line-clamp-2">{content}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Evaluare",
        dataIndex: "like",
        width: 120,
        render: (like) => (
          <div className="tw-flex tw-items-center">
            {like ? 
              <Tag icon={<LikeOutlined />} color="success">Pozitivă</Tag> : 
              <Tag icon={<DislikeOutlined />} color="error">Negativă</Tag>
            }
          </div>
        ),
        filters: [
          { text: 'Pozitivă', value: true },
          { text: 'Negativă', value: false },
        ],
        onFilter: (value, record) => record.like === value,
      },
      {
        title: "Conversație",
        dataIndex: "chat_id",
        width: 120,
        render: (rowData) => (
          <Tooltip title="Deschide conversația">
            <Button 
              type="link" 
              icon={<MessageOutlined />} 
              onClick={onTableLinksClick(`/chat/${rowData}`)}
              className="tw-flex tw-items-center">
              #{rowData}
            </Button>
          </Tooltip>
        ),
      },
      {
        title: "Data",
        dataIndex: "created_at",
        width: 180,
        render: (rowData) => (
          <div className="tw-flex tw-items-center tw-gap-2">
            <CalendarOutlined className="tw-text-gray-500" />
            <span>{date(rowData).full}</span>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "visibility",
        width: 180,
        render: (visibility) => getStatusTag(visibility),
        filters: [
          { text: reviewStatuses[0], value: 0 },
          { text: reviewStatuses[1], value: 1 },
          { text: reviewStatuses[2], value: 2 },
          { text: reviewStatuses[3], value: 3 },
        ],
        onFilter: (value, record) => record.visibility === value,
      },
      {
        title: "Acțiuni",
        key: "actions",
        width: 120,
        fixed: 'right',
        render: (_, row) => (
          <Space size="small">
            <Tooltip title="Vizualizează">
              <Button 
                type="primary" 
                icon={<EyeOutlined />} 
                onClick={onViewReview(row)}
                className="tw-flex tw-items-center tw-justify-center"
                size="middle"
              />
            </Tooltip>
            <Tooltip title="Editează">
              <Button 
                type="default" 
                icon={<EditOutlined />} 
                onClick={onViewReview(row)}
                className="tw-flex tw-items-center tw-justify-center"
                size="middle"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [onTableLinksClick, onViewReview]
  );


  if (error) {
    return (
      <Alert 
        showIcon 
        type="error" 
        message="Eroare" 
        description="A apărut o eroare la încărcarea datelor!" 
        className="tw-mb-4"
      />
    );
  }

  return (
    <>
      <Drawer 
        open={open} 
        placement="right" 
        onClose={onCloseReview} 
        title={
          <div className="tw-flex tw-items-center tw-gap-2">
            <span className="tw-text-lg tw-font-semibold">Gestionare testimonial</span>
            {activeReview && (
              <Tag color={activeReview.like ? "success" : "error"}>
                {activeReview.like ? "Pozitiv" : "Negativ"}
              </Tag>
            )}
          </div>
        } 
        width={520}
        destroyOnClose
        className="reviews-drawer"
        headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
        bodyStyle={{ padding: '24px' }}
        footerStyle={{ borderTop: '1px solid #f0f0f0', padding: '16px 24px' }}
        footer={
          <div className="tw-flex tw-justify-end">
            <Button onClick={onCloseReview} className="tw-mr-2">
              Anulează
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Salvează
            </Button>
          </div>
        }
      >
        {activeReview && (
          <div>
            <div className="tw-flex tw-justify-between tw-items-start tw-mb-6">
              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-lg tw-w-full">
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <div className="tw-flex tw-items-center">
                    <div className="tw-mr-3">
                      <div className="tw-w-12 tw-h-12 tw-rounded-full tw-overflow-hidden tw-border-2 tw-border-white tw-shadow">
                        <img 
                          src={activeReview.user?.avatar} 
                          alt={activeReview.user?.name}
                          className="tw-w-full tw-h-full tw-object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='%23CCC' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="tw-font-medium">{activeReview.user?.name}</div>
                      <a href={`/user/${activeReview.user?.id}`} 
                        onClick={onTableLinksClick(`/user/${activeReview.user?.id}`)}
                        className="tw-text-sm tw-text-blue-600">
                        Vezi profil
                      </a>
                    </div>
                  </div>
                  <div>
                    <Tag color={activeReview.like ? "success" : "error"} className="tw-px-3 tw-py-1 tw-text-sm">
                      {activeReview.like ? "Pozitiv" : "Negativ"}
                    </Tag>
                  </div>
                </div>
                
                <div className="tw-border-t tw-border-gray-200 tw-pt-3">
                  <div className="tw-flex tw-justify-between tw-mb-3">
                    <span className="tw-text-gray-500 tw-text-sm">ID: #{activeReview.id}</span>
                    <span className="tw-text-gray-500 tw-text-sm">{date(activeReview.created_at).full}</span>
                  </div>
                  
                  <div className="tw-p-3 tw-bg-white tw-rounded-md tw-border tw-border-gray-200 tw-mb-4">
                    <div className="tw-text-gray-800">{activeReview.content}</div>
                  </div>
                  
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-8 tw-h-8 tw-rounded-full tw-overflow-hidden tw-mr-2">
                        <img 
                          src={activeReview.doctor?.avatar} 
                          alt={activeReview.doctor?.name}
                          className="tw-w-full tw-h-full tw-object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23CCC' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <div className="tw-text-sm tw-font-medium">{activeReview.doctor?.name}</div>
                        <a href={`/doctor/${activeReview.doctor?.id}`} 
                          onClick={onTableLinksClick(`/doctor/${activeReview.doctor?.id}`)}
                          className="tw-text-xs tw-text-blue-600">
                          Vezi profil
                        </a>
                      </div>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <MessageOutlined className="tw-mr-1 tw-text-blue-500" />
                      <a href={`/chat/${activeReview.chat_id}`} 
                        onClick={onTableLinksClick(`/chat/${activeReview.chat_id}`)}
                        className="tw-text-sm tw-text-blue-600">
                        Conversație #{activeReview.chat_id}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="tw-mb-6">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                <h3 className="tw-text-base tw-font-medium">Administrare testimonial</h3>
                {getStatusTag(activeReview.visibility)}
              </div>
              
              <Form className="testimonials-form" layout="vertical" form={form} onFinish={onReviewEdit}>
                <Form.Item 
                  label="Evaluare"
                  name="like"
                  rules={[{ required: true, message: 'Evaluarea este obligatorie' }]}
                >
                  <Select
                    placeholder="Selectați tipul de evaluare"
                    className="tw-w-full"
                    options={[
                      { value: true, label: "Pozitivă" },
                      { value: false, label: "Negativă" },
                    ]}
                  />
                </Form.Item>
              
                <Form.Item 
                  label="Conținut testimonial" 
                  name="content" 
                  rules={[{ required: true, message: 'Conținutul este obligatoriu' }]}
                >
                  <Input.TextArea 
                    autoSize={{ minRows: 4, maxRows: 10 }} 
                    className="tw-border tw-border-gray-300 tw-rounded-md"
                    placeholder="Introduceți conținutul testimonialului..."
                  />
                </Form.Item>
                
                <Form.Item 
                  label="Vizibilitate" 
                  name="visibility"
                  rules={[{ required: true, message: 'Vizibilitatea este obligatorie' }]}
                >
                  <Select
                    placeholder="Selectați vizibilitatea"
                    className="tw-w-full"
                    options={[
                      { value: 0, label: "Ascuns pentru toți" },
                      { value: 1, label: "Vizibil pentru doctor" },
                      { value: 2, label: "Vizibil in chat pentru clienți" },
                      { value: 3, label: "Vizibil peste tot" },
                    ]}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Drawer>

      <div className="tw-mb-6 tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-4">
        <div className="tw-flex tw-justify-between tw-items-center">
          <h3 className="tw-text-lg tw-font-semibold tw-text-gray-800">Testimoniale</h3>
          <div className="tw-bg-blue-50 tw-rounded-lg tw-px-4 tw-py-2 tw-border tw-border-blue-100">
            <div className="tw-text-sm tw-text-gray-500">Total</div>
            <div className="tw-font-bold tw-text-blue-600">{reviews?.total || 0}</div>
          </div>
        </div>
      </div>

      <DcTable
        title={title}
        dataColumns={columns}
        dataSource={reviews?.data || []}
        loading={loading}
        onTabelChange={onTableChange}
        rowClassName={(row) => 
          `tw-transition-colors ${row.like ? "review-like" : "review-dislike"}`
        }
        pagination={{
          position: [simplified ? "none" : "bottomRight"],
          per_page: reviews?.per_page,
          total: reviews?.total,
          current_page: reviews?.current_page,
        }}
        scroll={{ x: 1200 }}
        extra={extra}
      />
    </>
  );
}

ReviewsList.propTypes = {
  simplified: PropTypes.bool,
  title: PropTypes.string,
  extra: PropTypes.element,
};
