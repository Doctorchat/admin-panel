import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Typography, Card, Tag, Tooltip, Button } from 'antd';
import { 
  WalletOutlined,
  LinkOutlined,
  MobileOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import api from '../../../utils/appApi';
import date from '../../../utils/date';
import useTableState from "../../../hooks/usePaginatedQueryState";

const { Text } = Typography;

const STATUS_COLORS = {
  'paid': 'success',
  'unpaid': 'warning',
  'canceled': 'error'
};

const STATUS_LABELS = {
  'paid': 'Plătit',
  'unpaid': 'Neplătit',
  'canceled': 'Anulat'
};

const getStatusTag = (status) => {
  const color = STATUS_COLORS[status] || 'default';
  const label = STATUS_LABELS[status] || status;
  
  return <Tag color={color}>{label}</Tag>;
};

// Funcție pentru a trunchia user agent-ul la o versiune mai scurtă
const shortenUserAgent = (userAgent) => {
  if (!userAgent) return '—';
  
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const match = userAgent.match(/iPhone OS (\d+_\d+)/);
    return match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
  }
  
  if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+(\.\d+)?)/);
    return match ? `Android ${match[1]}` : 'Android';
  }
  
  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    return match ? `Chrome ${match[1]}` : 'Chrome';
  }
  
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    return match ? `Firefox ${match[1]}` : 'Firefox';
  }
  
  if (userAgent.includes('Safari')) {
    const match = userAgent.match(/Safari\/(\d+\.\d+)/);
    return match ? `Safari ${match[1]}` : 'Safari';
  }
  
  return userAgent.slice(0, 30) + '...';
};

// Funcție pentru a trunchia ID-ul sesiunii
const shortenSessionId = (sessionId) => {
  if (!sessionId) return '—';
  if (sessionId.length <= 15) return sessionId;
  
  return `${sessionId.substring(0, 10)}...${sessionId.substring(sessionId.length - 5)}`;
};

export default function TopupsTab() {
  const { user_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [topups, setTopups] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { page, setPage, onTableChange } = useTableState("user-topups");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchTopups();
  }, [user_id, page, pageSize]);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page,
        per_page: pageSize
      };
      
      const response = await api.stats.getUserTopups(user_id, params);
      
      setTopups(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Failed to fetch topups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = (transactionId) => {
    if (transactionId) {
      window.open(`/transaction/${transactionId}`, '_blank');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Suma',
      key: 'amount',
      render: (record) => (
        <Text strong>
          {record.amount} {record.currency}
        </Text>
      ),
      width: 100
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (transactionId) => transactionId ? (
        <Button 
          type="link" 
          onClick={() => handleTransactionClick(transactionId)} 
          style={{ padding: 0 }}
          icon={<LinkOutlined />}
        >
          {transactionId}
        </Button>
      ) : '—',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getStatusTag(text),
      width: 100
    },
    {
      title: 'Browser/Dispozitiv',
      key: 'agent',
      dataIndex: 'agent',
      render: (agent) => shortenUserAgent(agent),
      width: 140
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120
    },
    {
      title: 'ID Sesiune',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (sessionId) => (
        <Tooltip title={sessionId}>
          {shortenSessionId(sessionId)}
        </Tooltip>
      ),
      width: 150
    },
    {
      title: 'Sursă',
      dataIndex: 'app',
      key: 'app',
      render: (app) => (
        <Tooltip title={app ? "Aplicație mobilă" : "Website"}>
          {app ? <MobileOutlined /> : <LaptopOutlined />}
        </Tooltip>
      ),
      width: 80
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => date(text).full,
      width: 150
    }
  ];

  return (
    <div className="topups-tab">
      <Card className="topups-card">
        <Table
          columns={columns}
          dataSource={topups}
          rowKey="id"
          loading={loading}
          onChange={onTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onShowSizeChange: (current, size) => {
              setPage(1);
              setPageSize(size);
            }
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}