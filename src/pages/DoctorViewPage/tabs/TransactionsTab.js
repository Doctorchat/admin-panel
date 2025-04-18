import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Typography, Card, Badge, Tooltip } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  MobileOutlined,
  LaptopOutlined,
  DollarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import api from '../../../utils/appApi';
import date from '../../../utils/date';
import useTableState from "../../../hooks/usePaginatedQueryState";

const { Text } = Typography;

const TYPE_LABELS = {
  'top_up': 'Încărcare',
  'incoming': 'Încasare',
  'outgoing': 'Cheltuială',
  'withdraw': 'Retragere',
  'referral_reward': 'Bonus referral',
  'refund': 'Restituire',
  'bonus': 'Bonus'
};

const CATEGORY_LABELS = {
  'balance': 'Balanță',
  'message': 'Consultație',
  'upload': 'Investigații',
  'referral_reward': 'Referral'
};

const STATUS_COLORS = {
  'pending': 'processing',
  'success': 'success',
  'cancel': 'error'
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'top_up':
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    case 'incoming':
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    case 'outgoing':
      return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    case 'withdraw':
      return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    case 'referral_reward':
      return <GiftOutlined style={{ color: '#722ed1' }} />;
    case 'refund':
      return <ArrowUpOutlined style={{ color: '#faad14' }} />;
    case 'bonus':
      return <GiftOutlined style={{ color: '#1890ff' }} />;
    default:
      return <DollarOutlined />;
  }
};

export default function TransactionsTab() {
  const { doc_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Correct usage of useTableState hook
  const { page, setPage, onTableChange } = useTableState("doctor-transactions");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, [doc_id, page, pageSize]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        page: page,
        per_page: pageSize
      };
      
      // Use the API endpoint for doctor transactions
      const response = await api.stats.getUserTransactions(doc_id, params);
      
      setTransactions(response.data.data);
      setTotalTransactions(response.data.total);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAmountWithSign = (type, amount, currency) => {
    const isPositive = ['top_up', 'incoming', 'referral_reward', 'refund', 'bonus'].includes(type);
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? '#52c41a' : '#f5222d';
    
    return (
      <Text style={{ color, fontWeight: 600 }}>
        {sign} {amount} {currency}
      </Text>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => date(text).full
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {getTypeIcon(text)}
          {TYPE_LABELS[text] || text}
        </div>
      )
    },
    {
      title: 'Categorie',
      dataIndex: 'category',
      key: 'category',
      render: (text) => CATEGORY_LABELS[text] || text
    },
    {
      title: 'Suma',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => getAmountWithSign(record.type, amount, record.currency)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Badge 
          status={STATUS_COLORS[text]} 
          text={
            text === 'success' ? 'Succes' : 
            text === 'pending' ? 'În așteptare' : 
            text === 'cancel' ? 'Anulat' : text
          } 
        />
      )
    },
    {
      title: 'Sursă',
      dataIndex: 'app',
      key: 'app',
      render: (app) => (
        <Tooltip title={app ? "Aplicație mobilă" : "Website"}>
          {app ? <MobileOutlined /> : <LaptopOutlined />}
        </Tooltip>
      )
    }
  ];

  return (
    <div className="transactions-tab">
      <Card className="transactions-card">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          onChange={onTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalTransactions,
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