import { Alert, Typography, Input, Space, Button, Tag, Avatar, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMount, useSessionStorage, useUnmount } from "react-use";
import { DcTable } from "../components";
import { getLogsList, setCleanOnUnmountTrue, cleanLogsList } from "../store/actions/logsAction";
import date from "../utils/date";
import { SearchOutlined, ReloadOutlined, UserOutlined } from "@ant-design/icons";

const initialState = {
  page: 1,
  sort_column: "created_at",
  sort_direction: "descend",
  search: "",
};

const tableStateKey = "logs-list-state";

export default function LogsList() {
  const [state, setState] = useSessionStorage(tableStateKey, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logs, cleanOnUnmount } = useSelector((store) => ({
    logs: store.logsList.payload,
    cleanOnUnmount: store.logsList.cleanOnUnmount,
  }));
  const dispatch = useDispatch();

  const fetcher = useCallback(async () => {
    const { page, sort_column, sort_direction, search } = state;

    setLoading(true);

    try {
      await dispatch(getLogsList({ page, sort_column, sort_direction, search }));
    } catch (error) {
      if (error.response?.status === 500) {
        setError({
          status: error.response.status,
          message: error.response.data.message,
        });
        sessionStorage.removeItem(tableStateKey);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, state]);

  useEffect(fetcher, [fetcher]);

  useMount(() => {
    dispatch(setCleanOnUnmountTrue());
  });

  useUnmount(() => {
    if (cleanOnUnmount) {
      sessionStorage.removeItem(tableStateKey);
      dispatch(cleanLogsList());
    }
  });

  const onTableChange = useCallback(
    (pagination, filters, sorter) => {
      const newState = { ...state };

      newState.page = pagination.current;
      
      if (sorter && sorter.field && sorter.field === 'created_at') {
        newState.sort_column = sorter.field;
        newState.sort_direction = sorter.order;
      }

      setState(newState);
    },
    [setState, state]
  );

  const handleSearch = useCallback((e) => {
    setState(prev => ({ ...prev, search: e.target.value, page: 1 }));
  }, [setState]);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, [setState]);

  const getActionTypeTag = (type) => {
    const typeMap = {
      'vacation': { color: 'blue', text: 'Vacanță' },
      'login': { color: 'green', text: 'Autentificare' },
      'logout': { color: 'orange', text: 'Deconectare' },
      'create': { color: 'cyan', text: 'Creare' },
      'update': { color: 'purple', text: 'Actualizare' },
      'delete': { color: 'red', text: 'Ștergere' },
      'topup': { color: 'lime', text: 'Suplinire' },
      'withdraw': { color: 'magenta', text: 'Retragere' },
    };
    
    return typeMap[type] || { color: 'default', text: type };
  };

  const getAreaTag = (area) => {
    const areaMap = {
      'global': { color: 'geekblue', text: 'Global' },
      'calendar': { color: 'gold', text: 'Calendar' },
    };
    
    return areaMap[area] || { color: 'default', text: area };
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        width: 70,
      },
      {
        title: "Utilizator",
        dataIndex: "user",
        width: 180,
        render: (user) => (
          user ? (
            <Space>
              <Avatar size="small" src={user.avatar === "default.png" ? null : user.avatar} icon={<UserOutlined />} />
              <Typography.Text ellipsis>{user.name}</Typography.Text>
            </Space>
          ) : "-"
        ),
      },
      {
        title: "Tip",
        dataIndex: "type",
        width: 110,
        render: (type) => {
          const tag = getActionTypeTag(type);
          return <Tag color={tag.color}>{tag.text}</Tag>;
        },
      },
      {
        title: "Zonă",
        dataIndex: "area",
        width: 100,
        render: (area) => {
          const tag = getAreaTag(area);
          return <Tag color={tag.color}>{tag.text}</Tag>;
        },
      },
      {
        title: "Acțiune",
        dataIndex: "action",
        render: (action) => (
          <Typography.Paragraph
            className="mb-0"
            ellipsis={{ rows: 3, expandable: true, symbol: "Vezi mai mult" }}
            style={{ maxWidth: 500, cursor: 'pointer' }}
          >
            {action}
          </Typography.Paragraph>
        ),
      },
      {
        title: "Dispozitiv / IP",
        dataIndex: "agent",
        width: 180,
        render: (agent, record) => {
          // Extract browser and device info
          let browserInfo = "Browser necunoscut";
          
          if (agent.includes("Chrome")) {
            browserInfo = "Chrome";
          } else if (agent.includes("Safari")) {
            browserInfo = "Safari";
          } else if (agent.includes("Firefox")) {
            browserInfo = "Firefox";
          } else if (agent.includes("Edge")) {
            browserInfo = "Edge";
          }
          
          let deviceInfo = "Desktop";
          if (agent.includes("Android")) {
            deviceInfo = "Android";
          } else if (agent.includes("iPhone") || agent.includes("iPad")) {
            deviceInfo = "iOS";
          }
          
          return (
            <Tooltip title={agent}>
              <Space direction="vertical" size={0}>
                <Typography.Text>{browserInfo} ({deviceInfo})</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.ip}</Typography.Text>
              </Space>
            </Tooltip>
          );
        },
      },
      {
        title: "Data",
        dataIndex: "created_at",
        sorter: true,
        width: 140,
        render: (rowData) => date(rowData).full,
      },
    ],
    []
  );

  if (error) {
    return <Alert showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }

  return (
    <>
      <div className="mb-4">
        <Space>
          <Input
            placeholder="Caută în jurnale..."
            value={state.search}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Resetează
          </Button>
        </Space>
      </div>
      <DcTable
        dataColumns={columns}
        dataSource={logs?.data || []}
        loading={loading}
        onTabelChange={onTableChange}
        pagination={{
          position: ["bottomRight"],
          per_page: logs?.per_page,
          total: logs?.total,
          current_page: logs?.current_page,
        }}
      />
    </>
  );
}
