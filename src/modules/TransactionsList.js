import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { 
  Table, 
  Card, 
  Alert, 
  Typography, 
  Badge, 
  Tooltip, 
  Space
} from "antd";
import { 
  MobileOutlined,
  LaptopOutlined,
  LinkOutlined
} from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import date from "../utils/date";
import api from "../utils/appApi";
import useTableState from "../hooks/usePaginatedQueryState";
import "./styles/transactions-list.scss";

const { Text } = Typography;

// Remove unused constants

const STATUS_COLORS = {
  'pending': 'processing',
  'success': 'success',
  'cancel': 'error',
  'paid': 'success',
  'unpaid': 'warning',
  'canceled': 'error'
};

// Remove unused function

export default function TransactionsList(props) {
  const { simplified, title, extra } = props;
  const { page, sortColumn, sortDirection, setPage, onTableChange } = useTableState("transactions-list");
  const [pageSize, setPageSize] = useState(simplified ? 10 : 20);

  // Fetch transactions data
  const {
    data: transactions,
    isLoading,
    isError
  } = useQuery(["transactions", page, pageSize, sortColumn, sortDirection], () =>
    api.stats.getTransactions({
      page,
      per_page: pageSize,
      sort_column: sortColumn,
      sort_direction: sortDirection === "ascend" ? "asc" : "desc"
    })
  );

  // Remove unused function

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: sortColumn === "id" && sortDirection,
      width: 80
    },
    {
      title: "Suma",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <Text style={{ 
          color: parseFloat(record.from_balance) > 0 ? '#f5222d' : '#52c41a', 
          fontWeight: 600 
        }}>
          {parseFloat(record.from_balance) > 0 ? '-' : '+'} {amount} {record.currency}
        </Text>
      )
    },
    {
      title: "Din cont",
      dataIndex: "from_balance",
      key: "from_balance",
      render: (value, record) => `${value} ${record.currency}`
    },
    {
      title: "Card",
      dataIndex: "card",
      key: "card",
      render: (text) => text || "—"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Badge 
          status={STATUS_COLORS[text]} 
          text={
            text === 'success' || text === 'paid' ? 'Succes' : 
            text === 'pending' || text === 'unpaid' ? 'În așteptare' : 
            text === 'cancel' || text === 'canceled' ? 'Anulat' : text
          } 
        />
      )
    },
    {
      title: "Chat",
      dataIndex: "chat",
      key: "chat",
      render: (chatId) => (
        chatId ? (
          <Link to={`/chat/${chatId}`}>
            <Space>
              <LinkOutlined />
              {chatId}
            </Space>
          </Link>
        ) : (
          "—"
        )
      )
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
      render: (ip) => ip || "—"
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (text) => date(text).full,
      width: 150
    }
  ];

  if (simplified) {
    // Remove some columns for simplified view
    columns.splice(2, 3); // Remove "Din cont", "Card" and "Sursă" columns
  }

  // Process data to ensure we're always working with an array
  const processedData = React.useMemo(() => {
    if (!transactions || isError) return [];
    
    // If the API returns data with a nested data property
    if (transactions.data && Array.isArray(transactions.data)) {
      return transactions.data;
    }
    
    // If the API returns data directly as an array
    if (Array.isArray(transactions)) {
      return transactions;
    }
    
    // If we have non-array data, log it and return empty array
    console.warn('Unexpected data format in TransactionsList:', transactions);
    return [];
  }, [transactions, isError]);

  // Calculate total count based on response format
  const totalCount = React.useMemo(() => {
    if (!transactions || isError) return 0;
    
    if (typeof transactions.total === 'number') {
      return transactions.total;
    }
    
    if (transactions.pagination && typeof transactions.pagination.total === 'number') {
      return transactions.pagination.total;
    }
    
    if (transactions.meta && typeof transactions.meta.total === 'number') {
      return transactions.meta.total;
    }
    
    return processedData.length;
  }, [transactions, processedData, isError]);
  
  if (isError) {
    return <Alert className="mt-5" showIcon type="error" message="Error" description="A apărut o eroare!" />;
  }
  
  return (
    <div className="transactions-list-container">
      <Card className="transactions-card" title={title} extra={extra}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={processedData}
          loading={isLoading}
          onChange={(pagination, filters, sorter) => {
            // Handle sorting in onTableChange
            if (sorter && sorter.order) {
              onTableChange(pagination, filters, sorter);
            }
          }}
          pagination={{
            position: [simplified ? "none" : "bottomRight"],
            current: page,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: !simplified,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} tranzacții`,
            onChange: (currentPage, currentPageSize) => {
              setPage(currentPage);
              setPageSize(currentPageSize);
            }
          }}
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => 
            record.status === 'canceled' || record.status === 'cancel' ? 'canceled-transaction-row' : ''
          }
        />
      </Card>
    </div>
  );
}

TransactionsList.propTypes = {
  simplified: PropTypes.bool,
  title: PropTypes.string,
  extra: PropTypes.element,
};