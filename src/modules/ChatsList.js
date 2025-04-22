import { Alert, Button, PageHeader, Table, Tag } from "antd";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useMount, useSessionStorage, useUnmount } from "react-use";
import { DcTable } from "../components";
import {
  cleanChatsList,
  getChatsList,
  setCleanOnUnmountFalse,
  setCleanOnUnmountTrue,
} from "../store/actions/chatsListAction";
import date from "../utils/date";

const initialState = {
  page: 1,
  sort_column: "id",
  sort_direction: "descend",
};

export const chatStatuses = {
  initied: { color: "blue", text: "Inițializat" },
  open: { color: "orange", text: "În așteptare" },
  closed: { color: "", text: "Arhivat" },
  responded: { color: "green", text: "Răspuns primit" },
  unpaid: { color: "red", text: "Achitare" },
  overdue: { color: "#dc3545", text: "Overdue" },
};

export const chatTypes = {
  standard: <Tag>Standard</Tag>,
  consilium: <Tag color="#FFD700">Consiliu</Tag>,
  auto: <Tag>Auto</Tag>,
  meet: <Tag color="#34a853">Meeting</Tag>,
  internal: <Tag color="blue">Intern</Tag>,
};

export const getChatStatus = (chat) => {
  const tags = [chat.status];

  if (chat.isOverdue) tags.push("overdue");

  return tags.map((status) => (
    <Tag key={`${chat.id}-${chatStatuses[status].color}`} color={chatStatuses[status].color}>
      {chatStatuses[status].text}
    </Tag>
  ));
};

export const getChatType = (chat) => {
  if (chat.isMeet) {
    return chatTypes.meet;
  }

  if (chat.type === "auto" && chat.doctor.id === 1) {
    return <Tag color="#ff4d4f">Auto</Tag>;
  }

  return chatTypes[chat.type];
};

const tableStateKey = "chats-list-state";

export default function ChatsList(props) {
  const { simplified, title, extra } = props;
  const [state, setState] = useSessionStorage(tableStateKey, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { chats, cleanOnUnmount } = useSelector((store) => ({
    chats: store.chatsList.payload,
    cleanOnUnmount: store.chatsList.cleanOnUnmount,
  }));
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const { page, sort_column, sort_direction } = state;
    const limit = simplified ? 10 : 20;
    const params = new URLSearchParams(window.location.search);

    const internal = {};
    if (params.has("internal")) internal.internal = true;

    setLoading(true);

    dispatch(getChatsList({ page, sort_column, sort_direction, limit, ...internal }))
      .catch(() => {
        if (error.response.status === 500) {
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
  }, [dispatch, error, simplified, state]);

  useMount(() => {
    dispatch(setCleanOnUnmountTrue());
  });

  useUnmount(() => {
    if (cleanOnUnmount) {
      sessionStorage.removeItem(tableStateKey);
      dispatch(cleanChatsList());
    }
  });

  const onTableChange = useCallback(
    (pagination, _, sorter) => {
      const newState = { ...state };

      if (pagination && pagination.current) {
        newState.page = pagination.current;
      }

      if (sorter && sorter.order) {
        newState.sort_column = sorter.field;
        newState.sort_direction = sorter.order;
      }

      setState(newState);
    },
    [setState, state],
  );

  const onTableLinksClick = useCallback(
    (path) => async (e) => {
      e.preventDefault();

      await dispatch(setCleanOnUnmountFalse());
      history.push(path);
    },
    [dispatch, history],
  );

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id" },
      {
        title: "Doctor",
        dataIndex: "doctor",
        render: ({ id, name }) => (
          <a href={`/doctor/${id}`} onClick={onTableLinksClick(`/doctor/${id}`)}>
            {name}
          </a>
        ),
      },
      {
        title: "Client",
        dataIndex: "client",
        render: ({ id, name }) => (
          <a href={`/user/${id}`} onClick={onTableLinksClick(`/user/${id}`)}>
            {name}
          </a>
        ),
      },
      {
        title: "Regiune",
        dataIndex: "region",
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (_, data) => getChatStatus(data),
      },
      {
        title: "Tipul",
        dataIndex: "type",
        render: (_, data) => getChatType(data),
      },
      {
        title: "Actualizat",
        dataIndex: "updated_at",
        render: (rowData) => date(rowData).full,
      },
      {
        title: "Acțiuni",
        render: (_, row) => (
          <>
            {row.type === "consilium" ? (
              <Button type="primary" size="small" onClick={onTableLinksClick(`/council/${row.id}`)}>
                Vezi chat-ul
              </Button>
            ) : (
              <Button type="primary" size="small" onClick={onTableLinksClick(`/chat/${row.id}`)}>
                Vezi chat-ul
              </Button>
            )}
          </>
        ),
      },
    ],
    [onTableLinksClick],
  );

  if (error) {
    return (
      <Alert className="mt-5" showIcon type="error" message={`Error ${error.status}`} description={error.message} />
    );
  }

  // Render table with fallback mechanism
  const renderTable = () => {
    try {
      return (
        <DcTable
          title={title}
          dataColumns={columns}
          dataSource={chats?.data || []}
          loading={loading}
          onTableChange={onTableChange}
          rowClassName={(row) => row.status === "closed" && "chat-row-closed"}
          pagination={{
            position: [simplified ? "none" : "bottomRight"],
            per_page: chats?.per_page,
            total: chats?.total,
            current_page: chats?.current_page,
          }}
          extra={extra}
        />
      );
    } catch (error) {
      console.error("Error rendering DcTable:", error);
      // Fallback to the original Table component
      return (
        <Table
          bordered
          scroll={{ x: 700 }}
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={chats?.data || []}
          loading={loading}
          pagination={{
            position: [simplified ? "none" : "bottomRight"],
            current: chats?.current_page,
            pageSize: chats?.per_page,
            total: chats?.total,
            showSizeChanger: false,
          }}
          onChange={onTableChange}
          rowClassName={(row) => row.status === "closed" && "chat-row-closed"}
        />
      );
    }
  };

  return (
    <>
      <PageHeader className="site-page-header" title={`Chat-uri (${chats?.total || 0})`} />
      {renderTable()}
    </>
  );
}

ChatsList.propTypes = {
  simplified: PropTypes.bool,
  title: PropTypes.string,
  extra: PropTypes.element,
};
